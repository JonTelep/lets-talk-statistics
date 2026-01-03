"""FBI Crime Data Explorer data fetcher service."""

import asyncio
import hashlib
import os
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any

import httpx
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.models.crime_data import DataSource
from app.utils.logger import get_logger

settings = get_settings()
logger = get_logger(__name__)


class DataFetcherError(Exception):
    """Custom exception for data fetcher errors."""
    pass


class FBIDataFetcher:
    """
    Service for fetching crime statistics data from FBI Crime Data Explorer.

    The FBI CDE provides data through their website and API. This service handles
    downloading, validating, and storing the raw data files.
    """

    def __init__(self, storage_path: Optional[str] = None):
        """
        Initialize the FBI data fetcher.

        Args:
            storage_path: Path to store downloaded files (defaults to config setting)
        """
        self.storage_path = Path(storage_path or settings.data_storage_path)
        self.base_url = settings.fbi_cde_base_url
        self.api_key = settings.fbi_api_key
        self.max_retries = 3
        self.retry_delay = 5  # seconds
        self.timeout = 300  # 5 minutes for large files

        # Ensure storage directory exists
        self.storage_path.mkdir(parents=True, exist_ok=True)

    async def fetch_murder_statistics(
        self,
        year: int,
        db: AsyncSession
    ) -> DataSource:
        """
        Fetch murder statistics data for a specific year.

        Args:
            year: Year to fetch data for
            db: Database session

        Returns:
            DataSource: Created data source record

        Raises:
            DataFetcherError: If download or processing fails
        """
        logger.info(f"Fetching murder statistics for year {year}")

        # Construct download URL
        # Note: This is a placeholder URL structure - needs to be updated
        # based on actual FBI CDE API/download endpoints
        download_url = self._construct_download_url(year, "murder")

        try:
            # Download the file
            file_path, file_hash = await self._download_file(
                url=download_url,
                year=year,
                data_type="murder_statistics"
            )

            # Create data source record
            data_source = DataSource(
                source_name="FBI_UCR",
                source_url=download_url,
                data_type="murder_statistics",
                year=year,
                download_date=datetime.utcnow(),
                file_path=str(file_path),
                file_hash=file_hash,
                status="downloaded",
                metadata={
                    "download_timestamp": datetime.utcnow().isoformat(),
                    "file_size_bytes": os.path.getsize(file_path)
                }
            )

            db.add(data_source)
            await db.commit()
            await db.refresh(data_source)

            logger.info(f"Successfully fetched and stored data for year {year}")
            return data_source

        except Exception as e:
            logger.error(f"Failed to fetch murder statistics for {year}: {str(e)}")
            raise DataFetcherError(f"Failed to fetch data for year {year}: {str(e)}")

    def _construct_download_url(self, year: int, data_type: str) -> str:
        """
        Construct the download URL for FBI CDE data.

        Args:
            year: Year of data
            data_type: Type of crime data

        Returns:
            str: Download URL
        """
        # Note: This is a placeholder implementation
        # The actual FBI CDE may use different URL patterns or require API calls

        # Example URLs from FBI UCR:
        # https://cde.ucr.cjis.gov/LATEST/webapp/#/pages/downloads
        # The actual download might require:
        # 1. Navigating through their web interface
        # 2. Using their API (if available)
        # 3. Direct CSV download links (if provided)

        # For now, constructing a hypothetical URL pattern
        return f"{self.base_url}/api/data/{data_type}/{year}/download.csv"

    async def _download_file(
        self,
        url: str,
        year: int,
        data_type: str
    ) -> tuple[Path, str]:
        """
        Download a file with retry logic and hash calculation.

        Args:
            url: URL to download from
            year: Year of data (for file naming)
            data_type: Type of data (for file naming)

        Returns:
            Tuple of (file_path, file_hash)

        Raises:
            DataFetcherError: If download fails after retries
        """
        # Create versioned filename
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        filename = f"{data_type}_{year}_{timestamp}.csv"
        file_path = self.storage_path / filename

        # Attempt download with retries
        for attempt in range(1, self.max_retries + 1):
            try:
                logger.info(f"Download attempt {attempt}/{self.max_retries} for {url}")

                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    headers = {}
                    if self.api_key:
                        headers["Authorization"] = f"Bearer {self.api_key}"

                    response = await client.get(url, headers=headers, follow_redirects=True)
                    response.raise_for_status()

                    # Write file in chunks
                    with open(file_path, "wb") as f:
                        f.write(response.content)

                    # Calculate file hash
                    file_hash = self._calculate_file_hash(file_path)

                    logger.info(f"Successfully downloaded {filename} (hash: {file_hash[:16]}...)")
                    return file_path, file_hash

            except httpx.HTTPStatusError as e:
                logger.warning(f"HTTP error on attempt {attempt}: {e.response.status_code}")
                if e.response.status_code == 404:
                    raise DataFetcherError(f"Data not found for URL: {url}")
                if attempt < self.max_retries:
                    await asyncio.sleep(self.retry_delay)
                else:
                    raise DataFetcherError(f"Failed to download after {self.max_retries} attempts")

            except httpx.RequestError as e:
                logger.warning(f"Request error on attempt {attempt}: {str(e)}")
                if attempt < self.max_retries:
                    await asyncio.sleep(self.retry_delay)
                else:
                    raise DataFetcherError(f"Network error after {self.max_retries} attempts: {str(e)}")

            except Exception as e:
                logger.error(f"Unexpected error on attempt {attempt}: {str(e)}")
                if file_path.exists():
                    file_path.unlink()  # Clean up partial download
                raise DataFetcherError(f"Unexpected error during download: {str(e)}")

        raise DataFetcherError("Download failed for unknown reason")

    def _calculate_file_hash(self, file_path: Path) -> str:
        """
        Calculate SHA-256 hash of a file.

        Args:
            file_path: Path to file

        Returns:
            str: Hexadecimal hash string
        """
        sha256_hash = hashlib.sha256()

        with open(file_path, "rb") as f:
            # Read file in chunks to handle large files
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)

        return sha256_hash.hexdigest()

    async def check_for_updates(self, db: AsyncSession, year: int) -> bool:
        """
        Check if new data is available for a given year.

        Args:
            db: Database session
            year: Year to check

        Returns:
            bool: True if new data is available
        """
        from sqlalchemy import select

        # Check if we already have data for this year
        query = select(DataSource).where(
            DataSource.year == year,
            DataSource.data_type == "murder_statistics",
            DataSource.status == "processed"
        ).order_by(DataSource.download_date.desc())

        result = await db.execute(query)
        existing_source = result.scalar_one_or_none()

        if not existing_source:
            logger.info(f"No existing data for year {year}")
            return True

        # In a production system, you would:
        # 1. Query the FBI CDE API for latest update timestamp
        # 2. Compare with our last download date
        # 3. Check if file hash has changed

        # For now, return False if we have processed data
        logger.info(f"Already have processed data for year {year} (downloaded {existing_source.download_date})")
        return False

    async def download_from_url(
        self,
        url: str,
        source_name: str,
        data_type: str,
        year: int,
        db: AsyncSession,
        metadata: Optional[Dict[str, Any]] = None
    ) -> DataSource:
        """
        Download data from a direct URL (useful for manual downloads or testing).

        Args:
            url: Direct URL to download from
            source_name: Name of the data source (e.g., 'FBI_UCR', 'BJS')
            data_type: Type of data
            year: Year of data
            db: Database session
            metadata: Optional additional metadata

        Returns:
            DataSource: Created data source record
        """
        logger.info(f"Downloading from URL: {url}")

        try:
            file_path, file_hash = await self._download_file(url, year, data_type)

            data_source = DataSource(
                source_name=source_name,
                source_url=url,
                data_type=data_type,
                year=year,
                download_date=datetime.utcnow(),
                file_path=str(file_path),
                file_hash=file_hash,
                status="downloaded",
                metadata={
                    "download_timestamp": datetime.utcnow().isoformat(),
                    "file_size_bytes": os.path.getsize(file_path),
                    **(metadata or {})
                }
            )

            db.add(data_source)
            await db.commit()
            await db.refresh(data_source)

            return data_source

        except Exception as e:
            logger.error(f"Failed to download from URL {url}: {str(e)}")
            raise DataFetcherError(f"Download failed: {str(e)}")

    async def get_available_years(self) -> list[int]:
        """
        Get list of years with available data from FBI CDE.

        Returns:
            List of years with available data
        """
        # This would typically query the FBI CDE API to get available datasets
        # For now, returning a reasonable range
        current_year = datetime.utcnow().year
        # FBI typically releases data with 1-2 year delay
        return list(range(2010, current_year - 1))
