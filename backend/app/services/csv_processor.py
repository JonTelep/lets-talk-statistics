"""CSV processing service for FBI crime statistics data."""

import re
from pathlib import Path
from typing import Optional, List, Dict, Any, Tuple

import pandas as pd
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.models.crime_data import DataSource, CrimeStatistic
from app.utils.logger import get_logger
from app.utils.validators import validate_csv_schema, validate_year, detect_outliers

settings = get_settings()
logger = get_logger(__name__)


class CSVProcessingError(Exception):
    """Custom exception for CSV processing errors."""
    pass


class CSVProcessor:
    """
    Service for processing FBI crime statistics CSV files.

    Handles parsing, validation, normalization, and database insertion
    of crime statistics data.
    """

    # Expected column mappings for FBI UCR murder data
    # These may need adjustment based on actual FBI CSV format
    COLUMN_MAPPINGS = {
        # Common variations of column names
        "year": ["year", "data_year", "Year", "YEAR"],
        "state": ["state", "state_name", "State", "STATE"],
        "jurisdiction": ["jurisdiction", "agency", "ori", "Agency", "JURISDICTION"],
        "race": ["race", "offender_race", "victim_race", "Race", "RACE"],
        "age_group": ["age_group", "age", "age_range", "Age", "AGE_GROUP"],
        "sex": ["sex", "gender", "Sex", "GENDER"],
        "incident_count": ["count", "incidents", "total", "murders", "COUNT", "INCIDENTS"],
        "population": ["population", "pop", "Population", "POPULATION"],
    }

    # Race standardization mappings
    RACE_MAPPINGS = {
        "white": "White",
        "black": "Black or African American",
        "black or african american": "Black or African American",
        "african american": "Black or African American",
        "asian": "Asian",
        "asian/pacific islander": "Asian",
        "native hawaiian": "Native Hawaiian or Other Pacific Islander",
        "pacific islander": "Native Hawaiian or Other Pacific Islander",
        "american indian": "American Indian or Alaska Native",
        "alaska native": "American Indian or Alaska Native",
        "hispanic": "Hispanic or Latino",
        "latino": "Hispanic or Latino",
        "unknown": "Unknown",
        "other": "Other",
    }

    # Age group standardization
    AGE_GROUP_PATTERNS = {
        r"0[\s-]*17": "0-17",
        r"under[\s]*18": "0-17",
        r"18[\s-]*24": "18-24",
        r"25[\s-]*34": "25-34",
        r"35[\s-]*44": "35-44",
        r"45[\s-]*54": "45-54",
        r"55[\s-]*64": "55-64",
        r"65[\s+]": "65+",
        r"over[\s]*64": "65+",
    }

    def __init__(self):
        """Initialize CSV processor."""
        self.batch_size = 1000  # Insert records in batches

    async def process_data_source(
        self,
        data_source_id: int,
        db: AsyncSession,
        crime_type: str = "murder"
    ) -> Dict[str, Any]:
        """
        Process a data source CSV file and insert into database.

        Args:
            data_source_id: ID of the data source to process
            db: Database session
            crime_type: Type of crime data

        Returns:
            Dict with processing statistics

        Raises:
            CSVProcessingError: If processing fails
        """
        logger.info(f"Processing data source {data_source_id}")

        # Get data source record
        query = select(DataSource).where(DataSource.id == data_source_id)
        result = await db.execute(query)
        data_source = result.scalar_one_or_none()

        if not data_source:
            raise CSVProcessingError(f"Data source {data_source_id} not found")

        if data_source.status == "processed":
            logger.warning(f"Data source {data_source_id} already processed")
            return {"status": "already_processed", "records_inserted": 0}

        try:
            # Read and validate CSV
            df = self._read_csv(data_source.file_path)
            logger.info(f"Read {len(df)} rows from CSV")

            # Validate schema
            validation_errors = self._validate_schema(df)
            if validation_errors:
                raise CSVProcessingError(f"Schema validation failed: {', '.join(validation_errors)}")

            # Normalize data
            df = self._normalize_data(df, crime_type)
            logger.info("Data normalized successfully")

            # Perform data quality checks
            quality_issues = self._check_data_quality(df)
            if quality_issues:
                logger.warning(f"Data quality issues found: {quality_issues}")

            # Insert into database in batches
            records_inserted = await self._insert_records(
                df=df,
                source_id=data_source_id,
                crime_type=crime_type,
                db=db
            )

            # Update data source status
            data_source.status = "processed"
            if not data_source.metadata:
                data_source.metadata = {}
            data_source.metadata["processing_stats"] = {
                "records_inserted": records_inserted,
                "quality_issues": quality_issues,
            }
            await db.commit()

            logger.info(f"Successfully processed {records_inserted} records")

            return {
                "status": "success",
                "records_inserted": records_inserted,
                "quality_issues": quality_issues,
            }

        except Exception as e:
            # Update status to failed
            data_source.status = "failed"
            if not data_source.metadata:
                data_source.metadata = {}
            data_source.metadata["error"] = str(e)
            await db.commit()

            logger.error(f"Failed to process data source {data_source_id}: {str(e)}")
            raise CSVProcessingError(f"Processing failed: {str(e)}")

    def _read_csv(self, file_path: str) -> pd.DataFrame:
        """
        Read CSV file with error handling.

        Args:
            file_path: Path to CSV file

        Returns:
            DataFrame with CSV data

        Raises:
            CSVProcessingError: If file cannot be read
        """
        try:
            path = Path(file_path)
            if not path.exists():
                raise CSVProcessingError(f"File not found: {file_path}")

            # Try reading with different encodings
            encodings = ['utf-8', 'latin-1', 'iso-8859-1', 'cp1252']
            df = None

            for encoding in encodings:
                try:
                    df = pd.read_csv(
                        file_path,
                        encoding=encoding,
                        low_memory=False
                    )
                    logger.info(f"Successfully read CSV with {encoding} encoding")
                    break
                except UnicodeDecodeError:
                    continue

            if df is None:
                raise CSVProcessingError("Failed to read CSV with any encoding")

            # Basic validation
            if df.empty:
                raise CSVProcessingError("CSV file is empty")

            return df

        except Exception as e:
            raise CSVProcessingError(f"Failed to read CSV: {str(e)}")

    def _validate_schema(self, df: pd.DataFrame) -> List[str]:
        """
        Validate that CSV has required columns.

        Args:
            df: DataFrame to validate

        Returns:
            List of validation errors (empty if valid)
        """
        errors = []

        # Check for at least one mapping of each required field
        required_fields = ["year", "incident_count"]

        for field in required_fields:
            possible_names = self.COLUMN_MAPPINGS.get(field, [])
            if not any(col in df.columns for col in possible_names):
                errors.append(f"Missing required field: {field} (tried: {', '.join(possible_names)})")

        # Check for at least some demographic or location data
        optional_fields = ["state", "race", "age_group", "sex", "jurisdiction"]
        has_demographic = any(
            any(col in df.columns for col in self.COLUMN_MAPPINGS.get(field, []))
            for field in optional_fields
        )

        if not has_demographic:
            errors.append("No demographic or location columns found")

        return errors

    def _normalize_data(self, df: pd.DataFrame, crime_type: str) -> pd.DataFrame:
        """
        Normalize data: standardize column names and values.

        Args:
            df: DataFrame to normalize
            crime_type: Type of crime

        Returns:
            Normalized DataFrame
        """
        # Create new dataframe with standardized columns
        normalized = pd.DataFrame()

        # Map columns to standard names
        for standard_name, possible_names in self.COLUMN_MAPPINGS.items():
            for col_name in possible_names:
                if col_name in df.columns:
                    normalized[standard_name] = df[col_name]
                    break

        # Ensure year column exists and is valid
        if "year" in normalized.columns:
            normalized["year"] = pd.to_numeric(normalized["year"], errors="coerce")
            normalized = normalized[normalized["year"].notna()]
        else:
            # If no year column, this might be in metadata or filename
            logger.warning("No year column found in CSV")

        # Normalize race values
        if "race" in normalized.columns:
            normalized["race"] = normalized["race"].apply(self._normalize_race)

        # Normalize sex values
        if "sex" in normalized.columns:
            normalized["sex"] = normalized["sex"].apply(self._normalize_sex)

        # Normalize age groups
        if "age_group" in normalized.columns:
            normalized["age_group"] = normalized["age_group"].apply(self._normalize_age_group)

        # Ensure incident_count is numeric
        if "incident_count" in normalized.columns:
            normalized["incident_count"] = pd.to_numeric(
                normalized["incident_count"],
                errors="coerce"
            ).fillna(0).astype(int)

        # Ensure population is numeric
        if "population" in normalized.columns:
            normalized["population"] = pd.to_numeric(
                normalized["population"],
                errors="coerce"
            )

        # Add crime_type
        normalized["crime_type"] = crime_type

        # Remove rows with missing critical data
        normalized = normalized[normalized["incident_count"].notna()]

        return normalized

    def _normalize_race(self, value: Any) -> str:
        """Normalize race values to standard categories."""
        if pd.isna(value):
            return "Unknown"

        value_str = str(value).strip().lower()

        # Check mappings
        for key, standard in self.RACE_MAPPINGS.items():
            if key in value_str:
                return standard

        # If no mapping found, capitalize original
        return str(value).strip().title() if value else "Unknown"

    def _normalize_sex(self, value: Any) -> str:
        """Normalize sex values to standard format."""
        if pd.isna(value):
            return "Unknown"

        value_str = str(value).strip().lower()

        if value_str in ["m", "male", "males"]:
            return "Male"
        elif value_str in ["f", "female", "females"]:
            return "Female"
        else:
            return "Unknown"

    def _normalize_age_group(self, value: Any) -> Optional[str]:
        """Normalize age group values."""
        if pd.isna(value):
            return None

        value_str = str(value).strip().lower()

        # Check patterns
        for pattern, standard in self.AGE_GROUP_PATTERNS.items():
            if re.search(pattern, value_str):
                return standard

        # Return original if no pattern matches
        return str(value).strip() if value else None

    def _check_data_quality(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Perform data quality checks.

        Args:
            df: DataFrame to check

        Returns:
            Dictionary of quality issues found
        """
        issues = {}

        # Check for negative incident counts
        if "incident_count" in df.columns:
            negative_counts = (df["incident_count"] < 0).sum()
            if negative_counts > 0:
                issues["negative_counts"] = negative_counts

        # Check for outliers in incident counts
        if "incident_count" in df.columns:
            outlier_indices = detect_outliers(df["incident_count"].tolist(), threshold=3.0)
            if outlier_indices:
                issues["outlier_count"] = len(outlier_indices)
                issues["outlier_values"] = df.iloc[outlier_indices]["incident_count"].tolist()[:10]

        # Check for missing years
        if "year" in df.columns:
            invalid_years = df[~df["year"].apply(validate_year)].shape[0]
            if invalid_years > 0:
                issues["invalid_years"] = invalid_years

        # Check data completeness
        total_rows = len(df)
        for col in ["state", "race", "age_group", "sex"]:
            if col in df.columns:
                missing = df[col].isna().sum()
                if missing > 0:
                    issues[f"missing_{col}"] = {
                        "count": int(missing),
                        "percentage": round((missing / total_rows) * 100, 2)
                    }

        return issues

    async def _insert_records(
        self,
        df: pd.DataFrame,
        source_id: int,
        crime_type: str,
        db: AsyncSession
    ) -> int:
        """
        Insert records into database in batches.

        Args:
            df: DataFrame with normalized data
            source_id: Data source ID
            crime_type: Type of crime
            db: Database session

        Returns:
            Number of records inserted
        """
        records_inserted = 0

        # Process in batches
        for start_idx in range(0, len(df), self.batch_size):
            end_idx = min(start_idx + self.batch_size, len(df))
            batch = df.iloc[start_idx:end_idx]

            crime_records = []
            for _, row in batch.iterrows():
                record = CrimeStatistic(
                    source_id=source_id,
                    year=int(row.get("year")) if pd.notna(row.get("year")) else None,
                    crime_type=crime_type,
                    state=row.get("state") if pd.notna(row.get("state")) else None,
                    jurisdiction=row.get("jurisdiction") if pd.notna(row.get("jurisdiction")) else None,
                    age_group=row.get("age_group") if pd.notna(row.get("age_group")) else None,
                    race=row.get("race") if pd.notna(row.get("race")) else None,
                    sex=row.get("sex") if pd.notna(row.get("sex")) else None,
                    incident_count=int(row.get("incident_count", 0)),
                    population=int(row.get("population")) if pd.notna(row.get("population")) else None,
                )
                crime_records.append(record)

            # Insert batch
            db.add_all(crime_records)
            await db.flush()  # Flush but don't commit yet

            records_inserted += len(crime_records)
            logger.info(f"Inserted batch {start_idx}-{end_idx} ({len(crime_records)} records)")

        # Commit all batches
        await db.commit()

        return records_inserted

    def preview_csv(self, file_path: str, rows: int = 10) -> Dict[str, Any]:
        """
        Preview CSV file without processing.

        Args:
            file_path: Path to CSV file
            rows: Number of rows to preview

        Returns:
            Dictionary with preview information
        """
        try:
            df = self._read_csv(file_path)

            return {
                "total_rows": len(df),
                "columns": list(df.columns),
                "preview": df.head(rows).to_dict(orient="records"),
                "detected_fields": self._detect_fields(df),
            }

        except Exception as e:
            logger.error(f"Failed to preview CSV: {str(e)}")
            raise CSVProcessingError(f"Preview failed: {str(e)}")

    def _detect_fields(self, df: pd.DataFrame) -> Dict[str, Optional[str]]:
        """
        Detect which standard fields are present in CSV.

        Args:
            df: DataFrame to analyze

        Returns:
            Dictionary mapping standard fields to detected column names
        """
        detected = {}

        for standard_name, possible_names in self.COLUMN_MAPPINGS.items():
            for col_name in possible_names:
                if col_name in df.columns:
                    detected[standard_name] = col_name
                    break
            if standard_name not in detected:
                detected[standard_name] = None

        return detected
