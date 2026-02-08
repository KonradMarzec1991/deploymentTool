# Backend (FastAPI)

API service for repositories and deployments.

## Requirements
1. Python 3.11+
2. Postgres (or any SQL database supported by SQLModel)

## Environment

Required:
1. `DATABASE_URL`  
   Example: `postgresql+psycopg2://postgres:postgres@localhost:5434/postgres`
2. `ADMIN_TOKEN`  
   Used for admin-only actions (e.g. approve deployment).
3. `GITHUB_CLIENT_ID`
4. `GITHUB_CLIENT_SECRET`
5. `JWT_SECRET`
6. `FRONTEND_URL`  
   Example: `http://localhost:3000`
7. `BACKEND_URL`  
   Example: `http://localhost:8002`

## Run Locally (without Docker)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install -r test-requirements.txt
export DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5434/postgres
export ADMIN_TOKEN=admin
uvicorn app.main:app --reload
```

## Run Tests
```bash
cd backend
pytest tests/
```

## API Overview
1. `GET /repos` list repositories
2. `POST /repos` create repository (admin)
3. `GET /deployments` list deployments
4. `POST /deployments` create deployment (admin)
5. `POST /deployments/{id}/approve` approve deployment (admin)
