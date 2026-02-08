from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from app.db import get_session
from app.models import (
    Deployment,
    DeploymentCreate,
    DeploymentRead,
    Repository,
    RepositoryCreate,
    RepositoryRead,
)

router = APIRouter()


@router.get("/repos", response_model=list[RepositoryRead])
def get_repos(session: Session = Depends(get_session)):
    return session.exec(select(Repository)).all()


@router.post("/repos", response_model=RepositoryRead)
def create_repo(
    payload: RepositoryCreate,
    session: Session = Depends(get_session),
):
    repo = Repository(name=payload.name, git_url=payload.git_url)
    session.add(repo)
    session.commit()
    session.refresh(repo)
    return repo


@router.get("/deployments", response_model=list[DeploymentRead])
def get_deployments(
    session: Session = Depends(get_session),
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


@router.post("/deployments", response_model=DeploymentRead)
def create_deployment(
    payload: DeploymentCreate,
    session: Session = Depends(get_session),
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


@router.post("/deployments/{deployment_id}/approve", response_model=DeploymentRead)
def approve_deployment(
    deployment_id: int,
    session: Session = Depends(get_session),
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
