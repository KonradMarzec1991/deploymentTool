"""Import all SQLModel tables so metadata is fully registered."""

from app.apps.deployments.models import Deployment
from app.apps.repos.models import Repository
from app.apps.users.models import User

__all__ = ["Deployment", "Repository", "User"]
