from fastapi import APIRouter
from sqlmodel import select

from app.api.deps import AdminUserDep, SessionDep
from app.models import Repository, RepositoryCreate, RepositoryRead

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
