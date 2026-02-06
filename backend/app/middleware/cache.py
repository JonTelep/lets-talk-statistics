"""
Cache middleware for adding HTTP cache headers.

This enables CDN (Cloudflare) and browser caching of API responses.
"""

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response


class CacheControlMiddleware(BaseHTTPMiddleware):
    """
    Middleware that adds Cache-Control headers to API responses.
    
    Cache strategy:
    - API data endpoints: 1 hour public cache + 24 hour stale-while-revalidate
    - Health checks: no cache
    - Errors: no cache
    """
    
    # Endpoints that should be cached (prefixes)
    CACHEABLE_PREFIXES = [
        "/api/v1/debt",
        "/api/v1/employment",
        "/api/v1/budget",
        "/api/v1/elections",
        "/api/v1/immigration",
        "/api/v1/congress",
    ]
    
    # Cache durations in seconds
    MAX_AGE = 3600  # 1 hour - fresh cache
    STALE_WHILE_REVALIDATE = 86400  # 24 hours - serve stale while fetching new
    
    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        
        # Only cache successful GET requests
        if request.method != "GET":
            return response
        
        if response.status_code >= 400:
            response.headers["Cache-Control"] = "no-store"
            return response
        
        # Check if this endpoint should be cached
        path = request.url.path
        should_cache = any(path.startswith(prefix) for prefix in self.CACHEABLE_PREFIXES)
        
        if should_cache:
            # Public cache with stale-while-revalidate
            # This tells Cloudflare/browsers to:
            # 1. Serve cached response for 1 hour
            # 2. After 1 hour, serve stale while fetching fresh in background
            # 3. After 24 hours, must revalidate
            response.headers["Cache-Control"] = (
                f"public, max-age={self.MAX_AGE}, "
                f"stale-while-revalidate={self.STALE_WHILE_REVALIDATE}"
            )
            response.headers["Vary"] = "Accept-Encoding"
        else:
            response.headers["Cache-Control"] = "no-cache"
        
        return response
