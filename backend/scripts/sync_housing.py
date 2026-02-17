#!/usr/bin/env python3
"""
Standalone housing data sync script.

Fetches FRED time-series and upserts into Postgres.
Designed to run via cron (daily at 6 AM):

    0 6 * * * cd /app && python scripts/sync_housing.py

Usage:
    python scripts/sync_housing.py                # incremental sync
    python scripts/sync_housing.py --full-backfill # full history reload
    python scripts/sync_housing.py --validate      # validate series IDs only
"""

import argparse
import asyncio
import sys
import time
from datetime import datetime

# Container-compatible import path
sys.path.insert(0, "/app")

from app.config import get_settings
from app.services.housing.series_config import HOUSING_SERIES
from app.services.housing.sync_service import HousingSyncService

import asyncpg


async def create_pool() -> asyncpg.Pool:
    """Create a standalone asyncpg pool for the script."""
    settings = get_settings()
    return await asyncpg.create_pool(
        host=settings.housing_db_host,
        port=settings.housing_db_port,
        user=settings.housing_db_user,
        password=settings.housing_db_password or None,
        database=settings.housing_db_name,
        min_size=1,
        max_size=5,
    )


async def run_validate() -> bool:
    """Validate all series IDs against FRED API."""
    pool = await create_pool()
    service = HousingSyncService(pool)
    try:
        print(f"[{datetime.now().isoformat()}] Validating {len(HOUSING_SERIES)} series IDs against FRED …\n")
        ok_count = 0
        fail_count = 0

        for i, s in enumerate(HOUSING_SERIES, 1):
            sid = s["series_id"]
            meta = await service.validate_series(sid)
            if meta:
                print(f"  [{i:2d}/{len(HOUSING_SERIES)}] ✓ {sid}: {meta.get('title', '?')}")
                ok_count += 1
            else:
                print(f"  [{i:2d}/{len(HOUSING_SERIES)}] ✗ {sid}: NOT FOUND or invalid")
                fail_count += 1
            # Rate-limit
            await asyncio.sleep(service.REQUEST_DELAY)

        print(f"\nResult: {ok_count} valid, {fail_count} invalid")
        return fail_count == 0
    finally:
        await service.close()
        await pool.close()


async def run_sync(full_backfill: bool) -> bool:
    """Run the sync process."""
    pool = await create_pool()
    service = HousingSyncService(pool)
    try:
        mode = "full backfill" if full_backfill else "incremental"
        print(f"[{datetime.now().isoformat()}] Starting housing sync ({mode}) …")
        print(f"  Series count: {len(HOUSING_SERIES)}")
        start = time.time()

        summary = await service.sync_all(full_backfill=full_backfill)

        elapsed = time.time() - start
        print(f"\n[{datetime.now().isoformat()}] Sync complete!")
        print(f"  Status:        {summary['status']}")
        print(f"  Series synced: {summary['series_synced']}/{summary['series_total']}")
        print(f"  Observations:  {summary['observations_upserted']}")
        print(f"  Errors:        {len(summary['errors'])}")
        print(f"  Duration:      {elapsed:.1f}s")

        if summary["errors"]:
            print("\nErrors:")
            for err in summary["errors"]:
                print(f"  - {err}")

        return summary["status"] != "failure"
    finally:
        await service.close()
        await pool.close()


def main() -> None:
    parser = argparse.ArgumentParser(description="Sync FRED housing data into Postgres")
    parser.add_argument("--full-backfill", action="store_true", help="Reload full history for all series")
    parser.add_argument("--validate", action="store_true", help="Validate series IDs against FRED (no data sync)")
    args = parser.parse_args()

    if args.validate:
        ok = asyncio.run(run_validate())
    else:
        ok = asyncio.run(run_sync(full_backfill=args.full_backfill))

    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
