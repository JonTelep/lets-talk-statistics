"""
Let's Talk Statistics - API Server

Simplified architecture:
- FastAPI for REST endpoints
- File-based JSON caching (no Redis/Postgres needed)
- Direct government API calls with smart caching
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import router as api_router
from app.config import get_settings
from app.services.gov_data import get_gov_data_service
from app.middleware.cache import CacheControlMiddleware

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    # Startup: nothing special needed
    yield
    # Shutdown: close HTTP client
    service = get_gov_data_service()
    await service.close()


app = FastAPI(
    title=settings.app_name,
    description="Government statistics made accessible. Simple, transparent, non-partisan.",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cache-Control headers middleware (enables CDN/browser caching)
app.add_middleware(CacheControlMiddleware)

# Mount API router
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": settings.app_name,
        "version": "2.0.0",
        "docs": "/docs",
        "api": "/api/v1"
    }
