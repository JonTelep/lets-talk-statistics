"""API v1 Endpoints."""

from app.api.v1.endpoints import (
    statistics,
    trends,
    exports,
    admin,
    tasks,
    comparisons,
    rankings,
    analytics,
    # NEW: Government data endpoints
    budget,
    debt,
    employment,
    elections,
)

__all__ = [
    "statistics",
    "trends",
    "exports",
    "admin",
    "tasks",
    "comparisons",
    "rankings",
    "analytics",
    "budget",
    "debt",
    "employment",
    "elections",
]
