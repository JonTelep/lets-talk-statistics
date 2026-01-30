"""API v1 router - simplified."""

from fastapi import APIRouter

from app.api.v1.endpoints import debt, employment, budget, elections, immigration

router = APIRouter()

# Include all endpoint routers
# Note: Each router has its own prefix defined in the endpoint file
router.include_router(debt.router)
router.include_router(employment.router)
router.include_router(budget.router)
router.include_router(elections.router)
router.include_router(immigration.router)


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "version": "2.0.0-simplified"}
