import os

from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel

os.environ.setdefault("DATABASE_URL", "sqlite:///./test_auth.db")
os.environ.setdefault("JWT_SECRET", "test_secret")

from app.db import engine  # noqa: E402
from app.main import app  # noqa: E402
from app.models import User  # noqa: E402
from app.services import hash_password  # noqa: E402


def setup_module() -> None:
    SQLModel.metadata.create_all(engine)


def test_local_login_success():
    with Session(engine) as session:
        user = User(
            provider="local",
            provider_login="alice",
            password_hash=hash_password("password123"),
            role="admin",
            is_active=True,
        )
        session.add(user)
        session.commit()

    client = TestClient(app)
    response = client.post(
        "/auth/login", json={"username": "alice", "password": "password123"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_local_login_invalid_password():
    client = TestClient(app)
    response = client.post(
        "/auth/login", json={"username": "alice", "password": "wrongpass"}
    )
    assert response.status_code == 401
