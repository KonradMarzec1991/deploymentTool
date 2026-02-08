from fastapi import APIRouter

from app.api.routes.auth import router as auth_router
from app.api.routes.deployments import router as deployments_router
from app.api.routes.repos import router as repos_router

router = APIRouter()
router.include_router(auth_router)
router.include_router(repos_router)
router.include_router(deployments_router)
