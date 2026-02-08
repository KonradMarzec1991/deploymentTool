from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel

class UserBase(SQLModel):
    provider: str = Field(default="github", max_length=50)
    provider_login: str = Field(index=True, max_length=200)
    provider_id: Optional[str] = Field(default=None, index=True, max_length=50)
    email: Optional[str] = Field(default=None, max_length=320)
    role: str = Field(default="viewer", max_length=50)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)


class UserRead(UserBase):
    id: int


class UserCreate(SQLModel):
    provider: str = Field(default="github", max_length=50)
    provider_login: str = Field(max_length=200)
    role: str = Field(default="viewer", max_length=50)
    is_active: bool = Field(default=True)


class RepositoryBase(SQLModel):
    name: str = Field(index=True, max_length=200)
    git_url: str = Field(max_length=500)


class Repository(RepositoryBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)


class RepositoryRead(RepositoryBase):
    id: int


class RepositoryCreate(RepositoryBase):
    pass


class DeploymentBase(SQLModel):
    repo_id: int = Field(foreign_key="repository.id", index=True)
    env: str = Field(max_length=50)
    status: str = Field(max_length=50, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Deployment(DeploymentBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)


class DeploymentRead(SQLModel):
    id: int
    repo: str
    env: str
    status: str
    created_at: datetime


class DeploymentCreate(SQLModel):
    repo_id: int
    env: str
