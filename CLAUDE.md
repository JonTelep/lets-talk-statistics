# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Let's Talk Statistics** is a platform for exploring US government statistics from official sources. It presents data without spin - no opinions, no narratives, just data.

**Live site:** https://letstalkstatistics.com  
**GitHub:** https://github.com/JonTelep/lets-talk-statistics

**Architecture**: 2 containers (FastAPI backend + Next.js frontend), file-based JSON caching, no database.

## Quick Start

```bash
make build          # Build container images
make dev            # Start containers with logs
# Frontend: http://localhost:3003
# Backend: http://localhost:6003
```

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
uvicorn app.main:app --reload --port 6003

# Frontend
cd frontend
npm install
npm run dev
```

## Architecture

```
Frontend (Next.js:3003) → Backend (FastAPI:6003) → Government APIs
                                    ↓
                          File Cache (data/cache/*.json)
```

### Performance Optimizations (Feb 2026)

- **Backend caching**: 48h file cache TTL + Cache-Control headers for CDN
- **Frontend caching**: SWR with stale-while-revalidate pattern
- **Startup warming**: Cache pre-warmed on container start via `scripts/warm_cache.py`

### Backend (`backend/app/`)

- **main.py** - FastAPI application setup
- **config.py** - Settings via environment variables  
- **middleware/cache.py** - Cache-Control headers for CDN/browser caching
- **services/gov_data.py** - Unified `GovDataService` for all data fetching:
  - Treasury API (national debt)
  - BLS API (unemployment)
  - Census API (population)
  - FEC API (elections/campaign finance)
  - Capitol Trades API (congressional trading)
- **api/v1/endpoints/** - REST endpoints
- **scripts/warm_cache.py** - Cache warming script (runs on startup)

### Frontend (`frontend/`)

- **app/** - Next.js App Router pages
- **components/** - React components (layout, ui, providers)
- **utils/swr.ts** - SWR configuration for data fetching
- **services/hooks/** - Data fetching hooks (useDebtData, useEmploymentData, etc.)

## API Endpoints

```
GET /api/v1/debt/                    # National debt history
GET /api/v1/debt/latest              # Current debt
GET /api/v1/employment/unemployment  # Unemployment history
GET /api/v1/elections/candidates     # Campaign finance
GET /api/v1/budget/                  # Federal budget
GET /api/v1/congress/stats           # Congressional trading stats
GET /api/v1/congress/trades          # Congressional trades
GET /api/v1/immigration/             # Immigration statistics
GET /api/v1/health                   # Health check
```

API docs: http://localhost:6003/docs

## Data Pages

| Page | Route | Data Source |
|------|-------|-------------|
| National Debt | /debt | Treasury Fiscal Data API |
| Employment | /employment | BLS API |
| Federal Budget | /budget | USASpending.gov |
| Congressional Trading | /congress | Capitol Trades API |
| Immigration | /immigration | DHS / CBP |
| Elections | /elections | FEC API |

## Configuration

Backend environment (`backend/.env`):

```bash
# Cache settings
CACHE_TTL_HOURS=48

# Optional API keys (higher rate limits)
CENSUS_API_KEY=
BLS_API_KEY=
FEC_API_KEY=

# CORS
CORS_ORIGINS=["http://localhost:3000","https://letstalkstatistics.com"]
```

## Deployment

- **Hosted on:** Coolify (Docker containers)
- **DNS/SSL:** Cloudflare (proxied)
- **Ports:** Frontend 3003, Backend 6003

## Documentation

Additional docs are in `/docs`:
- CONTAINER_SETUP.md - Container configuration
- DOCKER_GUIDE.md - Docker/Podman usage
- QUICK_START.md - Getting started guide
- DEVELOPMENT_PLAN.md - Feature roadmap

## Design System

Uses "Federal Brutalism" design language:
- **Fonts:** Zilla Slab (headings), Source Sans Pro (body), JetBrains Mono (data)
- **Colors:** Navy (#0f172a), Red (#bf0a30), Gold (#fbbf24)
- **Style:** Industrial, government-document aesthetic
