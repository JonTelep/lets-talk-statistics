#!/usr/bin/env python3
"""
Cache warming script for Let's Talk Statistics.

Run this on container startup and periodically to pre-warm the cache
so visitors get instant responses instead of waiting for API calls.

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

    # Dynamically add all available service methods
    optional_tasks = [
        ("Unemployment", "get_unemployment"),
        ("Budget Data", "get_budget_data"),
        ("Elections Data", "get_elections_data"),
        ("Immigration Data", "get_immigration_data"),
    ]

    for name, method_name in optional_tasks:
        if hasattr(service, method_name):
            tasks.append((name, getattr(service, method_name)()))

    # Try debt deep dive service (may not exist)
    try:
        from app.services.debt_deep_dive_service import get_debt_deep_dive_service
        deep_dive = get_debt_deep_dive_service()
        tasks.extend([
            ("Debt Holders Composition", deep_dive.get_holders_composition()),
            ("Debt Holders History", deep_dive.get_holders_history()),
            ("Interest Expense", deep_dive.get_interest_expense()),
            ("Avg Interest Rates", deep_dive.get_avg_interest_rates()),
            ("Foreign Holders", deep_dive.get_foreign_holders()),
            ("Debt-to-GDP Ratio", deep_dive.get_debt_to_gdp()),
        ])
    except (ImportError, Exception) as e:
        print(f"  ⚠ Debt deep dive service unavailable: {e}")

    # Try congress service (Capitol Trades)
    try:
        from app.services.congress_service import get_congress_service
        congress = get_congress_service()
        tasks.extend([
            ("Congress Stats", congress.get_stats()),
            ("Recent Trades", congress.get_recent_trades()),
        ])
    except (ImportError, Exception) as e:
        print(f"  ⚠ Congress service unavailable: {e}")

    # Try healthcare service
    try:
        from app.services.healthcare_service import get_healthcare_service
        healthcare = get_healthcare_service()
        tasks.extend([
            ("Healthcare Overview", healthcare.get_overview()),
        ])
    except (ImportError, Exception) as e:
        print(f"  ⚠ Healthcare service unavailable: {e}")

    # Try education service
    try:
        from app.services.education_service import get_education_service
        education = get_education_service()
        tasks.extend([
            ("Education Overview", education.get_overview()),
        ])
    except (ImportError, Exception) as e:
        print(f"  ⚠ Education service unavailable: {e}")

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

    # Clean up
    try:
        await service.close()
    except Exception:
        pass

    try:
        await deep_dive.close()
    except Exception:
        pass

    return success_count == len(tasks)


if __name__ == "__main__":
    success = asyncio.run(warm_cache())
    sys.exit(0 if success else 1)
