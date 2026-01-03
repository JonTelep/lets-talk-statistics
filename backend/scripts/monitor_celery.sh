#!/bin/bash
# Monitor Celery workers and tasks with Flower

# Change to backend directory
cd "$(dirname "$0")/.."

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Install flower if not already installed
pip install flower --quiet

# Start Flower monitoring dashboard
celery -A app.tasks.celery_app flower \
    --port=5555 \
    --broker=$REDIS_URL
