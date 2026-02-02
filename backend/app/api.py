from fastapi import APIRouter

router = APIRouter()

REPOS = [
    {
        "id": 1,
        "name": "users-service",
        "git_url": "https://github.com/example/users-service"
    },
    {
        "id": 2,
        "name": "orders-service",
        "git_url": "https://github.com/example/orders-service"
    }
]

DEPLOYMENTS = [
    {
        "id": 1,
        "repo": "users-service",
        "env": "prod",
        "status": "WAITING_FOR_APPROVAL"
    }
]

@router.get("/repos")
def get_repos():
    return REPOS

@router.get("/deployments")
def get_deployments():
    return DEPLOYMENTS

@router.post("/deployments/{deployment_id}/approve")
def approve_deployment(deployment_id: int):
    for d in DEPLOYMENTS:
        if d["id"] == deployment_id:
            d["status"] = "APPROVED"
            return d
    return {"error": "not found"}

