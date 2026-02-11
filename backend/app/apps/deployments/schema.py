from datetime import datetime

from sqlmodel import SQLModel


class DeploymentRead(SQLModel):
    id: int
    repo: str
    env: str
    status: str
    created_at: datetime


class DeploymentCreate(SQLModel):
    repo_id: int
    env: str
