#!/usr/bin/env python3
"""
Cache warming script for Let's Talk Statistics.

Run this daily (e.g., 5 AM) to pre-warm the cache so the first visitor
of the day gets instant responses instead of waiting for API calls.

Usage:
    python scripts/warm_cache.py
    
Or via cron:
    0 5 * * * cd /app && python scripts/warm_cache.py
"""

import asyncio
import time
from datetime import datetime

import sys
sys.path.insert(0, '/app')

from app.services.gov_data import get_gov_data_service


async def warm_cache():
    """Pre-warm all data caches."""
    service = get_gov_data_service()
    
    print(f"[{datetime.now().isoformat()}] Starting cache warm-up...")
    start = time.time()
    
    tasks = [
        ("National Debt (365 days)", service.get_national_debt(days=365)),
        ("National Debt (30 days)", service.get_national_debt(days=30)),
    ]
    
    # Add other endpoints as they exist
    # These will fail gracefully if methods don't exist
    optional_tasks = [
        ("unemployment", "get_unemployment"),
        ("budget", "get_budget_data"),
        ("elections", "get_elections_data"),
        ("immigration", "get_immigration_data"),
    ]
    
    for name, method_name in optional_tasks:
        if hasattr(service, method_name):
            tasks.append((name.title(), getattr(service, method_name)()))
    
    results = []
    for name, coro in tasks:
        try:
            await coro
            results.append((name, "✓"))
            print(f"  ✓ {name}")
        except Exception as e:
            results.append((name, f"✗ {e}"))
            print(f"  ✗ {name}: {e}")
    
    elapsed = time.time() - start
    success_count = sum(1 for _, status in results if status == "✓")
    
    print(f"\n[{datetime.now().isoformat()}] Cache warm-up complete!")
    print(f"  Warmed: {success_count}/{len(tasks)} endpoints")
    print(f"  Time: {elapsed:.2f}s")
    
    await service.close()
    
    return success_count == len(tasks)


if __name__ == "__main__":
    success = asyncio.run(warm_cache())
    sys.exit(0 if success else 1)
