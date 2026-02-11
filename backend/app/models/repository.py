from datetime import datetime
from typing import Optional, Literal

from sqlmodel import Field, SQLModel


class RepositoryBase(SQLModel):
    name: str = Field(index=True, max_length=200)
    git_url: str = Field(max_length=500)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Repository(RepositoryBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)


class RepositoryRead(RepositoryBase):
    id: int


class RepositoryCreate(RepositoryBase):
    pass


class RepositoryIntegrate(SQLModel):
    name: str


class RepositoryIntegrateResponse(SQLModel):
    name: str
    status: Literal["added", "already_exists"]
