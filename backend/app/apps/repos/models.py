from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class RepositoryBase(SQLModel):
    name: str = Field(index=True, max_length=200)
    git_url: str = Field(max_length=500)
    github_full_name: Optional[str] = Field(default=None, index=True, max_length=200)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Repository(RepositoryBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
