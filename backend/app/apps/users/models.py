from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class UserBase(SQLModel):
    provider: str = Field(default="github", max_length=50)
    provider_login: str = Field(index=True, max_length=200)
    provider_id: Optional[str] = Field(default=None, index=True, max_length=50)
    email: Optional[str] = Field(default=None, max_length=320)
    password_hash: Optional[str] = Field(default=None, max_length=255)
    role: str = Field(default="viewer", max_length=50)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
