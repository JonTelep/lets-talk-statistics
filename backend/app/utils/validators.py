"""Data validation utilities."""

from typing import Any, Dict, List, Optional

import pandas as pd


def validate_csv_schema(
    df: pd.DataFrame,
    required_columns: List[str],
    optional_columns: Optional[List[str]] = None
) -> tuple[bool, List[str]]:
    """
    Validate that a DataFrame has required columns.

    Args:
        df: DataFrame to validate
        required_columns: List of required column names
        optional_columns: List of optional column names

    Returns:
        Tuple of (is_valid, list_of_errors)
    """
    errors = []

    # Check for required columns
    missing_required = set(required_columns) - set(df.columns)
    if missing_required:
        errors.append(f"Missing required columns: {', '.join(missing_required)}")

    return len(errors) == 0, errors


def validate_year(year: int) -> bool:
    """
    Validate that a year is reasonable.

    Args:
        year: Year to validate

    Returns:
        True if year is valid
    """
    return 1900 <= year <= 2100


def validate_demographic_value(demographic_type: str, value: Any) -> bool:
    """
    Validate demographic values based on type.

    Args:
        demographic_type: Type of demographic (race, age_group, sex)
        value: Value to validate

    Returns:
        True if value is valid for the demographic type
    """
    if value is None:
        return True

    if demographic_type == "sex":
        valid_values = ["Male", "Female", "Unknown", "M", "F"]
        return value in valid_values

    if demographic_type == "age_group":
        # Basic validation - can be expanded
        return isinstance(value, str) and len(value) > 0

    if demographic_type == "race":
        # Basic validation - can be expanded with official categories
        return isinstance(value, str) and len(value) > 0

    return True


def normalize_sex_value(value: str) -> str:
    """
    Normalize sex values to standard format.

    Args:
        value: Raw sex value

    Returns:
        Normalized sex value
    """
    if not value:
        return "Unknown"

    value_upper = value.upper().strip()
    if value_upper in ["M", "MALE"]:
        return "Male"
    elif value_upper in ["F", "FEMALE"]:
        return "Female"
    else:
        return "Unknown"


def detect_outliers(
    values: List[int],
    threshold: float = 3.0
) -> List[int]:
    """
    Detect outliers using simple z-score method.

    Args:
        values: List of numeric values
        threshold: Z-score threshold for outliers

    Returns:
        List of indices that are outliers
    """
    if not values or len(values) < 3:
        return []

    df = pd.Series(values)
    mean = df.mean()
    std = df.std()

    if std == 0:
        return []

    z_scores = [(x - mean) / std for x in values]
    outliers = [i for i, z in enumerate(z_scores) if abs(z) > threshold]

    return outliers
