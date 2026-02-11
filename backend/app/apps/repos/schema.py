from datetime import datetime
from typing import Literal

from sqlmodel import SQLModel


class RepositoryRead(SQLModel):
    id: int
    name: str
    git_url: str
    github_full_name: str | None = None
    created_at: datetime


class RepositoryCreate(SQLModel):
    name: str
    git_url: str
    github_full_name: str | None = None


class RepositoryIntegrate(SQLModel):
    name: str


class RepositoryIntegrateResponse(SQLModel):
    name: str
    status: Literal["added", "already_exists"]
