#!/usr/bin/env python3
"""
Simple data refresh script.

Run manually when you want to refresh cached data:
    python scripts/refresh_data.py

Or refresh specific data:
    python scripts/refresh_data.py --debt
    python scripts/refresh_data.py --employment
    python scripts/refresh_data.py --all

This replaces the need for Celery/Redis background workers.
Government data updates infrequently (annually for most sources),
so a simple manual refresh is sufficient.
"""

import argparse
import asyncio
import sys
from pathlib import Path

# Add parent to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.services.gov_data import GovDataService


async def refresh_all():
    """Refresh all data sources."""
    service = GovDataService()
    
    print("Refreshing all government data sources...\n")
    
    # Clear cache to force refresh
    for cache_file in service.cache_dir.glob("*.json"):
        cache_file.unlink()
        print(f"  Cleared: {cache_file.name}")
    
    print("\nFetching fresh data...")
    
    try:
        print("\n[1/4] Treasury debt data...")
        debt = await service.get_national_debt(days=365)
        print(f"       ✓ Got {len(debt['data'])} records")
        
        print("\n[2/4] BLS unemployment data...")
        unemployment = await service.get_unemployment_rate(years=5)
        print(f"       ✓ Got {len(unemployment['data'])} records")
        
        print("\n[3/4] Census population data...")
        population = await service.get_state_populations()
        print(f"       ✓ Got {len(population['data'])} states")
        
        print("\n[4/4] FEC candidate data...")
        candidates = await service.get_candidate_totals()
        print(f"       ✓ Got {len(candidates['data'])} candidates")
        
        print("\n✅ All data refreshed successfully!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        raise
    finally:
        await service.close()


async def refresh_debt():
    """Refresh debt data only."""
    service = GovDataService()
    try:
        # Remove cached debt files
        for f in service.cache_dir.glob("*debt*.json"):
            f.unlink()
        
        print("Fetching debt data...")
        data = await service.get_national_debt(days=365)
        print(f"✓ Got {len(data['data'])} records")
    finally:
        await service.close()


async def refresh_employment():
    """Refresh employment data only."""
    service = GovDataService()
    try:
        for f in service.cache_dir.glob("*unemployment*.json"):
            f.unlink()
        
        print("Fetching unemployment data...")
        data = await service.get_unemployment_rate(years=5)
        print(f"✓ Got {len(data['data'])} records")
    finally:
        await service.close()


def main():
    parser = argparse.ArgumentParser(description="Refresh government data cache")
    parser.add_argument("--all", action="store_true", help="Refresh all data")
    parser.add_argument("--debt", action="store_true", help="Refresh debt data only")
    parser.add_argument("--employment", action="store_true", help="Refresh employment data only")
    
    args = parser.parse_args()
    
    if args.debt:
        asyncio.run(refresh_debt())
    elif args.employment:
        asyncio.run(refresh_employment())
    else:
        # Default to all
        asyncio.run(refresh_all())


if __name__ == "__main__":
    main()
