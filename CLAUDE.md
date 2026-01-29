# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Let's Talk Statistics is a platform for exploring US government statistics (debt, employment, elections, population) from official sources. It presents data without spin - no opinions, no narratives, just data.

**Simplified architecture**: 2 containers (FastAPI backend + Next.js frontend), file-based JSON caching, no database/Redis/Celery.

## Development Commands

### Containers (Recommended)

```bash
make build          # Build container images
make up             # Start containers (detached)
make dev            # Start containers with logs
make down           # Stop containers
make clean          # Stop containers and remove images
```

### Local Development

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload    # http://localhost:8000

# Frontend
cd frontend
npm install
npm run dev                       # http://localhost:3000
npm run lint
```

### Refresh Data Cache

```bash
podman exec lts_backend python scripts/refresh_data.py --all
podman exec lts_backend python scripts/refresh_data.py --debt
```

## Architecture

```
Frontend (Next.js:3000) → Backend (FastAPI:8000) → Government APIs
                                    ↓
                          File Cache (data/cache/*.json)
```

### Backend (`backend/app/`)

- **main.py** - FastAPI application setup
- **config.py** - Settings via environment variables
- **services/gov_data.py** - Unified `GovDataService` class that fetches and caches all government data:
  - Treasury API (national debt)
  - BLS API (unemployment)
  - Census API (population)
  - FEC API (elections/campaign finance)
- **api/v1/endpoints/** - REST endpoints: `debt.py`, `employment.py`, `budget.py`, `elections.py`

### Frontend (`frontend/`)

- **app/** - Next.js App Router pages
- **components/** - React components (charts, filters, ui, layout)
- **lib/api/client.ts** - API client for backend
- **lib/hooks/** - Data fetching hooks

### Data Flow

1. API request comes in (e.g., `/api/v1/debt/`)
2. `GovDataService` checks file cache (`data/cache/<hash>.json`)
3. If cache is fresh (default 24h TTL), return cached data
4. If stale, fetch from government API, cache result, return

## API Endpoints

```
GET /api/v1/debt/                    # National debt history
GET /api/v1/debt/latest              # Current debt
GET /api/v1/employment/unemployment  # Unemployment history
GET /api/v1/elections/candidates     # Campaign finance
GET /api/v1/elections/population     # State populations
GET /api/v1/budget/                  # Federal budget
GET /api/v1/health                   # Health check
```

API docs: http://localhost:8000/docs

## Configuration

Environment variables in `backend/.env`:

```bash
# Optional API keys (higher rate limits)
CENSUS_API_KEY=
BLS_API_KEY=
FEC_API_KEY=

# Cache TTL
CACHE_TTL_HOURS=24

# CORS
CORS_ORIGINS=["http://localhost:3000"]
```

## Legacy Code

Some old files remain from the previous complex architecture (Celery tasks, SQLAlchemy models, database migrations) but are not used. The active codebase is ~300 lines of Python in `services/gov_data.py` plus simple endpoint wrappers.
