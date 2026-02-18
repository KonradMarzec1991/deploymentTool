import hashlib
import hmac
import os

from fastapi import APIRouter, HTTPException, Request
from sqlmodel import select

from app.api.deps import SessionDep
from app.apps.deployments.models import Deployment
from app.apps.repos.models import Repository

router = APIRouter(prefix="/webhooks", tags=["webhooks"])
ALLOWED_PUSH_REFS = {"refs/heads/main", "refs/heads/master"}


@router.post("/github/push")
async def github_push(request: Request, session: SessionDep):
    body = await request.body()

    secret = os.getenv("GITHUB_WEBHOOK_SECRET")
    if not secret:
        raise HTTPException(status_code=400, detail="Missing webhook secret")

    header_signature = request.headers.get("X-Hub-Signature-256")
    if not header_signature:
        raise HTTPException(status_code=400, detail="Missing signature")
    signature = "sha256=" + hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()

    if not hmac.compare_digest(header_signature, signature):
        raise HTTPException(status_code=401, detail="Invalid signature")

    event = (request.headers.get("X-GitHub-Event") or "").strip().lower()
    if event != "push":
        return {"ok": True, "ignored_event": event}

    payload = await request.json()

    if payload.get("ref") not in ALLOWED_PUSH_REFS:
        return {"ok": True}

    repo_name = payload["repository"]["name"]
    repo = session.exec(
        select(Repository).where(Repository.name == repo_name)
    ).first()
    if not repo:
        return {"ok": True}

    deployment = Deployment(repo_id=repo.id, env="prod", status="WAITING_FOR_APPROVAL")
    session.add(deployment)
    session.commit()
    session.refresh(deployment)

    return {"status": "queued", "deployment_id": deployment.id}
