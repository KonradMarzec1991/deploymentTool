# Deployment Tool

A lightweight control plane for managing deployments across multiple
repositories. The current scope focuses on automated deployments to
`dev`/`stg` and gated production releases that require approval.

**Highlights**
1. Track repositories and deployments in a single dashboard.
2. Approve production deployments from the UI.
3. AWS-first workflow (ECR for images, S3/CloudFront for frontend).
4. Designed to grow into ECS-based deployments and IaC.

**Repo Structure**
1. `backend/` FastAPI + SQLModel API.
2. `frontend/` Next.js UI.
3. `.github/` CI/CD workflows and composite actions.

## Quick Start (Local)

**Prerequisites**
1. Docker + Docker Compose
2. Node.js 20+ (optional for local frontend without Docker)
3. Python 3.11+ (optional for local backend without Docker)

**Run Everything**
```bash
docker compose up --build
```

This runs:
1. Postgres on `localhost:5434`
2. Backend API on `http://localhost:8002`
3. Frontend on `http://localhost:3000`

## CI/CD Overview

**Backend** (`.github/workflows/backend-ci.yml`)
1. Lint + tests
2. Build Docker image
3. Push to ECR

**Frontend** (`.github/workflows/frontend-cd.yml`)
1. Build static frontend
2. Upload to S3
3. CloudFront invalidation

## Architecture (Current)

```text
Developer
  |
  v
GitHub Actions
  |  build & test
  |  build image
  v
ECR (Docker image)
  |
  v
Deployment Tool API (FastAPI + DB)
  |  /deployments, /approve
  v
Deployment Tool UI (Next.js)
  |
  v
Operators approve production
```

```text
Frontend CI/CD
  |
  v
S3 (static site) --> CloudFront
```

## Environment Variables

**Backend**
1. `DATABASE_URL`
2. `ADMIN_TOKEN`

**Frontend**
1. `NEXT_PUBLIC_API_URL`

See `backend/README.md` and `frontend/README.md` for details.
