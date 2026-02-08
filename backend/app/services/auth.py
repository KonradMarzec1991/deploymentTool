import os
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

import httpx
import jwt
from fastapi import Header, HTTPException
from sqlmodel import Session

from app.models import User

GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")
JWT_SECRET = os.getenv("JWT_SECRET")
FRONTEND_URL = os.getenv("FRONTEND_URL")
BACKEND_URL = os.getenv("BACKEND_URL")

JWT_ALG = "HS256"
JWT_EXPIRES_MINUTES = int(os.getenv("JWT_EXPIRES_MINUTES", "720"))


def create_state() -> str:
    return secrets.token_urlsafe(32)


def create_access_token(user: User) -> str:
    if not JWT_SECRET:
        raise HTTPException(status_code=500, detail="JWT_SECRET is not set")
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user.id),
        "role": user.role,
        "provider": user.provider,
        "login": user.provider_login,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=JWT_EXPIRES_MINUTES)).timestamp()),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


def decode_token(token: str) -> dict:
    try:
        if not JWT_SECRET:
            raise HTTPException(status_code=500, detail="JWT_SECRET is not set")
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=401, detail="invalid token") from exc


def get_current_user(
    session: Session, authorization: Optional[str] = Header(default=None)
) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="missing token")

    token = authorization.removeprefix("Bearer ").strip()
    payload = decode_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="invalid token")

    user = session.get(User, int(user_id))
    if not user or not user.is_active:
        raise HTTPException(status_code=403, detail="user not allowed")

    return user


def require_role(user: User, roles: set[str]) -> None:
    if user.role not in roles:
        raise HTTPException(status_code=403, detail="insufficient role")


async def github_exchange_code(code: str) -> str:
    if not GITHUB_CLIENT_ID or not GITHUB_CLIENT_SECRET or not BACKEND_URL:
        raise HTTPException(status_code=500, detail="github oauth not configured")
    async with httpx.AsyncClient(timeout=10) as client:
        token_resp = await client.post(
            "https://github.com/login/oauth/access_token",
            headers={"Accept": "application/json"},
            data={
                "client_id": GITHUB_CLIENT_ID,
                "client_secret": GITHUB_CLIENT_SECRET,
                "code": code,
                "redirect_uri": f"{BACKEND_URL}/auth/github/callback",
            },
        )
        token_resp.raise_for_status()
        token_data = token_resp.json()

    access_token = token_data.get("access_token")
    if not access_token:
        raise HTTPException(status_code=401, detail="github token failed")
    return access_token


async def github_fetch_user(access_token: str) -> tuple[dict, Optional[str]]:
    headers = {"Authorization": f"Bearer {access_token}"}
    async with httpx.AsyncClient(timeout=10, headers=headers) as client:
        user_resp = await client.get("https://api.github.com/user")
        user_resp.raise_for_status()
        user_data = user_resp.json()

        email = None
        emails_resp = await client.get("https://api.github.com/user/emails")
        if emails_resp.status_code == 200:
            emails = emails_resp.json()
            primary = next(
                (e for e in emails if e.get("primary") and e.get("verified")), None
            )
            email = primary.get("email") if primary else None

    return user_data, email
