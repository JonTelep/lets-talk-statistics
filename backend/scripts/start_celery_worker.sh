#!/bin/bash
# Start Celery worker for background tasks

# Change to backend directory
cd "$(dirname "$0")/.."

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Start Celery worker with appropriate settings
celery -A app.tasks.celery_app worker \
    --loglevel=info \
    --concurrency=4 \
    --max-tasks-per-child=1000 \
    --time-limit=3600 \
    --soft-time-limit=3300
