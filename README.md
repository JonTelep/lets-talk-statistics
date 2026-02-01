# Let's Talk Statistics 📊

Government statistics made accessible. Simple, transparent, non-partisan.

[![GitHub](https://img.shields.io/badge/GitHub-JonTelep%2Flets--talk--statistics-blue)](https://github.com/JonTelep/lets-talk-statistics)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

A straightforward platform for exploring US government statistics - debt, employment, immigration, elections, budget, and congressional trading. We fetch data directly from official government APIs and present it without spin.

**Philosophy:** No opinions. No narratives. Just data from official sources.

**Live at:** [letstalkstatistics.com](https://letstalkstatistics.com) *(coming soon)*

## Features

### 6 Live Data Pages

| Page | Data Source | Live API | Status |
|------|-------------|----------|--------|
| 🏦 **National Debt** | Treasury Fiscal Data | ✅ | Live |
| 💼 **Employment** | Bureau of Labor Statistics | ✅ | Live |
| 📋 **Federal Budget** | Treasury Fiscal Data | ✅ | Live |
| 🗳️ **Elections** | FEC OpenFEC API | ✅ | Live |
| 🛂 **Immigration** | BTS + DHS Yearbook | ✅ | Live |
| 🏛️ **Congress** | Capitol Trades API | ✅ | Live |

### UI Features

- **Loading Skeletons** - Shimmer placeholders while data loads
- **Error Handling** - Retry buttons, graceful error states
- **Party Breakdown** - Visual R/D/I distribution on Congress page
- **Filter Controls** - Filter by party, chamber, sort by metrics
- **Raw Data Downloads** - Download JSON on every page

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
| U.S. Treasury | National debt, Federal budget | [Fiscal Data](https://fiscaldata.treasury.gov/) |
| Bureau of Labor Statistics | Unemployment rates | [BLS API](https://www.bls.gov/developers/) |
| U.S. Census Bureau | Population data | [Census API](https://www.census.gov/data/developers.html) |
| Federal Election Commission | Campaign finance | [OpenFEC](https://api.open.fec.gov/) |
| Bureau of Transportation | Border crossings | [BTS API](https://www.bts.gov/explore-topics-and-geography/topics/border-crossingentry-data) |
| DHS Yearbook | Immigration statistics | [DHS Yearbook](https://www.dhs.gov/immigration-statistics/yearbook) |
| Capitol Trades | Congressional stock trading | [Local API](https://github.com/JonTelep/capitol-trades) |

## API Endpoints

```
# Health
GET /api/v1/health              # Health check

# National Debt
GET /api/v1/debt/               # Debt history
GET /api/v1/debt/latest         # Current debt figure

# Employment
GET /api/v1/employment/unemployment        # Unemployment history
GET /api/v1/employment/unemployment/latest # Current rate

# Budget
GET /api/v1/budget/                        # Federal budget data

# Elections
GET /api/v1/elections/candidates           # Presidential candidates
GET /api/v1/elections/population           # State populations

# Immigration
GET /api/v1/immigration/stats              # Border crossings + legal immigration

# Congress
GET /api/v1/congress/stats                 # Trading stats, party breakdown
GET /api/v1/congress/traders               # Politicians list (filterable)
GET /api/v1/congress/trades                # Recent trades (filterable)
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

# Capitol Trades API URL
CAPITOL_TRADES_API_URL=http://localhost:8001
```

Most government APIs work without keys. Keys just give you higher rate limits.

## Project Structure

```
lets-talk-statistics/
├── frontend/
│   ├── app/                   # Next.js pages
│   │   ├── page.tsx          # Landing page
│   │   ├── debt/page.tsx     # National debt
│   │   ├── employment/page.tsx
│   │   ├── budget/page.tsx
│   │   ├── elections/page.tsx
│   │   ├── immigration/page.tsx
│   │   └── congress/page.tsx
│   └── components/
│       └── ui/
│           ├── Skeleton.tsx   # Loading skeletons
│           ├── ErrorBoundary.tsx
│           └── ErrorState.tsx
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI app
│   │   ├── config.py         # Settings
│   │   ├── services/
│   │   │   ├── debt_service.py
│   │   │   ├── employment_service.py
│   │   │   ├── budget_service.py
│   │   │   ├── elections_service.py
│   │   │   ├── immigration_service.py
│   │   │   └── congress_service.py
│   │   └── api/v1/endpoints/
│   └── scripts/
│       └── refresh_data.py   # Manual data refresh
├── data/                     # Cache directory
├── Makefile                  # Build commands
└── podman-compose.yml
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

### Build Check

```bash
cd frontend
npm run build  # Verify production build works
```

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Lucide Icons
- **Backend**: FastAPI, Python 3.12, httpx
- **Caching**: File-based JSON (no Redis needed)
- **Containers**: Podman/Docker

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

## Raw Data Downloads

Every page includes a "Download Raw JSON" button at the bottom. Users can grab the same data we display for their own analysis.

## Contributing

1. Fork it
2. Create a feature branch
3. Keep it simple
4. Run `npm run build` to verify frontend builds
5. Submit a PR

## Related Projects

- [Capitol Trades](https://github.com/JonTelep/capitol-trades) - Congressional stock trading data scraper and API

## License

MIT

---

Built by [Telep IO](https://telep.io)
