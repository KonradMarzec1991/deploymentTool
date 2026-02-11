import httpx
from fastapi import APIRouter, HTTPException
from sqlmodel import select

from app.api.deps import AdminUserDep, SessionDep
from app.models import Repository, RepositoryCreate, RepositoryRead
from app.models.repository import RepositoryIntegrate, RepositoryIntegrateResponse

router = APIRouter(prefix="/repos", tags=["repos"])


@router.get("", response_model=list[RepositoryRead])
def get_repos(session: SessionDep):
    return session.exec(select(Repository)).all()


@router.post("", response_model=RepositoryRead)
def create_repo(
    payload: RepositoryCreate,
    session: SessionDep,
    _user: AdminUserDep,
):
    repo = Repository(name=payload.name, git_url=payload.git_url)
    session.add(repo)
    session.commit()
    session.refresh(repo)
    return repo


@router.post("/integrate", response_model=RepositoryIntegrateResponse)
async def integrate_repo(
    payload: RepositoryIntegrate, session: SessionDep, user: AdminUserDep
):
    name = payload.name.strip()
    if not name:
        raise HTTPException(status_code=422, detail="name is required")

    github_full_name = f"{user.provider_login}/{name}"
    repository = session.exec(
        select(Repository).where(Repository.git_url == f"https://github.com/{github_full_name}")
    ).first()
    if repository:
        return RepositoryIntegrateResponse(name=repository.name, status="already_exists")

    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get(
            f"https://api.github.com/repos/{github_full_name}"
        )
        if response.status_code == 404:
            raise HTTPException(status_code=404, detail="repo not found on github")
        response.raise_for_status()

    repo = Repository(
        name=name,
        git_url=f"https://github.com/{github_full_name}",
    )

    session.add(repo)
    session.commit()
    session.refresh(repo)

    return RepositoryIntegrateResponse(name=name, status="added")
