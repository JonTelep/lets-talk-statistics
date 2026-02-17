# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Let's Talk Statistics** is a platform for exploring US government statistics from official sources. It presents data without spin - no opinions, no narratives, just data.

**Live site:** https://letstalkstatistics.com
**GitHub:** https://github.com/JonTelep/lets-talk-statistics

**Architecture**: 2 containers (FastAPI backend + Next.js frontend), file-based JSON caching, no database. Uses Podman for containers.

## Quick Start

```bash
make build          # Build container images (podman-compose)
make dev            # Start containers with logs
# Frontend: http://localhost:3003
# Backend: http://localhost:6003
```

## Development Commands

### Containers (Recommended - uses Podman)

```bash
make build          # Build all container images
make up             # Start containers (detached)
make dev            # Start containers with logs
make down           # Stop containers
make clean          # Stop containers and remove images
make logs           # View all container logs
make ps             # Show container status
```

Individual services: `make build-backend`, `make dev-backend`, `make build-frontend`, `make dev-frontend`

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

### Performance

- **Backend caching**: 48h file-based JSON cache (MD5 hash filenames) + Cache-Control headers (1h public, 24h stale-while-revalidate)
- **Frontend caching**: SWR with stale-while-revalidate (60s dedup, 3 retries)
- **Startup warming**: Cache pre-warmed on container start via `scripts/warm_cache.py`
- **Lazy loading**: Charts loaded via React Suspense with skeleton placeholders

### Backend (`backend/app/`)

- **main.py** - FastAPI v2.0.0 application setup with CORS and cache middleware
- **config.py** - Pydantic settings via environment variables
- **middleware/cache.py** - Cache-Control headers for CDN/browser caching
- **services/gov_data.py** - Unified `GovDataService` (singleton) for core data fetching with file cache
- **services/** - Dedicated service files per domain:
  - `debt_service.py` - Treasury debt data
  - `employment_service.py` - BLS employment data
  - `budget_service.py` - Federal budget data
  - `elections_service.py` - FEC campaign finance
  - `immigration_service.py` - BTS border crossings + DHS historical data
  - `congress_service.py` - Capitol Trades congressional stock trading
  - `population_service.py` - Census population data
- **api/v1/endpoints/** - REST endpoints (6 active routers: debt, employment, budget, elections, immigration, congress)
- **scripts/warm_cache.py** - Cache warming script (runs on startup)

**Note:** `database.py`, `tasks/`, and some endpoint files (admin, analytics, statistics, trends, comparisons, rankings, exports) exist but are **not active** - they are legacy/future code not wired into the router.

### Frontend (`frontend/`)

- **Tech:** Next.js 16.1.6, React 18.3.1, TypeScript 5.7.2, Tailwind 3.4.17
- **app/** - Next.js App Router pages (home, debt, employment, budget, elections, immigration, congress, about)
  - `congress/` has sub-pages: `politicians/`, `trades/`
  - `immigration/` has sub-page: `trends/`
- **components/**
  - `layout/` - Header (with theme toggle, mobile menu), Footer
  - `charts/` - Lazy-loaded Recharts wrappers (LazyBarChart, LazyLineChart, LazyPieChart) + theme config
  - `ui/` - Button, Card, Skeleton, ChartSkeleton, Spinner, Select, ErrorBoundary, ErrorState, DownloadRawData
  - `providers/` - ThemeProvider (dark/light), SWRProvider
  - `seo/` - PageSEO, StructuredData (JSON-LD)
  - `home/` - Hero, DefinitionCard
- **hooks/useChartTheme.ts** - Theme-aware chart styling hook
- **services/hooks/** - Data fetching hooks (useDebtData, useEmploymentData, useImmigrationData, useBudgetData, useElectionsData)
- **services/api/client.ts** - Typed API client with endpoints per domain
- **utils/swr.ts** - SWR configuration and fetcher

## API Endpoints

```
GET /api/v1/health                          # Health check

# Debt
GET /api/v1/debt/                           # National debt history (days param)
GET /api/v1/debt/latest                     # Current debt figure

# Employment
GET /api/v1/employment/unemployment         # Unemployment history (years param)
GET /api/v1/employment/unemployment/latest  # Current unemployment rate

# Budget
GET /api/v1/budget/                         # Federal budget (fiscal_year param)

# Elections
GET /api/v1/elections/candidates            # Campaign finance (cycle param)
GET /api/v1/elections/population            # State population data

# Immigration
GET /api/v1/immigration/                    # Overview (summary + top countries)
GET /api/v1/immigration/summary             # Summary statistics
GET /api/v1/immigration/historical          # Historical enforcement (year range)
GET /api/v1/immigration/categories          # Admission category breakdown
GET /api/v1/immigration/countries           # Top source countries
GET /api/v1/immigration/border-crossings    # BTS border crossing data (filtered)
GET /api/v1/immigration/border-crossings/monthly  # Monthly border summary

# Congress
GET /api/v1/congress/stats                  # Trading statistics summary
GET /api/v1/congress/trades/recent          # Recent trades (paginated)
GET /api/v1/congress/trades                 # All trades (filterable: politician, ticker, type, chamber, party)
GET /api/v1/congress/traders                # Top traders ranked
GET /api/v1/congress/tickers                # Popular stocks
GET /api/v1/congress/tickers/{ticker}       # Trades by ticker
```

API docs: http://localhost:6003/docs

## Data Pages

| Page | Route | Data Source |
|------|-------|-------------|
| National Debt | /debt | Treasury Fiscal Data API |
| Employment | /employment | BLS API |
| Federal Budget | /budget | Treasury Fiscal Data |
| Congressional Trading | /congress | Capitol Trades (STOCK Act disclosures) |
| Immigration | /immigration | BTS + DHS Immigration Yearbook |
| Elections | /elections | FEC OpenFEC API |

## Configuration

Backend environment (`backend/.env`):

```bash
CACHE_TTL_HOURS=48
CENSUS_API_KEY=       # Optional (higher rate limits)
BLS_API_KEY=          # Optional
FEC_API_KEY=          # Optional
CORS_ORIGINS=["http://localhost:3000","https://letstalkstatistics.com"]
```

Frontend environment (`frontend/.env`):

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Deployment

- **Hosted on:** Coolify (Podman containers)
- **DNS/SSL:** Cloudflare (proxied)
- **Ports:** Frontend 3003, Backend 6003
- **Network:** Bridge network `lts_network` (docker-compose)

## Documentation

Additional docs in `/docs`:
- CONTAINER_SETUP.md, DOCKER_GUIDE.md, MAKEFILE_GUIDE.md
- QUICK_START.md, QUICK_REFERENCE.md
- DEVELOPMENT_PLAN.md, SIMPLIFICATION.md
- decisions/ - Architecture Decision Records

## Design System

Dark minimal aesthetic (Palantir/OpenAI-inspired) with light/dark theme toggle:
- **Fonts:** Inter (headings + body), JetBrains Mono (data/code)
- **Colors:** CSS variable-based theme system (`--surface`, `--text-primary`, `--border`, etc.)
  - Dark (default): #0a0a0a surface, #ffffff text, #222 borders
  - Light: #ffffff surface, #111111 text, #e5e5e5 borders
  - Accent: Blue (#3b82f6)
- **Theme:** Persisted to localStorage (`lts-theme`), respects system preference on first load
- **Components:** `.card`, `.btn-primary`, `.btn-secondary`, `.btn-accent`, `.data-value`, `.data-label`
