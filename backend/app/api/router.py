from fastapi import APIRouter

from app.apps.auth.views import router as auth_router
from app.apps.deployments.views import router as deployments_router
from app.apps.repos.views import router as repos_router
from app.apps.webhooks.views import router as webhooks_router

router = APIRouter()
router.include_router(auth_router)
router.include_router(repos_router)
router.include_router(deployments_router)
router.include_router(webhooks_router)
