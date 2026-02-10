import hashlib
import hmac
import os

from fastapi import APIRouter, Request, HTTPException
from sqlmodel import select

from app.api.deps import SessionDep
from app.models import Repository, Deployment

router = APIRouter(prefix="/webhooks", tags=["webhooks"])

@router.post("/github/push")
async def github_push(request: Request, session: SessionDep):
    body = await request.body()

    secret = os.getenv("GITHUB_WEBHOOK_SECRET")
    if not secret:
        raise HTTPException(status_code=500, detail="Missing webhook secret")

    header_signature = request.headers.get("X-Hub-Signature-256")
    if not header_signature:
        raise HTTPException(status_code=400, detail="Missing signature")
    signature = "sha256=" + hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()

    if not hmac.compare_digest(header_signature, signature):
        raise HTTPException(status_code=401, detail="Invalid signature")

    event = request.headers.get("X-GitHub-Event")
    if event != "push":
        return {"ok": True}

    payload = await request.json()

    if payload.get("ref") != "refs/heads/main":
        return {"ok": True}

    repo_full_name = payload["repository"]["full_name"]
    repo = session.exec(
        select(Repository).where(Repository.github_full_name == repo_full_name)
    ).first()
    if not repo:
        return {"ok": True}

    deployment = Deployment(repo_id=repo.id, env="prod", status="WAITING_FOR_APPROVAL")
    session.add(deployment)
    session.commit()
    session.refresh(deployment)

    return {"status": "queued", "deployment_id": deployment.id}


