# Let's Talk Statistics

Government statistics made accessible. Simple, transparent, non-partisan.

## Overview

A straightforward platform for exploring US government statistics - debt, employment, elections, and more. We fetch data directly from official government APIs and present it without spin.

**Philosophy:** No opinions. No narratives. Just data from official sources.

## Quick Start

```bash
# Clone and start
git clone https://github.com/JonTelep/lets-talk-statistics.git
cd lets-talk-statistics

# Copy environment file
cp backend/.env.example backend/.env

# Start with Podman (or Docker)
podman-compose up -d

# Frontend: http://localhost:3000
# Backend API: http://localhost:8000/docs
```

That's it. No database setup. No Redis. No Celery workers.

## Architecture

**Simple by design:**

```
Frontend (Next.js) ←→ Backend (FastAPI) ←→ Government APIs
                              ↓
                    File Cache (JSON)
```

- **2 containers**: Frontend + Backend
- **No external database** - JSON file caching
- **No task queues** - Direct API calls with smart caching

### Why So Simple?

Government data doesn't change frequently:
- FBI Crime Data: **Annually** (September)
- Census Population: **Annually**
- Treasury Debt: Daily updates, but historical data is static
- BLS Employment: **Monthly**

We don't need Celery workers running 24/7 to check for data that updates once a year.

## Data Sources

| Source | Data | API |
|--------|------|-----|
| U.S. Treasury | National debt | [Fiscal Data](https://fiscaldata.treasury.gov/) |
| Bureau of Labor Statistics | Unemployment | [BLS API](https://www.bls.gov/developers/) |
| U.S. Census Bureau | Population | [Census API](https://www.census.gov/data/developers.html) |
| Federal Election Commission | Campaign finance | [OpenFEC](https://api.open.fec.gov/) |

## API Endpoints

```
GET /api/v1/debt/              # National debt history
GET /api/v1/debt/latest        # Current debt figure
GET /api/v1/employment/unemployment      # Unemployment rate history
GET /api/v1/employment/unemployment/latest
GET /api/v1/elections/candidates  # Campaign finance data
GET /api/v1/elections/population  # State populations
GET /api/v1/budget/            # Federal budget data
GET /api/v1/health             # Health check
```

Full API docs: http://localhost:8000/docs

## Configuration

```bash
# backend/.env

# Optional API keys (for higher rate limits)
CENSUS_API_KEY=your_key
BLS_API_KEY=your_key
FEC_API_KEY=your_key

# Cache settings
CACHE_TTL_HOURS=24
```

Most government APIs work without keys. Keys just give you higher rate limits.

## Refreshing Data

Data auto-refreshes when cache expires (default: 24 hours).

To force refresh:

```bash
# Refresh all data
podman exec lts_backend python scripts/refresh_data.py --all

# Refresh specific data
podman exec lts_backend python scripts/refresh_data.py --debt
podman exec lts_backend python scripts/refresh_data.py --employment
```

## Development

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Tech Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Backend**: FastAPI, Python 3.12
- **Caching**: File-based JSON (no Redis needed)
- **Containers**: Podman/Docker

## Project Structure

```
lets-talk-statistics/
├── frontend/          # Next.js app
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI app
│   │   ├── config.py         # Settings
│   │   ├── services/
│   │   │   └── gov_data.py   # Unified data service
│   │   └── api/v1/endpoints/ # API routes
│   └── scripts/
│       └── refresh_data.py   # Manual data refresh
├── data/              # Cache directory
└── docker-compose.yml
```

## Contributing

1. Fork it
2. Create a feature branch
3. Keep it simple
4. Submit a PR

## License

MIT

---

Built by [Telep IO](https://telep.io)
