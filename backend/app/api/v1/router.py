"""API v1 router - simplified."""

from fastapi import APIRouter

from app.api.v1.endpoints import debt, employment, budget, elections, immigration, congress, housing, education

router = APIRouter()

# Include all endpoint routers
# Note: Each router has its own prefix defined in the endpoint file
router.include_router(debt.router)
router.include_router(employment.router)
router.include_router(budget.router)
router.include_router(elections.router)
router.include_router(immigration.router)
router.include_router(congress.router)
router.include_router(housing.router)
router.include_router(education.router)


@router.get("/health")
async def health_check():
    """Health check with cache diagnostics."""
    import os
    from datetime import datetime
    from pathlib import Path
    from app.config import get_settings

    settings = get_settings()
    cache_dir = settings.data_dir / "cache"

    cache_files = list(cache_dir.glob("*.json")) if cache_dir.exists() else []
    total_bytes = sum(f.stat().st_size for f in cache_files)
    oldest = min((f.stat().st_mtime for f in cache_files), default=0) if cache_files else 0

    return {
        "status": "healthy",
        "version": "2.1.0",
        "timestamp": datetime.utcnow().isoformat(),
        "cache": {
            "files": len(cache_files),
            "size_mb": round(total_bytes / 1048576, 2),
            "oldest_entry": datetime.fromtimestamp(oldest).isoformat() if oldest else None,
        },
        "endpoints": [
            "debt", "employment", "budget", "elections",
            "immigration", "congress", "housing", "education",
        ],
    }
