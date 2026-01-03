"""CLI script for processing FBI crime CSV files."""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from app.config import get_settings
from app.models.crime_data import DataSource
from app.services.csv_processor import CSVProcessor, CSVProcessingError
from app.utils.logger import get_logger

settings = get_settings()
logger = get_logger(__name__)


async def process_data_source(data_source_id: int, crime_type: str = "murder"):
    """Process a data source CSV file."""
    engine = create_async_engine(settings.database_url, echo=False)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        try:
            processor = CSVProcessor()

            print(f"\n{'='*60}")
            print(f"Processing Data Source {data_source_id}")
            print(f"{'='*60}\n")

            # Get data source info
            query = select(DataSource).where(DataSource.id == data_source_id)
            result = await session.execute(query)
            data_source = result.scalar_one_or_none()

            if not data_source:
                print(f"✗ Error: Data source {data_source_id} not found")
                sys.exit(1)

            print(f"Source: {data_source.source_name}")
            print(f"Year: {data_source.year}")
            print(f"File: {data_source.file_path}")
            print(f"Status: {data_source.status}\n")

            if data_source.status == "processed":
                print(f"⚠ Warning: Data source already processed")
                print(f"  Use --force to reprocess")
                return

            # Process CSV
            print("Processing CSV file...\n")
            result = await processor.process_data_source(
                data_source_id=data_source_id,
                db=session,
                crime_type=crime_type
            )

            print(f"✓ Processing complete!")
            print(f"\n{'='*60}")
            print(f"Results:")
            print(f"{'='*60}")
            print(f"Status: {result['status']}")
            print(f"Records inserted: {result['records_inserted']}")

            if result.get('quality_issues'):
                print(f"\nData Quality Issues:")
                for issue, details in result['quality_issues'].items():
                    print(f"  • {issue}: {details}")

        except CSVProcessingError as e:
            print(f"\n✗ Processing error: {str(e)}")
            sys.exit(1)
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            print(f"\n✗ Unexpected error: {str(e)}")
            sys.exit(1)
        finally:
            await engine.dispose()


async def preview_data_source(data_source_id: int, rows: int = 10):
    """Preview a CSV file before processing."""
    engine = create_async_engine(settings.database_url, echo=False)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        try:
            processor = CSVProcessor()

            # Get data source
            query = select(DataSource).where(DataSource.id == data_source_id)
            result = await session.execute(query)
            data_source = result.scalar_one_or_none()

            if not data_source:
                print(f"✗ Error: Data source {data_source_id} not found")
                sys.exit(1)

            print(f"\n{'='*60}")
            print(f"CSV Preview - Data Source {data_source_id}")
            print(f"{'='*60}\n")

            # Preview
            preview = processor.preview_csv(data_source.file_path, rows=rows)

            print(f"File: {data_source.file_path}")
            print(f"Total rows: {preview['total_rows']}")
            print(f"Columns: {len(preview['columns'])}\n")

            print("Detected Fields:")
            for field, column in preview['detected_fields'].items():
                status = "✓" if column else "✗"
                print(f"  {status} {field}: {column or 'Not found'}")

            print(f"\nFirst {rows} rows:")
            print("-" * 60)

            if preview['preview']:
                # Print column headers
                headers = list(preview['preview'][0].keys())
                print(" | ".join(h[:15] for h in headers))
                print("-" * 60)

                # Print rows
                for row in preview['preview']:
                    print(" | ".join(str(row[h])[:15] for h in headers))

        except CSVProcessingError as e:
            print(f"\n✗ Preview error: {str(e)}")
            sys.exit(1)
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            print(f"\n✗ Unexpected error: {str(e)}")
            sys.exit(1)
        finally:
            await engine.dispose()


async def list_data_sources(status_filter: str = None):
    """List all data sources."""
    engine = create_async_engine(settings.database_url, echo=False)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        try:
            query = select(DataSource).order_by(DataSource.year.desc(), DataSource.id)

            if status_filter:
                query = query.where(DataSource.status == status_filter)

            result = await session.execute(query)
            sources = result.scalars().all()

            print(f"\n{'='*80}")
            print(f"Data Sources" + (f" (Status: {status_filter})" if status_filter else ""))
            print(f"{'='*80}\n")

            if not sources:
                print("No data sources found.")
                return

            print(f"{'ID':<6} {'Year':<6} {'Type':<20} {'Status':<12} {'Source':<15}")
            print("-" * 80)

            for source in sources:
                print(f"{source.id:<6} {source.year:<6} {source.data_type:<20} "
                      f"{source.status:<12} {source.source_name:<15}")

            print(f"\nTotal: {len(sources)} data sources")

        except Exception as e:
            logger.error(f"Error listing sources: {str(e)}")
            print(f"\n✗ Error: {str(e)}")
            sys.exit(1)
        finally:
            await engine.dispose()


def print_usage():
    """Print usage information."""
    print("""
CSV Data Processor CLI

Usage:
    python scripts/process_data.py process <DATA_SOURCE_ID> [--crime-type TYPE]
        Process a CSV file and insert into database

    python scripts/process_data.py preview <DATA_SOURCE_ID> [--rows N]
        Preview CSV file before processing

    python scripts/process_data.py list [--status STATUS]
        List all data sources

    python scripts/process_data.py --help
        Show this help message

Options:
    --crime-type TYPE    Type of crime (default: murder)
    --rows N            Number of rows to preview (default: 10)
    --status STATUS     Filter by status (downloaded, processed, failed)

Examples:
    # Process a downloaded CSV
    python scripts/process_data.py process 1

    # Preview before processing
    python scripts/process_data.py preview 1 --rows 20

    # List all data sources
    python scripts/process_data.py list

    # List only processed sources
    python scripts/process_data.py list --status processed
    """)


def main():
    """Main CLI entry point."""
    if len(sys.argv) < 2 or sys.argv[1] in ["--help", "-h", "help"]:
        print_usage()
        sys.exit(0)

    command = sys.argv[1]

    if command == "process":
        if len(sys.argv) < 3:
            print("Error: Data source ID required")
            print("Usage: python scripts/process_data.py process <DATA_SOURCE_ID>")
            sys.exit(1)

        try:
            data_source_id = int(sys.argv[2])
            crime_type = "murder"

            # Check for --crime-type option
            if "--crime-type" in sys.argv:
                idx = sys.argv.index("--crime-type")
                if idx + 1 < len(sys.argv):
                    crime_type = sys.argv[idx + 1]

            asyncio.run(process_data_source(data_source_id, crime_type))
        except ValueError:
            print(f"Error: Invalid data source ID '{sys.argv[2]}'")
            sys.exit(1)

    elif command == "preview":
        if len(sys.argv) < 3:
            print("Error: Data source ID required")
            print("Usage: python scripts/process_data.py preview <DATA_SOURCE_ID>")
            sys.exit(1)

        try:
            data_source_id = int(sys.argv[2])
            rows = 10

            # Check for --rows option
            if "--rows" in sys.argv:
                idx = sys.argv.index("--rows")
                if idx + 1 < len(sys.argv):
                    rows = int(sys.argv[idx + 1])

            asyncio.run(preview_data_source(data_source_id, rows))
        except ValueError as e:
            print(f"Error: Invalid parameter - {str(e)}")
            sys.exit(1)

    elif command == "list":
        status_filter = None

        # Check for --status option
        if "--status" in sys.argv:
            idx = sys.argv.index("--status")
            if idx + 1 < len(sys.argv):
                status_filter = sys.argv[idx + 1]

        asyncio.run(list_data_sources(status_filter))

    else:
        print(f"Error: Unknown command '{command}'")
        print_usage()
        sys.exit(1)


if __name__ == "__main__":
    main()
