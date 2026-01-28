"""API v1 router combining all endpoints."""

from fastapi import APIRouter

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

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(
    statistics.router,
    prefix="/statistics",
    tags=["statistics"]
)

api_router.include_router(
    trends.router,
    prefix="/statistics",
    tags=["trends"]
)

api_router.include_router(
    exports.router,
    tags=["exports"]
)

api_router.include_router(
    admin.router,
    prefix="/admin",
    tags=["admin"]
)

api_router.include_router(
    tasks.router,
    prefix="/tasks",
    tags=["tasks"]
)

api_router.include_router(
    comparisons.router,
    prefix="/comparisons",
    tags=["comparisons"]
)

api_router.include_router(
    rankings.router,
    prefix="/rankings",
    tags=["rankings"]
)

api_router.include_router(
    analytics.router,
    prefix="/analytics",
    tags=["analytics"]
)

# Government Data APIs
api_router.include_router(
    budget.router,
    prefix="/budget",
    tags=["budget"]
)

api_router.include_router(
    debt.router,
    prefix="/debt",
    tags=["debt"]
)

api_router.include_router(
    employment.router,
    prefix="/employment",
    tags=["employment"]
)

api_router.include_router(
    elections.router,
    prefix="/elections",
    tags=["elections"]
)
