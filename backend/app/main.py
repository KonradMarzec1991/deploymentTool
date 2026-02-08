from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from sqlmodel import SQLModel

from app.api import router
from app.db import engine

load_dotenv()

app = FastAPI(title="CI/CD Platform API")


@app.on_event("startup")
def on_startup() -> None:
    # Simple bootstrap for learning; replace with Alembic migrations later.
    SQLModel.metadata.create_all(engine)


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
