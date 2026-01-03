# Testing Documentation

## Overview

The Let's Talk Statistics backend includes a comprehensive test suite covering unit tests, integration tests, and end-to-end workflows.

## Test Structure

```
backend/tests/
├── __init__.py
├── conftest.py              # Shared fixtures and configuration
├── unit/                    # Unit tests for individual components
│   ├── test_statistics_calculator.py
│   └── test_population_service.py
├── integration/             # Integration tests for API endpoints
│   ├── test_statistics_api.py
│   ├── test_trends_api.py
│   ├── test_comparisons_api.py
│   └── test_rankings_api.py
└── e2e/                     # End-to-end workflow tests
    ├── test_data_pipeline.py
    └── test_api_workflow.py
```

## Running Tests

### Run All Tests

```bash
cd backend
pytest
```

### Run Specific Test Categories

```bash
# Unit tests only
pytest -m unit

# Integration tests only
pytest -m integration

# End-to-end tests only
pytest -m e2e

# Exclude slow tests
pytest -m "not slow"
```

### Run Specific Test Files

```bash
# Run statistics calculator tests
pytest tests/unit/test_statistics_calculator.py

# Run API integration tests
pytest tests/integration/test_statistics_api.py

# Run pipeline workflow tests
pytest tests/e2e/test_data_pipeline.py
```

### Run Specific Test Functions

```bash
# Run a single test function
pytest tests/unit/test_statistics_calculator.py::TestStatisticsCalculator::test_calculate_per_capita_rate_success

# Run tests matching a pattern
pytest -k "per_capita"
```

## Test Coverage

### Generate Coverage Report

```bash
# Run tests with coverage
pytest --cov=app --cov-report=html --cov-report=term

# View HTML report
open htmlcov/index.html  # macOS
# or
xdg-open htmlcov/index.html  # Linux
```

### Coverage Configuration

Coverage settings are defined in `pytest.ini`:
- **Source**: `app/` directory
- **Omit**: Tests, migrations, cache files
- **Target**: Minimum 80% coverage recommended

## Test Markers

Tests are organized using pytest markers:

- `@pytest.mark.unit` - Unit tests for individual functions/classes
- `@pytest.mark.integration` - API endpoint integration tests
- `@pytest.mark.e2e` - End-to-end workflow tests
- `@pytest.mark.slow` - Tests that take significant time
- `@pytest.mark.async` - Asynchronous tests

## Test Fixtures

### Database Fixtures

**`db_engine`** - Creates a test database engine (in-memory SQLite)
```python
async def test_example(db_engine):
    # Use engine
    pass
```

**`db_session`** - Provides a database session for tests
```python
async def test_example(db_session):
    # Use session
    await db_session.add(obj)
    await db_session.commit()
```

**`client`** - HTTP client for API testing
```python
async def test_example(client):
    response = await client.get("/api/v1/statistics/crimes")
    assert response.status_code == 200
```

### Data Fixtures

**`sample_crime_data`** - Sample crime statistic dictionary
**`sample_population_data`** - Sample population data dictionary
**`sample_data_source`** - Sample data source dictionary
**`sample_csv_content`** - Sample CSV content string
**`sample_calculated_statistic`** - Sample calculated statistic dictionary

## Writing Tests

### Unit Test Example

```python
import pytest
from app.services.statistics_calculator import StatisticsCalculator

@pytest.mark.unit
@pytest.mark.asyncio
class TestStatisticsCalculator:
    """Test cases for StatisticsCalculator service."""

    @pytest.fixture
    def calculator(self):
        return StatisticsCalculator()

    async def test_calculate_per_capita_rate(self, calculator):
        """Test per capita rate calculation."""
        result = await calculator.calculate_per_capita_rate(1000, 100000)

        assert result is not None
        assert result == Decimal("1000.0000")
```

### Integration Test Example

```python
import pytest

@pytest.mark.integration
@pytest.mark.asyncio
class TestStatisticsAPI:
    """Test statistics API endpoints."""

    async def test_get_crime_statistics(self, client, db_session):
        """Test getting crime statistics."""
        # Setup test data
        # ... add data to db_session ...

        # Make API request
        response = await client.get(
            "/api/v1/statistics/crimes?crime_type=murder&year=2022"
        )

        # Assert response
        assert response.status_code == 200
        data = response.json()
        assert data["crime_type"] == "murder"
```

### End-to-End Test Example

```python
import pytest

@pytest.mark.e2e
@pytest.mark.asyncio
class TestDataPipeline:
    """Test complete data pipeline."""

    async def test_complete_pipeline(self, db_session):
        """Test full workflow from data ingestion to statistics."""
        # Step 1: Add data source
        # Step 2: Add crime statistics
        # Step 3: Add population data
        # Step 4: Calculate statistics
        # Step 5: Query and verify results

        # ... implementation ...
```

## Test Best Practices

### 1. Test Isolation

Each test should be independent and not rely on other tests:

```python
# Good - self-contained test
async def test_calculate_statistics(db_session):
    # Create all necessary test data
    source = DataSource(...)
    db_session.add(source)
    await db_session.commit()

    # Run test
    result = await calculate(...)

    # Assert
    assert result["status"] == "success"
```

### 2. Use Fixtures for Setup

Extract common setup into fixtures:

```python
@pytest.fixture
async def crime_data_2022(db_session):
    """Create crime data for 2022."""
    source = DataSource(year=2022, ...)
    db_session.add(source)
    await db_session.commit()
    return source

async def test_example(crime_data_2022):
    # crime_data_2022 is already set up
    pass
```

### 3. Test Both Success and Failure Cases

```python
async def test_successful_calculation(calculator):
    result = await calculator.calculate_per_capita_rate(100, 1000)
    assert result is not None

async def test_calculation_with_zero_population(calculator):
    result = await calculator.calculate_per_capita_rate(100, 0)
    assert result is None
```

### 4. Use Descriptive Test Names

```python
# Good - describes what is being tested
async def test_get_crime_statistics_returns_empty_when_no_data_exists():
    pass

# Bad - not descriptive
async def test_crime_stats():
    pass
```

### 5. Test Edge Cases

- Empty data sets
- Zero values
- None/null values
- Very large numbers
- Invalid inputs
- Boundary conditions

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          pip install -r requirements.txt

      - name: Run tests
        run: |
          pytest --cov=app --cov-report=xml

      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

## Debugging Tests

### Run Tests in Verbose Mode

```bash
pytest -vv
```

### Show Print Statements

```bash
pytest -s
```

### Stop on First Failure

```bash
pytest -x
```

### Run Last Failed Tests

```bash
pytest --lf
```

### Drop into Debugger on Failure

```bash
pytest --pdb
```

## Performance Testing

### Identify Slow Tests

```bash
# Show 10 slowest tests
pytest --durations=10
```

### Mark Slow Tests

```python
@pytest.mark.slow
async def test_large_dataset_processing():
    # Long-running test
    pass
```

Skip slow tests during development:
```bash
pytest -m "not slow"
```

## Test Database

Tests use an in-memory SQLite database for speed and isolation:

- **Fast**: No disk I/O
- **Isolated**: Each test gets a fresh database
- **Automatic cleanup**: Database destroyed after each test

For production-like testing with PostgreSQL:
```python
TEST_DATABASE_URL = "postgresql+asyncpg://user:pass@localhost/test_db"
```

## Common Issues

### Issue: "Database is locked"

**Cause**: Multiple tests accessing SQLite simultaneously

**Solution**: Use `poolclass=NullPool` in test engine creation

### Issue: "Fixture not found"

**Cause**: Fixture not imported or not in conftest.py

**Solution**: Move fixture to `tests/conftest.py` or import it

### Issue: "Async test not running"

**Cause**: Missing `@pytest.mark.asyncio` decorator

**Solution**: Add decorator to async test functions

## Additional Resources

- [Pytest Documentation](https://docs.pytest.org/)
- [FastAPI Testing Guide](https://fastapi.tiangolo.com/tutorial/testing/)
- [SQLAlchemy Testing](https://docs.sqlalchemy.org/en/14/orm/session_transaction.html#joining-a-session-into-an-external-transaction-such-as-for-test-suites)
