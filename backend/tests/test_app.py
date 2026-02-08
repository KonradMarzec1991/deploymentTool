import os

from fastapi import FastAPI
from fastapi.testclient import TestClient

os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")
os.environ.setdefault("ADMIN_TOKEN", "test_token")

from app.main import app  # noqa: E402


def test_app_instance():
    assert isinstance(app, FastAPI)


def test_health():
    client = TestClient(app)
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
