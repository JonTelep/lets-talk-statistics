"""Celery application configuration."""

from celery import Celery
from celery.schedules import crontab

from app.config import get_settings

settings = get_settings()

# Initialize Celery app
celery_app = Celery(
    "lets_talk_statistics",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=["app.tasks.data_tasks", "app.tasks.statistics_tasks"]
)

# Celery configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,  # 1 hour max per task
    task_soft_time_limit=3300,  # 55 minutes soft limit
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
    result_expires=86400,  # Results expire after 24 hours
)

# Scheduled tasks configuration
celery_app.conf.beat_schedule = {
    # Check for new FBI data every day at 2 AM UTC
    "check-fbi-updates-daily": {
        "task": "app.tasks.data_tasks.check_fbi_data_updates",
        "schedule": crontab(hour=2, minute=0),
        "args": (),
    },
    # Full data refresh monthly on the 1st at 3 AM UTC
    "monthly-data-refresh": {
        "task": "app.tasks.data_tasks.refresh_all_data",
        "schedule": crontab(hour=3, minute=0, day_of_month=1),
        "args": (),
    },
    # Recalculate statistics weekly on Sunday at 4 AM UTC
    "weekly-statistics-recalculation": {
        "task": "app.tasks.statistics_tasks.recalculate_all_statistics",
        "schedule": crontab(hour=4, minute=0, day_of_week=0),
        "args": (),
    },
}

# Optional: Monitoring and error tracking
celery_app.conf.task_annotations = {
    "*": {
        "rate_limit": "100/m",  # Max 100 tasks per minute
        "time_limit": 3600,
        "soft_time_limit": 3300,
    }
}
