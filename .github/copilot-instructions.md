# Copilot Instructions for Detachment 825 Inventory System

## Overview
This monorepo contains a React + Vite frontend and a FastAPI + MySQL backend for inventory management. The system supports user and admin flows, with protected admin routes and JWT-based authentication.

## Architecture
- **Frontend** (`src/`): React (with React Router), communicates with backend via REST API. Auth state is managed in `auth/AuthContext.tsx`.
- **Backend** (`inventory-management-api/src/`): FastAPI app, modularized by resource (users, items, categories, checked-out). Uses SQLAlchemy ORM and Pydantic schemas. MySQL is the default DB (see `config.py`).
- **Docker**: Use `docker-compose.yml` to run both API and MySQL locally. Scripts in `scripts/` help with local dev and DB readiness.

## Developer Workflows
- **Frontend**
  - Install deps: `npm install`
  - Start dev server: `npm run dev` (Vite, port 5173)
  - API URL is set via `.env.local` as `VITE_API_URL`
  - Admin password: `adminpassword` (see README)
- **Backend**
  - Setup venv: `make venv` (runs `scripts/setup_dev.sh`)
  - Run locally: `make run-local` or `./scripts/run_local.sh` (port 8000)
  - Docker: `make docker-up` (runs API + MySQL)
  - API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

## Conventions & Patterns
- **API Auth**: Admin login issues JWT, stored in `localStorage` as `admin_token`. All admin API calls require `Authorization: Bearer <token>`.
- **TypeScript Types**: Shared types for items, users, categories in `src/types/index.ts`. Keep frontend types in sync with backend Pydantic models.
- **React Routing**: Admin pages are under `/admin/*` and protected by `ProtectedRoute.tsx`.
- **UI**: Custom CSS in `src/styles.css`. Use provided class names for consistent look.
- **API Calls**: Use `src/api.ts` for fetch helpers. Always use `authHeaders()` for protected endpoints.
- **Backend Models**: SQLAlchemy models in `src/models/`, Pydantic schemas in `src/schemas.py`.
- **DB Migrations**: Not present; DB schema is created on app start (`Base.metadata.create_all`).

## Integration Points
- **Frontend ↔ Backend**: All data flows via REST API (`/users`, `/categories`, `/items`, `/checked-out`, `/admin/login`).
- **Environment Variables**: Frontend uses `.env.local` for API URL. Backend uses `.env` for DB and secrets.
- **Docker Compose**: Ensures MySQL is ready before API starts (see `wait_for_mysql.sh`).

## Key Files
- Frontend: `src/App.tsx`, `src/auth/AuthContext.tsx`, `src/api.ts`, `src/types/index.ts`
- Backend: `src/main.py`, `src/routes/`, `src/models/`, `src/schemas.py`, `src/config.py`
- DevOps: `Makefile`, `docker-compose.yml`, `scripts/`

## Examples
- To add a new resource, create SQLAlchemy model, Pydantic schema, and FastAPI route in backend, then update frontend types and API calls.
- To run full stack locally: `make venv && make docker-up` in backend, `npm run dev` in root, set `VITE_API_URL` in `.env.local`.

---
For more, see `README.md` in both root and `inventory-management-api/`.
