from typing import Annotated

from fastapi import APIRouter, HTTPException, Query
from sqlmodel import select

from app.api.deps import AdminUserDep, SessionDep
from app.models import Deployment, DeploymentCreate, DeploymentRead, Repository

router = APIRouter(prefix="/deployments", tags=["deployments"])


@router.get("", response_model=list[DeploymentRead])
def get_deployments(
    session: SessionDep,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 100,
):
    rows = session.exec(
        select(Deployment, Repository)
        .join(Repository, Deployment.repo_id == Repository.id)
        .offset(offset)
        .limit(limit)
    ).all()

    return [
        DeploymentRead(
            id=d.id,
            repo=r.name,
            env=d.env,
            status=d.status,
            created_at=d.created_at,
        )
        for d, r in rows
    ]


@router.post("", response_model=DeploymentRead)
def create_deployment(
    payload: DeploymentCreate,
    session: SessionDep,
    _user: AdminUserDep,
):
    repo = session.get(Repository, payload.repo_id)
    if not repo:
        raise HTTPException(status_code=404, detail="repo not found")

    deployment = Deployment(
        repo_id=repo.id,
        env=payload.env,
        status="WAITING_FOR_APPROVAL",
    )

    session.add(deployment)
    session.commit()
    session.refresh(deployment)

    return DeploymentRead(
        id=deployment.id,
        repo=repo.name,
        env=deployment.env,
        status=deployment.status,
        created_at=deployment.created_at,
    )


@router.post("/{deployment_id}/approve", response_model=DeploymentRead)
def approve_deployment(
    deployment_id: int,
    session: SessionDep,
    _user: AdminUserDep,
):
    deployment = session.get(Deployment, deployment_id)
    if not deployment:
        raise HTTPException(status_code=404, detail="not found")

    deployment.status = "APPROVED"
    session.add(deployment)
    session.commit()
    session.refresh(deployment)

    repo = session.get(Repository, deployment.repo_id)
    repo_name = repo.name if repo else "unknown"

    return DeploymentRead(
        id=deployment.id,
        repo=repo_name,
        env=deployment.env,
        status=deployment.status,
        created_at=deployment.created_at,
    )
