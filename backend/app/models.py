from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class RepositoryBase(SQLModel):
    name: str = Field(index=True, max_length=200)
    git_url: str = Field(max_length=500)


class Repository(RepositoryBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)


class RepositoryRead(RepositoryBase):
    id: int


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
