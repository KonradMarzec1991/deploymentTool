import os
from typing import Annotated

from fastapi import Depends, Header, HTTPException
from sqlmodel import Session

from app.apps.users.models import User
from app.db import get_session
from app.services import get_current_user, require_role

ADMIN_TOKEN = os.getenv("ADMIN_TOKEN")


def require_admin_token(x_admin_token: str | None = Header(default=None)) -> None:
    if not ADMIN_TOKEN:
        raise HTTPException(status_code=500, detail="admin token not configured")
    if not x_admin_token or x_admin_token != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="unauthorized")


SessionDep = Annotated[Session, Depends(get_session)]
AdminTokenDep = Annotated[None, Depends(require_admin_token)]


def get_current_user_dep(
    session: SessionDep, authorization: str | None = Header(default=None)
) -> User:
    return get_current_user(session, authorization)


UserDep = Annotated[User, Depends(get_current_user_dep)]


def require_admin_user(user: UserDep) -> User:
    require_role(user, {"admin"})
    return user


AdminUserDep = Annotated[User, Depends(require_admin_user)]
