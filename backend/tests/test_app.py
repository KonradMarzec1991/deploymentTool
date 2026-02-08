from app.main import app
from fastapi import FastAPI
from fastapi.testclient import TestClient


def test_app_instance():
    assert isinstance(app, FastAPI)


def test_health():
    client = TestClient(app)
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
