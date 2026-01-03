# Let's Talk Statistics

A modern, objective platform for exploring US crime statistics from government sources. No opinions, no narratives - just data from the FBI, Bureau of Justice Statistics, and US Census Bureau.

## Overview

This project consists of a **FastAPI backend** for data processing and API services, and a **Next.js frontend** for data visualization and exploration. The platform emphasizes objective presentation of crime statistics, allowing users to explore data and draw their own conclusions.

## Features

### Frontend
- **Homepage** with clear definitions of "Statistics" and "Per Capita" front and center
- **Explore Page** for browsing crime data with filters and sortable tables
- **Compare Page** for state-to-state and year-to-year comparisons
- **Trends Page** for visualizing crime trends over time with interactive charts
- **About Page** with methodology and data source information
- Modern, responsive design that works on all devices
- No user accounts required - free and open access

### Backend
- Automated data retrieval from FBI Crime Data Explorer
- CSV processing with data validation and normalization
- PostgreSQL database with versioned data storage
- REST API with filtering, aggregation, and comparison capabilities
- Statistical calculations (per capita rates, year-over-year trends)
- Scheduled tasks for automatic data updates
- Comprehensive API documentation

## Technology Stack

### Frontend
- **Framework**: Next.js 15.1.2 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Axios

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL 15+
- **Task Queue**: Celery + Redis
- **Data Processing**: Pandas, NumPy
- **ORM**: SQLAlchemy 2.0
- **Migrations**: Alembic

## Project Structure

```
lets-talk-statistics/
├── frontend/
│   ├── app/              # Next.js pages (App Router)
│   ├── components/       # React components
│   ├── lib/              # API client, types, hooks
│   ├── styles/           # Global styles
│   └── public/           # Static assets
├── backend/
│   ├── app/
│   │   ├── api/          # API endpoints
│   │   ├── models/       # SQLAlchemy models and Pydantic schemas
│   │   ├── services/     # Business logic services
│   │   ├── tasks/        # Celery tasks
│   │   └── utils/        # Utility functions
│   ├── tests/            # Test suites
│   ├── alembic/          # Database migrations
│   └── storage/          # Local data storage
└── docker-compose.yml    # PostgreSQL and Redis services
```

## Quick Start

### Prerequisites

- **Node.js 18+** (for frontend)
- **Python 3.11+** (for backend)
- **Podman and Podman Compose** (for PostgreSQL and Redis)
- **Git**

### Installation

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd lets-talk-statistics
```

#### 2. Start Database Services
```bash
podman compose up -d
```

This starts PostgreSQL and Redis in Podman containers.

#### 3. Set Up Backend

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
alembic upgrade head

# Start the API server
python -m uvicorn app.main:app --reload
```

The backend API will be available at **http://localhost:8000**
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

#### 4. Set Up Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at **http://localhost:3000**

### Verify Installation

1. Check backend is running: Visit http://localhost:8000/docs
2. Check frontend is running: Visit http://localhost:3000
3. Verify the frontend can connect to the backend by navigating through the site

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Statistics
- `GET /api/v1/statistics/crimes` - Get crime statistics with filters
- `GET /api/v1/statistics/per-capita` - Get per capita rates
- `GET /api/v1/statistics/demographics` - Get demographic breakdowns
- `GET /api/v1/statistics/trends` - Get trend data over time
- `GET /api/v1/statistics/list` - List crime statistics with pagination
- `POST /api/v1/statistics/search` - Advanced search with multiple filters

### Comparisons
- `GET /api/v1/comparisons/years` - Compare statistics across multiple years
- `GET /api/v1/comparisons/states` - Compare statistics across multiple states
- `GET /api/v1/comparisons/demographics` - Compare statistics across demographics

### Rankings
- `GET /api/v1/rankings/states` - Get state rankings by per capita rate
- `GET /api/v1/rankings/demographics` - Get demographic rankings
- `GET /api/v1/rankings/top-states` - Get top states with highest rates
- `GET /api/v1/rankings/bottom-states` - Get bottom states with lowest rates
- `GET /api/v1/rankings/biggest-changes` - Get biggest year-over-year changes

### Analytics
- `GET /api/v1/analytics/summary` - Comprehensive analytics summary for time period
- `GET /api/v1/analytics/year-summary/{year}` - Detailed summary for specific year
- `GET /api/v1/analytics/state-profile/{state}` - Comprehensive state profile

### Exports
- `GET /api/v1/csv` - Export data to CSV
- `GET /api/v1/crime-types` - List available crime types
- `GET /api/v1/data-sources` - List available data sources

### Admin (Data Management)
- `POST /api/v1/admin/download/murder-statistics/{year}` - Download data for specific year
- `POST /api/v1/admin/download/from-url` - Download from direct URL
- `POST /api/v1/admin/check-updates/{year}` - Check for data updates
- `GET /api/v1/admin/available-years` - List available years
- `POST /api/v1/admin/process/{data_source_id}` - Process downloaded CSV file
- `GET /api/v1/admin/preview/{data_source_id}` - Preview CSV before processing
- `GET /api/v1/admin/processing-status/{data_source_id}` - Get processing status
- `POST /api/v1/admin/population/fetch/{year}` - Fetch population data
- `GET /api/v1/admin/population/lookup` - Lookup population by demographics
- `GET /api/v1/admin/population/check/{year}` - Check population data exists
- `DELETE /api/v1/admin/population/{year}` - Delete population data
- `GET /api/v1/admin/population/states` - List available states
- `POST /api/v1/admin/statistics/calculate/{year}` - Calculate statistics
- `POST /api/v1/admin/statistics/recalculate/{year}` - Recalculate statistics
- `GET /api/v1/admin/statistics/check/{year}` - Check calculated statistics
- `DELETE /api/v1/admin/statistics/{year}` - Delete calculated statistics

### Tasks (Background Processing)
- `POST /api/v1/tasks/pipeline/full/{year}` - Execute full data pipeline
- `POST /api/v1/tasks/download/{year}` - Download data in background
- `POST /api/v1/tasks/process/{data_source_id}` - Process CSV in background
- `POST /api/v1/tasks/population/{year}` - Fetch population in background
- `POST /api/v1/tasks/statistics/calculate/{year}` - Calculate statistics in background
- `POST /api/v1/tasks/statistics/recalculate/{year}` - Recalculate statistics in background
- `POST /api/v1/tasks/statistics/trends` - Calculate YoY trends in background
- `GET /api/v1/tasks/status/{task_id}` - Get task status and result
- `DELETE /api/v1/tasks/cancel/{task_id}` - Cancel a running task
- `GET /api/v1/tasks/active` - List active tasks
- `GET /api/v1/tasks/stats` - Get worker statistics

### Health
- `GET /health` - Health check endpoint

For complete API documentation with all parameters and examples, see [API Endpoints Documentation](backend/docs/API_ENDPOINTS.md).

## Example API Requests

### Get Murder Statistics by Race and Age Group
```bash
curl "http://localhost:8000/api/v1/statistics/crimes?crime_type=murder&year=2022&race=Black&age_group=18-24"
```

### Get Trend Data
```bash
curl "http://localhost:8000/api/v1/statistics/trends?crime_type=murder&start_year=2018&end_year=2022"
```

### Export to CSV
```bash
curl "http://localhost:8000/api/v1/csv?crime_type=murder&year=2022" -o crime_data.csv
```

### Compare States
```bash
curl "http://localhost:8000/api/v1/comparisons/states?year=2022&states=California,Texas,New York"
```

### Get Top States by Crime Rate
```bash
curl "http://localhost:8000/api/v1/rankings/top-states?year=2022&limit=10"
```

### Get Analytics Summary
```bash
curl "http://localhost:8000/api/v1/analytics/summary?start_year=2018&end_year=2022"
```

### Advanced Search
```bash
curl -X POST "http://localhost:8000/api/v1/statistics/search" \
  -H "Content-Type: application/json" \
  -d '{"crime_type":"murder","years":[2022],"states":["California","Texas"]}'
```

### Download Data (Admin)
```bash
# Download murder statistics for 2022
curl -X POST "http://localhost:8000/api/v1/admin/download/murder-statistics/2022"

# Download from direct URL
curl -X POST "http://localhost:8000/api/v1/admin/download/from-url" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/data.csv", "source_name": "FBI_UCR", "data_type": "murder_statistics", "year": 2022}'
```

## CLI Tool

### Fetch Data for Specific Year
```bash
cd backend
python scripts/fetch_data.py year 2022
```

### List Available Years
```bash
python scripts/fetch_data.py list
```

### Download from URL
```bash
python scripts/fetch_data.py url \
  "https://example.com/fbi_data.csv" \
  FBI_UCR \
  murder_statistics \
  2022
```

### Process Downloaded CSV
```bash
# Preview first
python scripts/process_data.py preview 1 --rows 20

# Process the CSV
python scripts/process_data.py process 1

# List all data sources
python scripts/process_data.py list
```

### Manage Population Data
```bash
# Fetch population data for 2022
python scripts/manage_population.py fetch 2022

# Fetch specific states only
python scripts/manage_population.py fetch 2022 --states California,Texas,Florida

# Lookup population
python scripts/manage_population.py lookup 2022 --state California --race White

# Check if data exists
python scripts/manage_population.py check 2022

# List available states
python scripts/manage_population.py list-states
```

### Calculate Statistics
```bash
# Calculate statistics for 2022
python scripts/calculate_statistics.py calculate 2022

# Calculate for specific crime type
python scripts/calculate_statistics.py calculate 2022 --crime-type murder

# Check if calculated
python scripts/calculate_statistics.py check 2022

# View calculated statistics
python scripts/calculate_statistics.py view 2022

# View by demographic
python scripts/calculate_statistics.py view 2022 --demographic by_race

# Delete calculated statistics
python scripts/calculate_statistics.py delete 2022
```

## Complete Workflow Example

### Full Data Ingestion Pipeline

1. **Download FBI data** (manually or via URL):
```bash
curl -X POST "http://localhost:8000/api/v1/admin/download/from-url" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/fbi_murder_2022.csv",
    "source_name": "FBI_UCR",
    "data_type": "murder_statistics",
    "year": 2022
  }'
```

2. **Preview the CSV** to verify structure:
```bash
curl "http://localhost:8000/api/v1/admin/preview/1?rows=10"
```

3. **Process the CSV** into database:
```bash
curl -X POST "http://localhost:8000/api/v1/admin/process/1?crime_type=murder"
```

4. **Check processing status**:
```bash
curl "http://localhost:8000/api/v1/admin/processing-status/1"
```

5. **Query the data**:
```bash
curl "http://localhost:8000/api/v1/statistics/crimes?year=2022&crime_type=murder&race=White"
```

### Full Data Pipeline (Background Task)

Execute the entire pipeline as a single background task:

```bash
# Submit full pipeline task
curl -X POST "http://localhost:8000/api/v1/tasks/pipeline/full/2022?crime_type=murder"

# Response
{
  "task_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "task_name": "full_data_pipeline",
  "status": "submitted",
  "message": "Full pipeline task submitted for murder 2022"
}

# Check task status
curl "http://localhost:8000/api/v1/tasks/status/a1b2c3d4-e5f6-7890-abcd-ef1234567890"

# Response (completed)
{
  "task_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "state": "SUCCESS",
  "status": "completed",
  "result": {
    "status": "success",
    "year": 2022,
    "crime_type": "murder",
    "records_inserted": 15000,
    "statistics_calculated": 68
  }
}
```

### Background Task Examples

```bash
# Download data in background
curl -X POST "http://localhost:8000/api/v1/tasks/download/2022?crime_type=murder"

# Process CSV in background
curl -X POST "http://localhost:8000/api/v1/tasks/process/1?crime_type=murder"

# Calculate statistics in background
curl -X POST "http://localhost:8000/api/v1/tasks/statistics/calculate/2022?crime_type=murder"

# Calculate YoY trends for multiple years
curl -X POST "http://localhost:8000/api/v1/tasks/statistics/trends?start_year=2018&end_year=2022&crime_type=murder"

# Monitor all active tasks
curl "http://localhost:8000/api/v1/tasks/active"

# Get worker statistics
curl "http://localhost:8000/api/v1/tasks/stats"

# Cancel a running task
curl -X DELETE "http://localhost:8000/api/v1/tasks/cancel/{task_id}"
```

## Database Schema

### Main Tables
- `data_sources` - Tracks downloaded data files with versioning
- `crime_statistics` - Core crime data with demographic breakdowns
- `population_data` - Population statistics for per capita calculations
- `calculated_statistics` - Pre-calculated statistics for performance

## Development

### Running Tests

```bash
cd backend

# Run all tests
pytest

# Run specific test categories
pytest -m unit                    # Unit tests only
pytest -m integration             # Integration tests only
pytest -m e2e                     # End-to-end tests only
pytest -m "not slow"              # Exclude slow tests

# Run specific test file
pytest tests/unit/test_statistics_calculator.py

# Run with verbose output
pytest -v

# Run with coverage
pytest --cov=app --cov-report=html --cov-report=term-missing
```

Using the test runner script:
```bash
cd backend

# Run all tests
./scripts/run_tests.sh all

# Run with coverage
./scripts/run_tests.sh coverage

# Run specific categories
./scripts/run_tests.sh unit
./scripts/run_tests.sh integration
./scripts/run_tests.sh e2e

# Run fast tests only
./scripts/run_tests.sh fast

# Re-run last failed tests
./scripts/run_tests.sh failed
```

View coverage report:
```bash
open htmlcov/index.html     # macOS
xdg-open htmlcov/index.html # Linux
```

For detailed testing documentation, see [Testing Guide](backend/docs/TESTING.md).

### Creating Database Migrations
```bash
alembic revision --autogenerate -m "Description of changes"
alembic upgrade head
```

### Running Celery Worker
```bash
cd backend

# Using the provided script (recommended)
./scripts/start_celery_worker.sh

# Or manually
celery -A app.tasks.celery_app worker --loglevel=info --concurrency=4
```

### Running Celery Beat (Scheduler)
```bash
cd backend

# Using the provided script (recommended)
./scripts/start_celery_beat.sh

# Or manually
celery -A app.tasks.celery_app beat --loglevel=info
```

### Running Flower (Task Monitoring Dashboard)
```bash
cd backend

# Using the provided script (recommended)
./scripts/monitor_celery.sh

# Or manually
pip install flower
celery -A app.tasks.celery_app flower --port=5555
```

Access the monitoring dashboard at: http://localhost:5555

## Data Sources

- **FBI Crime Data Explorer**: https://cde.ucr.cjis.gov
- **Bureau of Justice Statistics**: https://bjs.ojp.gov

## Roadmap

### Phase 1: Core Infrastructure ✅
- [x] Project setup
- [x] Database models
- [x] FastAPI application structure
- [x] Basic API endpoints

### Phase 2: Data Fetcher Service ✅
- [x] FBI data fetcher implementation
- [x] File download with retry logic
- [x] SHA-256 hash verification
- [x] Versioned file storage
- [x] Admin API endpoints
- [x] CLI tool for data management

### Phase 3: CSV Processing Service ✅
- [x] CSV parser with Pandas
- [x] Flexible column mapping
- [x] Data normalization (race, sex, age groups)
- [x] Schema validation
- [x] Data quality checks (outliers, missing data)
- [x] Batch database insertion
- [x] Transaction management
- [x] Processing status tracking
- [x] Preview functionality
- [x] CLI processing tool

### Phase 4: Population Data Integration ✅
- [x] Population service implementation
- [x] US Census Bureau integration framework
- [x] Simulated population data (for development)
- [x] Demographic breakdowns (state, race, age, sex)
- [x] Population lookup and matching
- [x] 51 jurisdictions support (50 states + DC)
- [x] FIPS code mapping
- [x] Population API endpoints
- [x] CLI population management tool

### Phase 5: Statistics Calculation Engine ✅
- [x] Per capita rate calculations
- [x] Year-over-year trend analysis
- [x] Demographic breakdowns (total, race, age, sex, state)
- [x] Pre-calculation for performance optimization
- [x] Statistics API endpoints
- [x] CLI statistics tool

### Phase 6: Scheduled Tasks ✅
- [x] Celery integration with Redis
- [x] Background task processing
- [x] Scheduled data updates (daily, weekly, monthly)
- [x] Full data pipeline orchestration
- [x] Task monitoring API endpoints
- [x] Worker management scripts
- [x] Flower dashboard support

### Phase 7: Complete API Endpoints ✅
- [x] Statistics endpoints with pagination
- [x] Comparison endpoints (years, states, demographics)
- [x] Rankings endpoints (states, demographics, changes)
- [x] Analytics endpoints (summary, profiles)
- [x] Advanced search endpoint
- [x] Comprehensive API documentation

### Phase 8: Testing ✅
- [x] Unit tests for services (statistics calculator, population service)
- [x] Integration tests for API endpoints (statistics, trends, comparisons, rankings)
- [x] End-to-end workflow tests (data pipeline, API workflows)
- [x] Test fixtures and configuration
- [x] Test coverage reporting (pytest-cov)
- [x] Test runner scripts
- [x] Comprehensive test documentation

### Phase 9: Deployment & Optimization
- [ ] Production deployment guide
- [ ] Podman containerization
- [ ] CI/CD pipeline setup
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Load testing
- [ ] Monitoring and alerting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

[License information to be added]

## Support

For questions or issues, please open an issue on GitHub.
