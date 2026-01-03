#!/bin/bash
# Start Celery beat scheduler for periodic tasks

# Change to backend directory
cd "$(dirname "$0")/.."

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Start Celery beat scheduler
celery -A app.tasks.celery_app beat \
    --loglevel=info \
    --scheduler=celery.beat:PersistentScheduler
