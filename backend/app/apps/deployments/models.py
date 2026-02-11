from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class DeploymentBase(SQLModel):
    repo_id: int = Field(foreign_key="repository.id", index=True)
    env: str = Field(max_length=50)
    status: str = Field(max_length=50, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Deployment(DeploymentBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
