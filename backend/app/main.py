import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, SQLModel, select

from app.api import router
from app.db import engine
from app.models import User
from app.services import hash_password

load_dotenv()

app = FastAPI(title="CI/CD Platform API")


@app.on_event("startup")
def on_startup() -> None:
    auto_create = os.getenv("AUTO_CREATE_SCHEMA", "true").lower() in {
        "1",
        "true",
        "yes",
    }
    if auto_create:
        # Simple bootstrap for learning; prefer Alembic migrations in production.
        SQLModel.metadata.create_all(engine)
    seed_superadmin()


def seed_superadmin() -> None:
    username = os.getenv("SUPERADMIN_USERNAME")
    password = os.getenv("SUPERADMIN_PASSWORD")
    email = os.getenv("SUPERADMIN_EMAIL")
    if not username or not password:
        return
    username = username.strip()
    password = password.strip()
    if not username or not password:
        return
    if len(password.encode("utf-8")) > 72:
        raise RuntimeError(
            "SUPERADMIN_PASSWORD exceeds bcrypt 72-byte limit; shorten it."
        )

    with Session(engine) as session:
        existing = session.exec(
            select(User).where(
                User.provider == "local", User.provider_login == username
            )
        ).first()
        if existing:
            return

        user = User(
            provider="local",
            provider_login=username,
            email=email,
            password_hash=hash_password(password),
            role="admin",
            is_active=True,
        )
        session.add(user)
        session.commit()


@app.get("/health")
def health():
    return {"status": "ok"}


origins = [
    "http://localhost:3000",
    "https://d2jl13pojcwbb7.cloudfront.net",
    "https://deployment-tool.pl",
    "https://api.deployment-tool.pl",
]

app.include_router(router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
