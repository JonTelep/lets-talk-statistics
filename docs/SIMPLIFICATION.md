# Architecture Simplification

## Overview

This document explains the major simplification of the Let's Talk Statistics backend architecture.

## What Changed

### Before (Overengineered)
- **5 Docker containers**: Redis, Backend, Frontend, Celery Worker, Celery Beat
- **12,654 lines** of Python code
- PostgreSQL database with Alembic migrations
- Complex async task pipelines
- Daily/weekly/monthly scheduled jobs checking for data updates
- Separate service files for each data source (~500 lines each)

### After (Simplified)
- **2 Docker containers**: Backend, Frontend
- **~300 lines** of core Python code
- File-based JSON caching (no external database)
- Direct API calls with smart caching
- Manual refresh script (run when needed)
- Single unified `GovDataService` class

## Why This Makes Sense

### Government Data Update Frequency

| Source | Update Frequency | Old Approach | New Approach |
|--------|-----------------|--------------|--------------|
| FBI Crime Data | Annually (September) | Check daily | Cache 24h, refresh manually |
| Census Population | Annually | Check weekly | Cache 24h, refresh manually |
| Treasury Debt | Daily (historical static) | Check daily | Cache 24h |
| BLS Employment | Monthly | Check weekly | Cache 24h |
| FEC Elections | Varies | Check daily | Cache 24h |

**Running Celery workers 24/7 to check for data that updates once a year is wasteful.**

### What We Removed

1. **Redis** - Not needed. File-based JSON caching works fine for this use case.

2. **Celery Worker + Beat** - Replaced with a simple CLI script:
   ```bash
   python scripts/refresh_data.py --all
   ```

3. **PostgreSQL + Alembic** - Not needed. We're not storing user data. Government data is fetched and cached as JSON files.

4. **Complex service layer** - Consolidated 6 separate service files (~3,000 lines) into one `gov_data.py` (~250 lines).

5. **Admin endpoints** - 847 lines of admin functionality we weren't using.

6. **Statistics calculator** - 569 lines for calculations that can be done in the frontend or with simple Python.

### What We Kept

- **FastAPI** - Simple, fast, good documentation
- **httpx** - Async HTTP client for API calls
- **Pydantic** - Configuration and validation
- **Docker** - Containerization for easy deployment

## New Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                   │
│                      Port 3000                          │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    Backend (FastAPI)                     │
│                      Port 8000                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │              GovDataService                      │   │
│  │  - Treasury API (debt)                          │   │
│  │  - BLS API (employment)                         │   │
│  │  - Census API (population)                      │   │
│  │  - FEC API (elections)                          │   │
│  └─────────────────────┬───────────────────────────┘   │
│                        │                                │
│                        ▼                                │
│  ┌─────────────────────────────────────────────────┐   │
│  │           File Cache (/app/data/cache)          │   │
│  │  - JSON files with TTL                          │   │
│  │  - Auto-refresh when stale                      │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## How to Refresh Data

### Automatic (Recommended)
Data is automatically refreshed when the cache expires (default: 24 hours).

### Manual
```bash
# Refresh all data
docker exec lts_backend python scripts/refresh_data.py --all

# Refresh specific data
docker exec lts_backend python scripts/refresh_data.py --debt
docker exec lts_backend python scripts/refresh_data.py --employment
```

### On Deploy
Add to your deployment script:
```bash
docker exec lts_backend python scripts/refresh_data.py --all
```

## Configuration

All configuration is via environment variables (see `.env.example`):

```bash
# Optional API keys for higher rate limits
CENSUS_API_KEY=your_key
BLS_API_KEY=your_key
FEC_API_KEY=your_key

# Cache settings
CACHE_TTL_HOURS=24  # How long to cache responses
```

## Security

- No database credentials to manage
- No Redis to secure
- API keys are optional (gov APIs have generous anonymous limits)
- CORS configured for frontend only

## Performance

- First request: ~1-2 seconds (API call + cache write)
- Subsequent requests: <50ms (read from JSON file)
- Cache files are small (~10-100KB each)

## Migration Notes

If you have existing data in PostgreSQL, it can be safely ignored - the new system fetches fresh data from government APIs.

The old Celery tasks, database models, and migrations are no longer used but weren't deleted to preserve git history. They can be removed in a future cleanup.
