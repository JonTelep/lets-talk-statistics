"""API endpoints for task management and monitoring."""

from typing import Dict, Any, Optional, List
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from app.tasks.data_tasks import (
    download_fbi_data,
    process_csv_data,
    fetch_population_data,
    full_data_pipeline
)
from app.tasks.statistics_tasks import (
    calculate_statistics,
    recalculate_statistics,
    calculate_yoy_trends
)
from app.tasks.celery_app import celery_app

router = APIRouter()


class TaskResponse(BaseModel):
    """Task submission response."""
    task_id: str
    task_name: str
    status: str
    message: str


class TaskStatusResponse(BaseModel):
    """Task status response."""
    task_id: str
    state: str
    status: str
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


@router.post("/pipeline/full/{year}", response_model=TaskResponse)
async def trigger_full_pipeline(
    year: int,
    crime_type: str = Query(default="murder", description="Type of crime")
) -> TaskResponse:
    """
    Trigger full data pipeline for a year.

    Downloads data, processes CSV, fetches population, and calculates statistics.
    """
    task = full_data_pipeline.apply_async(args=[year, crime_type])

    return TaskResponse(
        task_id=task.id,
        task_name="full_data_pipeline",
        status="submitted",
        message=f"Full pipeline task submitted for {crime_type} {year}"
    )


@router.post("/download/{year}", response_model=TaskResponse)
async def trigger_download(
    year: int,
    crime_type: str = Query(default="murder", description="Type of crime")
) -> TaskResponse:
    """Trigger data download task."""
    task = download_fbi_data.apply_async(args=[year, crime_type])

    return TaskResponse(
        task_id=task.id,
        task_name="download_fbi_data",
        status="submitted",
        message=f"Download task submitted for {crime_type} {year}"
    )


@router.post("/process/{data_source_id}", response_model=TaskResponse)
async def trigger_process(
    data_source_id: int,
    crime_type: str = Query(default="murder", description="Type of crime")
) -> TaskResponse:
    """Trigger CSV processing task."""
    task = process_csv_data.apply_async(args=[data_source_id, crime_type])

    return TaskResponse(
        task_id=task.id,
        task_name="process_csv_data",
        status="submitted",
        message=f"Processing task submitted for data source {data_source_id}"
    )


@router.post("/population/{year}", response_model=TaskResponse)
async def trigger_population_fetch(
    year: int,
    states: Optional[List[str]] = Query(default=None, description="Optional list of states")
) -> TaskResponse:
    """Trigger population data fetch task."""
    task = fetch_population_data.apply_async(args=[year, states])

    return TaskResponse(
        task_id=task.id,
        task_name="fetch_population_data",
        status="submitted",
        message=f"Population fetch task submitted for {year}"
    )


@router.post("/statistics/calculate/{year}", response_model=TaskResponse)
async def trigger_statistics_calculation(
    year: int,
    crime_type: str = Query(default="murder", description="Type of crime"),
    states: Optional[List[str]] = Query(default=None, description="Optional list of states")
) -> TaskResponse:
    """Trigger statistics calculation task."""
    task = calculate_statistics.apply_async(args=[year, crime_type, states])

    return TaskResponse(
        task_id=task.id,
        task_name="calculate_statistics",
        status="submitted",
        message=f"Statistics calculation task submitted for {crime_type} {year}"
    )


@router.post("/statistics/recalculate/{year}", response_model=TaskResponse)
async def trigger_statistics_recalculation(
    year: int,
    crime_type: str = Query(default="murder", description="Type of crime")
) -> TaskResponse:
    """Trigger statistics recalculation task."""
    task = recalculate_statistics.apply_async(args=[year, crime_type])

    return TaskResponse(
        task_id=task.id,
        task_name="recalculate_statistics",
        status="submitted",
        message=f"Statistics recalculation task submitted for {crime_type} {year}"
    )


@router.post("/statistics/trends", response_model=TaskResponse)
async def trigger_trend_calculation(
    start_year: int = Query(..., description="Starting year"),
    end_year: int = Query(..., description="Ending year"),
    crime_type: str = Query(default="murder", description="Type of crime")
) -> TaskResponse:
    """Trigger year-over-year trend calculation."""
    task = calculate_yoy_trends.apply_async(args=[start_year, end_year, crime_type])

    return TaskResponse(
        task_id=task.id,
        task_name="calculate_yoy_trends",
        status="submitted",
        message=f"Trend calculation task submitted for {crime_type} {start_year}-{end_year}"
    )


@router.get("/status/{task_id}", response_model=TaskStatusResponse)
async def get_task_status(task_id: str) -> TaskStatusResponse:
    """
    Get status of a background task.

    States:
    - PENDING: Task is waiting to be executed
    - STARTED: Task has started
    - SUCCESS: Task completed successfully
    - FAILURE: Task failed
    - RETRY: Task is being retried
    - REVOKED: Task was cancelled
    """
    task = celery_app.AsyncResult(task_id)

    if task.state == "PENDING":
        return TaskStatusResponse(
            task_id=task_id,
            state=task.state,
            status="pending",
            result=None
        )
    elif task.state == "STARTED":
        return TaskStatusResponse(
            task_id=task_id,
            state=task.state,
            status="running",
            result=task.info if task.info else None
        )
    elif task.state == "SUCCESS":
        return TaskStatusResponse(
            task_id=task_id,
            state=task.state,
            status="completed",
            result=task.result
        )
    elif task.state == "FAILURE":
        return TaskStatusResponse(
            task_id=task_id,
            state=task.state,
            status="failed",
            error=str(task.info)
        )
    else:
        return TaskStatusResponse(
            task_id=task_id,
            state=task.state,
            status=task.state.lower(),
            result=task.info if task.info else None
        )


@router.delete("/cancel/{task_id}")
async def cancel_task(task_id: str) -> Dict[str, Any]:
    """Cancel a running task."""
    celery_app.control.revoke(task_id, terminate=True)

    return {
        "task_id": task_id,
        "status": "cancelled",
        "message": f"Task {task_id} has been cancelled"
    }


@router.get("/active")
async def get_active_tasks() -> Dict[str, Any]:
    """Get list of active tasks."""
    inspect = celery_app.control.inspect()

    active_tasks = inspect.active()
    scheduled_tasks = inspect.scheduled()
    reserved_tasks = inspect.reserved()

    return {
        "active": active_tasks or {},
        "scheduled": scheduled_tasks or {},
        "reserved": reserved_tasks or {}
    }


@router.get("/stats")
async def get_worker_stats() -> Dict[str, Any]:
    """Get Celery worker statistics."""
    inspect = celery_app.control.inspect()

    stats = inspect.stats()
    registered = inspect.registered()

    return {
        "workers": stats or {},
        "registered_tasks": registered or {}
    }
