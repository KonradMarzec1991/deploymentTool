import logging
import os

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlmodel import select

from app.api.deps import AdminTokenDep, SessionDep, UserDep
from app.apps.users.models import User
from app.apps.users.schema import (
    LocalLogin,
    LocalUserCreate,
    PasswordChange,
    UserCreate,
    UserProfile,
    UserRead,
)
from app.services import (
    BACKEND_URL,
    FRONTEND_URL,
    create_access_token,
    create_state,
    github_exchange_code,
    github_fetch_user,
    hash_password,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["auth"])
logger = logging.getLogger(__name__)


@router.get("/github/login")
async def github_login():
    if not BACKEND_URL or not FRONTEND_URL:
        raise HTTPException(status_code=500, detail="oauth urls not configured")
    if not os.getenv("GITHUB_CLIENT_ID"):
        raise HTTPException(status_code=500, detail="github oauth not configured")

    state = create_state()
    url = (
        "https://github.com/login/oauth/authorize"
        f"?client_id={os.getenv('GITHUB_CLIENT_ID')}"
        f"&redirect_uri={BACKEND_URL}/auth/github/callback"
        f"&state={state}"
        "&scope=read:user%20user:email"
    )
    response = RedirectResponse(url)
    response.set_cookie(
        "oauth_state",
        state,
        max_age=600,
        httponly=True,
        secure=BACKEND_URL.startswith("https"),
        samesite="lax",
    )
    return response


@router.get("/github/callback")
async def github_callback(
    request: Request,
    code: str,
    state: str,
    session: SessionDep,
):
    if not FRONTEND_URL:
        raise HTTPException(status_code=500, detail="oauth urls not configured")
    cookie_state = request.cookies.get("oauth_state")
    if not cookie_state or cookie_state != state:
        logger.warning(
            "github oauth state mismatch",
            extra={"cookie_state_present": bool(cookie_state)},
        )
        raise HTTPException(status_code=400, detail="invalid oauth state")

    access_token = await github_exchange_code(code)
    github_user, email = await github_fetch_user(access_token)

    login = github_user.get("login")
    github_id = github_user.get("id")

    if not login or not github_id:
        logger.warning(
            "github user invalid",
            extra={"login_present": bool(login), "github_id_present": bool(github_id)},
        )
        raise HTTPException(status_code=401, detail="github user invalid")

    user = session.exec(
        select(User).where(User.provider == "github", User.provider_login == login)
    ).first()

    if not user or not user.is_active:
        logger.info(
            "github login blocked",
            extra={
                "login": login,
                "user_exists": bool(user),
                "is_active": bool(user and user.is_active),
            },
        )
        raise HTTPException(status_code=403, detail="user not allowed")

    user.provider_id = str(github_id)
    if email:
        user.email = email

    session.add(user)
    session.commit()
    session.refresh(user)

    token = create_access_token(user)
    response = RedirectResponse(f"{FRONTEND_URL}/login?token={token}")
    response.delete_cookie("oauth_state")
    return response


@router.post("/login")
def local_login(payload: LocalLogin, session: SessionDep):
    superadmin_username = os.getenv("SUPERADMIN_USERNAME", "").strip()
    if payload.username != superadmin_username and len(payload.password) < 8:
        raise HTTPException(
            status_code=422, detail="password must be at least 8 characters"
        )

    user = session.exec(
        select(User).where(
            User.provider == "local", User.provider_login == payload.username
        )
    ).first()

    if not user or not user.is_active or not user.password_hash:
        raise HTTPException(status_code=401, detail="invalid credentials")

    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="invalid credentials")

    token = create_access_token(user)
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=UserProfile)
def get_profile(user: UserDep):
    return user


@router.post("/users", response_model=UserRead)
def create_user_allowlist(
    payload: UserCreate, session: SessionDep, _auth: AdminTokenDep
):
    user = User(
        provider=payload.provider,
        provider_login=payload.provider_login,
        role=payload.role,
        is_active=payload.is_active,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@router.post("/users/local", response_model=UserRead)
def create_local_user(
    payload: LocalUserCreate, session: SessionDep, _auth: AdminTokenDep
):
    existing = session.exec(
        select(User).where(
            User.provider == "local", User.provider_login == payload.username
        )
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="user already exists")

    user = User(
        provider="local",
        provider_login=payload.username,
        password_hash=hash_password(payload.password),
        role=payload.role,
        is_active=payload.is_active,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@router.post("/password")
def change_password(payload: PasswordChange, session: SessionDep, user: UserDep):
    if user.provider != "local":
        raise HTTPException(status_code=400, detail="password login not enabled")
    if not user.password_hash:
        raise HTTPException(status_code=400, detail="password not set")
    if not verify_password(payload.current_password, user.password_hash):
        raise HTTPException(status_code=401, detail="invalid credentials")

    user.password_hash = hash_password(payload.new_password)
    session.add(user)
    session.commit()
    session.refresh(user)
    return {"status": "ok"}
