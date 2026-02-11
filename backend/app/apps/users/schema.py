from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class UserRead(SQLModel):
    id: int
    provider: str
    provider_login: str
    provider_id: Optional[str] = None
    email: Optional[str] = None
    password_hash: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime


class UserProfile(SQLModel):
    id: int
    provider: str
    provider_login: str
    provider_id: Optional[str] = None
    email: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime


class UserCreate(SQLModel):
    provider: str = Field(default="github", max_length=50)
    provider_login: str = Field(max_length=200)
    role: str = Field(default="viewer", max_length=50)
    is_active: bool = Field(default=True)


class LocalUserCreate(SQLModel):
    username: str = Field(min_length=3, max_length=200)
    password: str = Field(min_length=8, max_length=200)
    role: str = Field(default="viewer", max_length=50)
    is_active: bool = Field(default=True)


class LocalLogin(SQLModel):
    username: str = Field(min_length=3, max_length=200)
    password: str = Field(max_length=200)


class PasswordChange(SQLModel):
    current_password: str = Field(min_length=8, max_length=200)
    new_password: str = Field(min_length=8, max_length=200)
