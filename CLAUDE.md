# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Let's Talk Statistics is a platform for exploring US crime statistics from government sources (FBI Crime Data Explorer, Census Bureau, Bureau of Justice Statistics). It consists of a FastAPI backend and Next.js frontend that present objective, per-capita crime data with filtering, comparison, and trend visualization.

## Development Commands

### Backend (FastAPI + Celery)

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run development server
python -m uvicorn app.main:app --reload

# Run tests
pytest                                    # All tests
pytest -m unit                            # Unit tests only
pytest -m integration                     # Integration tests only
pytest tests/unit/test_statistics_calculator.py::TestStatisticsCalculator::test_calculate_per_capita_rate_success  # Single test
pytest -k "per_capita"                    # Pattern matching
pytest --cov=app --cov-report=html        # With coverage

# Database migrations
alembic revision --autogenerate -m "Description"
alembic upgrade head
alembic downgrade -1
```

### Frontend (Next.js)

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build and run production
npm run build
npm start

# Lint
npm run lint
```

### Docker (Full Stack)

```bash
# Start all services (backend, frontend, redis, celery worker/beat)
docker-compose up -d

# View logs
docker-compose logs -f backend
```

## Architecture

### Backend Structure

- **app/api/v1/endpoints/** - REST API endpoints organized by domain (statistics, trends, comparisons, rankings, analytics, exports, admin, tasks)
- **app/services/** - Core business logic:
  - `statistics_calculator.py` - Calculates per-capita rates (per 100k population), YoY changes, demographic breakdowns
  - `population_service.py` - Manages population data for per-capita calculations
  - `data_fetcher.py` - Retrieves data from external government sources
  - `csv_processor.py` - Parses and processes FBI CSV data
- **app/tasks/** - Celery tasks for scheduled data fetching and statistics calculation
- **app/models/** - SQLAlchemy models (`crime_data.py`) and Pydantic schemas (`schemas.py`)

### Frontend Structure

- **app/** - Next.js App Router pages (explore, compare, trends, about)
- **components/** - React components organized by feature (charts, filters, data, ui, layout)
- **lib/api/client.ts** - Axios API client configured for backend
- **lib/hooks/** - Custom React hooks for data fetching (useStatistics, useTrends, useRankings)
- **lib/types/api.ts** - TypeScript interfaces matching backend schemas

### Data Flow

1. Raw crime data is fetched from government sources via `data_fetcher.py`
2. CSV files are processed by `csv_processor.py` and stored in `CrimeStatistic` table
3. `statistics_calculator.py` computes per-capita rates using population data and stores in `CalculatedStatistic` table
4. Frontend queries the API endpoints which read from calculated statistics

## Key Technical Details

- Per-capita rates are calculated per 100,000 population (configurable via `per_capita_base` setting)
- All async database operations use SQLAlchemy 2.0 async patterns
- Tests use in-memory SQLite via `aiosqlite` for speed and isolation
- Test markers: `@pytest.mark.unit`, `@pytest.mark.integration`, `@pytest.mark.e2e`, `@pytest.mark.slow`
- API docs available at `/docs` (Swagger) and `/redoc` when backend is running
