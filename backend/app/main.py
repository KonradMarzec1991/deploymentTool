from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import router

app = FastAPI(title="CI/CD Platform API")

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
