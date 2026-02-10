from typing import Optional

from sqlmodel import Field, SQLModel


class RepositoryBase(SQLModel):
    name: str = Field(index=True, max_length=200)
    git_url: str = Field(max_length=500)
    github_full_name: str | None = Field(default=None, index=True)


class Repository(RepositoryBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)


class RepositoryRead(RepositoryBase):
    id: int


class RepositoryCreate(RepositoryBase):
    pass
