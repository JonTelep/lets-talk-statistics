# Scheduled Tasks Documentation

## Overview

The scheduled tasks system uses **Celery** with **Redis** as the message broker and result backend. This enables background processing for long-running operations and automated data updates.

## Features

- **Background Task Processing**: Execute long-running operations asynchronously
- **Scheduled Tasks**: Automated data updates on configurable schedules
- **Task Monitoring**: Track task status and results
- **Retry Logic**: Automatic retries on failure
- **Task Chaining**: Build complex data pipelines
- **Web Dashboard**: Monitor tasks with Flower

## Architecture

```
FastAPI API
    ↓ (submit task)
Redis Broker
    ↓ (consume)
Celery Workers (1-N workers)
    ↓ (execute)
Background Tasks
    ↓ (store result)
Redis Backend
    ↑ (query status)
API Endpoints
```

## Scheduled Tasks

### Daily: Check for FBI Data Updates

**Schedule**: Every day at 2:00 AM UTC
**Task**: `check_fbi_data_updates`

Checks if new FBI data is available (typically released in August/September for previous year).

Workflow:
1. Determine if it's the right time of year (August+)
2. Check for previous year's data
3. Download if available
4. Process CSV automatically
5. Fetch population data
6. Calculate statistics

### Monthly: Full Data Refresh

**Schedule**: 1st of each month at 3:00 AM UTC
**Task**: `refresh_all_data`

Re-downloads and reprocesses the last 5 years of data.

Workflow:
1. Download data for last 5 years
2. Process each year's CSV
3. Log results

### Weekly: Recalculate Statistics

**Schedule**: Every Sunday at 4:00 AM UTC
**Task**: `recalculate_all_statistics`

Recalculates all statistics to ensure data consistency.

Workflow:
1. Get all year/crime_type combinations
2. Recalculate statistics for each
3. Update calculated_statistics table

## Background Tasks

### Data Pipeline Tasks

#### 1. Full Data Pipeline
Execute complete data ingestion for a year.

```python
full_data_pipeline(year, crime_type)
```

Steps:
1. Download FBI data
2. Process CSV
3. Fetch population data
4. Calculate statistics

#### 2. Download FBI Data
Download crime data CSV for a year.

```python
download_fbi_data(year, crime_type)
```

#### 3. Process CSV Data
Process downloaded CSV into database.

```python
process_csv_data(data_source_id, crime_type)
```

#### 4. Fetch Population Data
Fetch population data for a year.

```python
fetch_population_data(year, states)
```

### Statistics Tasks

#### 1. Calculate Statistics
Calculate statistics for a year.

```python
calculate_statistics(year, crime_type, states)
```

#### 2. Recalculate Statistics
Recalculate statistics (deletes and recalculates).

```python
recalculate_statistics(year, crime_type)
```

#### 3. Calculate YoY Trends
Calculate year-over-year trends for a range.

```python
calculate_yoy_trends(start_year, end_year, crime_type)
```

## API Endpoints

### Trigger Tasks

#### Full Pipeline
```bash
POST /api/v1/tasks/pipeline/full/{year}?crime_type=murder
```

Response:
```json
{
  "task_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "task_name": "full_data_pipeline",
  "status": "submitted",
  "message": "Full pipeline task submitted for murder 2022"
}
```

#### Download Data
```bash
POST /api/v1/tasks/download/{year}?crime_type=murder
```

#### Process CSV
```bash
POST /api/v1/tasks/process/{data_source_id}?crime_type=murder
```

#### Fetch Population
```bash
POST /api/v1/tasks/population/{year}
```

#### Calculate Statistics
```bash
POST /api/v1/tasks/statistics/calculate/{year}?crime_type=murder
```

#### Recalculate Statistics
```bash
POST /api/v1/tasks/statistics/recalculate/{year}?crime_type=murder
```

#### Calculate Trends
```bash
POST /api/v1/tasks/statistics/trends?start_year=2018&end_year=2022&crime_type=murder
```

### Monitor Tasks

#### Get Task Status
```bash
GET /api/v1/tasks/status/{task_id}
```

Response:
```json
{
  "task_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "state": "SUCCESS",
  "status": "completed",
  "result": {
    "status": "success",
    "year": 2022,
    "records_inserted": 15000
  }
}
```

Task states:
- `PENDING`: Waiting to execute
- `STARTED`: Currently running
- `SUCCESS`: Completed successfully
- `FAILURE`: Failed with error
- `RETRY`: Being retried
- `REVOKED`: Cancelled

#### Cancel Task
```bash
DELETE /api/v1/tasks/cancel/{task_id}
```

#### Get Active Tasks
```bash
GET /api/v1/tasks/active
```

Response:
```json
{
  "active": {
    "worker1@hostname": [
      {
        "id": "task-id",
        "name": "full_data_pipeline",
        "args": [2022, "murder"]
      }
    ]
  },
  "scheduled": {},
  "reserved": {}
}
```

#### Get Worker Stats
```bash
GET /api/v1/tasks/stats
```

Response:
```json
{
  "workers": {
    "worker1@hostname": {
      "total": 150,
      "pool": {
        "max-concurrency": 4,
        "processes": [12345, 12346, 12347, 12348]
      }
    }
  },
  "registered_tasks": {
    "worker1@hostname": [
      "app.tasks.data_tasks.full_data_pipeline",
      "app.tasks.data_tasks.download_fbi_data",
      ...
    ]
  }
}
```

## Running Celery

### Start Celery Worker

```bash
cd backend

# Using the provided script
./scripts/start_celery_worker.sh

# Or manually
celery -A app.tasks.celery_app worker --loglevel=info
```

Worker options:
- `--concurrency=4`: Run 4 worker processes
- `--max-tasks-per-child=1000`: Restart worker after 1000 tasks
- `--time-limit=3600`: Hard limit of 1 hour per task
- `--soft-time-limit=3300`: Soft limit of 55 minutes

### Start Celery Beat (Scheduler)

```bash
cd backend

# Using the provided script
./scripts/start_celery_beat.sh

# Or manually
celery -A app.tasks.celery_app beat --loglevel=info
```

### Start Flower (Monitoring Dashboard)

```bash
cd backend

# Using the provided script
./scripts/monitor_celery.sh

# Or manually
pip install flower
celery -A app.tasks.celery_app flower --port=5555
```

Access dashboard at: http://localhost:5555

## Usage Examples

### Example 1: Full Data Pipeline via API

```bash
# Submit task
curl -X POST "http://localhost:8000/api/v1/tasks/pipeline/full/2022?crime_type=murder"

# Response
{
  "task_id": "abc123...",
  "task_name": "full_data_pipeline",
  "status": "submitted",
  "message": "Full pipeline task submitted for murder 2022"
}

# Check status
curl "http://localhost:8000/api/v1/tasks/status/abc123..."

# Response (in progress)
{
  "task_id": "abc123...",
  "state": "STARTED",
  "status": "running"
}

# Response (completed)
{
  "task_id": "abc123...",
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

### Example 2: Calculate Statistics in Background

```bash
# Submit calculation task
curl -X POST "http://localhost:8000/api/v1/tasks/statistics/calculate/2022?crime_type=murder"

# Monitor with task ID
curl "http://localhost:8000/api/v1/tasks/status/{task_id}"
```

### Example 3: Programmatic Task Submission

```python
from app.tasks.data_tasks import full_data_pipeline

# Submit task
task = full_data_pipeline.apply_async(args=[2022, "murder"])

# Get task ID
print(f"Task ID: {task.id}")

# Check status
result = task.get(timeout=10)  # Wait up to 10 seconds
print(result)

# Or check without waiting
if task.ready():
    print(f"Result: {task.result}")
else:
    print(f"Status: {task.state}")
```

### Example 4: Task Chaining

```python
from celery import chain
from app.tasks.data_tasks import download_fbi_data, process_csv_data
from app.tasks.statistics_tasks import calculate_statistics

# Chain tasks together
workflow = chain(
    download_fbi_data.s(2022, "murder"),
    process_csv_data.s("murder"),  # Receives data_source_id from previous
    calculate_statistics.s(2022, "murder")
)

# Execute chain
result = workflow.apply_async()
```

## Configuration

### Celery Settings

Located in `backend/app/tasks/celery_app.py`:

```python
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,  # 1 hour max
    task_soft_time_limit=3300,  # 55 minutes
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
    result_expires=86400,  # 24 hours
)
```

### Scheduled Task Configuration

```python
celery_app.conf.beat_schedule = {
    "check-fbi-updates-daily": {
        "task": "app.tasks.data_tasks.check_fbi_data_updates",
        "schedule": crontab(hour=2, minute=0),
    },
    "monthly-data-refresh": {
        "task": "app.tasks.data_tasks.refresh_all_data",
        "schedule": crontab(hour=3, minute=0, day_of_month=1),
    },
    "weekly-statistics-recalculation": {
        "task": "app.tasks.statistics_tasks.recalculate_all_statistics",
        "schedule": crontab(hour=4, minute=0, day_of_week=0),
    },
}
```

### Environment Variables

Required in `.env`:

```bash
REDIS_URL=redis://localhost:6379/0
```

## Monitoring

### Flower Dashboard

Flower provides a web-based dashboard for monitoring:

1. **Tasks**: View running, completed, and failed tasks
2. **Workers**: Monitor worker status and performance
3. **Broker**: View queue sizes and message rates
4. **Graphs**: Task completion rates over time

Features:
- Real-time task monitoring
- Task details and arguments
- Task execution time graphs
- Worker pool management
- Task result inspection
- Task retry/revoke controls

### Logs

Celery logs to stdout/stderr:

```bash
# View worker logs
tail -f celery_worker.log

# View beat logs
tail -f celery_beat.log
```

### Command Line Inspection

```bash
# Check active tasks
celery -A app.tasks.celery_app inspect active

# Check scheduled tasks
celery -A app.tasks.celery_app inspect scheduled

# Check worker stats
celery -A app.tasks.celery_app inspect stats

# Check registered tasks
celery -A app.tasks.celery_app inspect registered

# Revoke a task
celery -A app.tasks.celery_app control revoke <task_id>

# Purge all tasks
celery -A app.tasks.celery_app purge
```

## Error Handling

### Automatic Retries

Tasks can be configured to retry on failure:

```python
@celery_app.task(
    bind=True,
    autoretry_for=(Exception,),
    retry_kwargs={'max_retries': 3, 'countdown': 60},
    retry_backoff=True
)
def my_task(self, arg):
    # Task code
    pass
```

### Failed Task Handling

When a task fails:
1. Error is logged
2. Task result shows FAILURE state
3. Error details in result
4. Can be retried manually or automatically

Query failed tasks:

```bash
curl "http://localhost:8000/api/v1/tasks/status/{task_id}"
```

Response:
```json
{
  "task_id": "abc123",
  "state": "FAILURE",
  "status": "failed",
  "error": "DataFetcherError: File not found"
}
```

## Production Deployment

### Running as a Service

#### systemd service for worker

Create `/etc/systemd/system/celery.service`:

```ini
[Unit]
Description=Celery Worker
After=network.target redis.target

[Service]
Type=forking
User=www-data
Group=www-data
WorkingDirectory=/path/to/backend
Environment=PATH=/path/to/venv/bin
ExecStart=/path/to/venv/bin/celery -A app.tasks.celery_app worker \
    --loglevel=info --concurrency=4 --detach \
    --pidfile=/var/run/celery/worker.pid \
    --logfile=/var/log/celery/worker.log

[Install]
WantedBy=multi-user.target
```

#### systemd service for beat

Create `/etc/systemd/system/celerybeat.service`:

```ini
[Unit]
Description=Celery Beat Scheduler
After=network.target redis.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/path/to/backend
Environment=PATH=/path/to/venv/bin
ExecStart=/path/to/venv/bin/celery -A app.tasks.celery_app beat \
    --loglevel=info \
    --pidfile=/var/run/celery/beat.pid \
    --logfile=/var/log/celery/beat.log

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable celery celerybeat
sudo systemctl start celery celerybeat
sudo systemctl status celery celerybeat
```

### Multiple Workers

For better performance, run multiple workers:

```bash
# Worker 1: Data tasks
celery -A app.tasks.celery_app worker -Q data_queue -n data_worker@%h

# Worker 2: Statistics tasks
celery -A app.tasks.celery_app worker -Q stats_queue -n stats_worker@%h

# Worker 3: General tasks
celery -A app.tasks.celery_app worker -Q default -n general_worker@%h
```

## Best Practices

### 1. Task Design

- Keep tasks small and focused
- Make tasks idempotent (safe to retry)
- Use timeouts to prevent hanging
- Log important events
- Return structured results

### 2. Performance

- Use task queues to prioritize
- Set appropriate concurrency
- Monitor task execution time
- Use caching where appropriate
- Batch operations when possible

### 3. Reliability

- Always use try/except in tasks
- Configure retries appropriately
- Monitor failed tasks
- Set up alerting
- Test tasks thoroughly

### 4. Monitoring

- Use Flower for real-time monitoring
- Set up log aggregation
- Track task completion rates
- Monitor worker health
- Alert on failures

## Troubleshooting

### Issue: Tasks not executing

**Symptoms**: Tasks submitted but never run

**Solutions**:
1. Check if Celery worker is running
2. Verify Redis connection
3. Check worker logs for errors
4. Ensure task is registered

```bash
celery -A app.tasks.celery_app inspect registered
```

### Issue: Tasks timing out

**Symptoms**: Tasks fail with timeout error

**Solutions**:
1. Increase task time limits
2. Optimize task code
3. Break into smaller tasks
4. Increase worker concurrency

### Issue: Memory leaks

**Symptoms**: Worker memory grows over time

**Solutions**:
1. Set `max-tasks-per-child` to restart workers periodically
2. Close database connections properly
3. Clear large data structures
4. Use `apply_async` instead of `delay`

### Issue: Tasks stuck in PENDING

**Symptoms**: Task shows PENDING forever

**Solutions**:
1. Task ID might be wrong
2. Task result expired (>24 hours)
3. Redis connection lost
4. Worker crashed before receiving task

## Related Documentation

- [Data Fetcher](DATA_FETCHER.md) - Download tasks
- [CSV Processor](CSV_PROCESSOR.md) - Processing tasks
- [Statistics Calculator](STATISTICS_CALCULATOR.md) - Statistics tasks
- [Population Service](POPULATION_SERVICE.md) - Population tasks
