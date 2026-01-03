"""CLI script for fetching FBI crime data."""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from app.config import get_settings
from app.services.data_fetcher import FBIDataFetcher, DataFetcherError
from app.utils.logger import get_logger

settings = get_settings()
logger = get_logger(__name__)


async def fetch_year(year: int):
    """Fetch data for a specific year."""
    # Create database session
    engine = create_async_engine(settings.database_url, echo=False)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        try:
            fetcher = FBIDataFetcher()

            print(f"\n{'='*60}")
            print(f"Fetching murder statistics for year {year}")
            print(f"{'='*60}\n")

            # Check for existing data
            has_updates = await fetcher.check_for_updates(session, year)

            if not has_updates:
                print(f"✓ Data for year {year} already exists and is up to date")
                print(f"  Use --force to re-download")
                return

            # Fetch data
            print(f"Downloading data for year {year}...")
            data_source = await fetcher.fetch_murder_statistics(year, session)

            print(f"\n✓ Successfully downloaded data")
            print(f"  Source ID: {data_source.id}")
            print(f"  File: {data_source.file_path}")
            print(f"  Hash: {data_source.file_hash[:16]}...")
            print(f"  Status: {data_source.status}")

        except DataFetcherError as e:
            print(f"\n✗ Error: {str(e)}")
            sys.exit(1)
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            print(f"\n✗ Unexpected error: {str(e)}")
            sys.exit(1)
        finally:
            await engine.dispose()


async def fetch_from_url(url: str, source: str, data_type: str, year: int):
    """Fetch data from a direct URL."""
    engine = create_async_engine(settings.database_url, echo=False)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        try:
            fetcher = FBIDataFetcher()

            print(f"\n{'='*60}")
            print(f"Downloading from URL")
            print(f"{'='*60}\n")
            print(f"URL: {url}")
            print(f"Source: {source}")
            print(f"Type: {data_type}")
            print(f"Year: {year}\n")

            data_source = await fetcher.download_from_url(
                url=url,
                source_name=source,
                data_type=data_type,
                year=year,
                db=session
            )

            print(f"\n✓ Successfully downloaded data")
            print(f"  Source ID: {data_source.id}")
            print(f"  File: {data_source.file_path}")
            print(f"  Hash: {data_source.file_hash[:16]}...")

        except DataFetcherError as e:
            print(f"\n✗ Error: {str(e)}")
            sys.exit(1)
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            print(f"\n✗ Unexpected error: {str(e)}")
            sys.exit(1)
        finally:
            await engine.dispose()


async def list_available_years():
    """List available years from FBI."""
    try:
        fetcher = FBIDataFetcher()
        years = await fetcher.get_available_years()

        print(f"\n{'='*60}")
        print(f"Available Years from FBI Crime Data Explorer")
        print(f"{'='*60}\n")

        for year in years:
            print(f"  • {year}")

        print(f"\nTotal: {len(years)} years available")

    except Exception as e:
        print(f"\n✗ Error: {str(e)}")
        sys.exit(1)


def print_usage():
    """Print usage information."""
    print("""
FBI Crime Data Fetcher CLI

Usage:
    python scripts/fetch_data.py year <YEAR>
        Fetch murder statistics for a specific year

    python scripts/fetch_data.py url <URL> <SOURCE> <TYPE> <YEAR>
        Download from a direct URL
        Example: python scripts/fetch_data.py url "https://..." FBI_UCR murder 2022

    python scripts/fetch_data.py list
        List available years

    python scripts/fetch_data.py --help
        Show this help message

Examples:
    python scripts/fetch_data.py year 2022
    python scripts/fetch_data.py list
    python scripts/fetch_data.py url "https://example.com/data.csv" FBI_UCR murder 2022
    """)


def main():
    """Main CLI entry point."""
    if len(sys.argv) < 2 or sys.argv[1] in ["--help", "-h", "help"]:
        print_usage()
        sys.exit(0)

    command = sys.argv[1]

    if command == "year":
        if len(sys.argv) < 3:
            print("Error: Year required")
            print("Usage: python scripts/fetch_data.py year <YEAR>")
            sys.exit(1)

        try:
            year = int(sys.argv[2])
            asyncio.run(fetch_year(year))
        except ValueError:
            print(f"Error: Invalid year '{sys.argv[2]}'")
            sys.exit(1)

    elif command == "url":
        if len(sys.argv) < 6:
            print("Error: Missing arguments")
            print("Usage: python scripts/fetch_data.py url <URL> <SOURCE> <TYPE> <YEAR>")
            sys.exit(1)

        url = sys.argv[2]
        source = sys.argv[3]
        data_type = sys.argv[4]
        try:
            year = int(sys.argv[5])
            asyncio.run(fetch_from_url(url, source, data_type, year))
        except ValueError:
            print(f"Error: Invalid year '{sys.argv[5]}'")
            sys.exit(1)

    elif command == "list":
        asyncio.run(list_available_years())

    else:
        print(f"Error: Unknown command '{command}'")
        print_usage()
        sys.exit(1)


if __name__ == "__main__":
    main()
