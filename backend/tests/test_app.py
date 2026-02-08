from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.main import app


def test_app_instance():
    assert isinstance(app, FastAPI)


def test_health():
    client = TestClient(app)
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
