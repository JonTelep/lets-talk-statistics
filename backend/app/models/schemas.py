"""Pydantic schemas for API request/response validation."""

from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, Field, ConfigDict


# Data Source Schemas
class DataSourceBase(BaseModel):
    """Base data source schema."""
    source_name: str
    source_url: Optional[str] = None
    data_type: str
    year: int


class DataSourceCreate(DataSourceBase):
    """Schema for creating a data source."""
    file_path: Optional[str] = None
    file_hash: Optional[str] = None
    status: str = "downloaded"
    metadata: Optional[Dict] = None


class DataSourceResponse(DataSourceBase):
    """Schema for data source response."""
    id: int
    download_date: datetime
    file_path: Optional[str]
    file_hash: Optional[str]
    status: str
    metadata: Optional[Dict]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Crime Statistics Schemas
class CrimeStatisticBase(BaseModel):
    """Base crime statistic schema."""
    year: int
    crime_type: str
    state: Optional[str] = None
    jurisdiction: Optional[str] = None
    age_group: Optional[str] = None
    race: Optional[str] = None
    sex: Optional[str] = None
    incident_count: int
    population: Optional[int] = None


class CrimeStatisticCreate(CrimeStatisticBase):
    """Schema for creating a crime statistic."""
    source_id: int
    additional_data: Optional[Dict] = None


class CrimeStatisticResponse(CrimeStatisticBase):
    """Schema for crime statistic response."""
    id: int
    source_id: int
    additional_data: Optional[Dict]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Population Data Schemas
class PopulationDataBase(BaseModel):
    """Base population data schema."""
    year: int
    state: Optional[str] = None
    age_group: Optional[str] = None
    race: Optional[str] = None
    sex: Optional[str] = None
    population: int
    source: Optional[str] = None


class PopulationDataCreate(PopulationDataBase):
    """Schema for creating population data."""
    pass


class PopulationDataResponse(PopulationDataBase):
    """Schema for population data response."""
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Calculated Statistics Schemas
class CalculatedStatisticBase(BaseModel):
    """Base calculated statistic schema."""
    year: int
    crime_type: str
    demographic_type: str
    demographic_value: Optional[str] = None
    state: Optional[str] = None
    incident_count: int
    population: Optional[int] = None
    per_capita_rate: Optional[float] = None
    yoy_change: Optional[float] = None


class CalculatedStatisticCreate(CalculatedStatisticBase):
    """Schema for creating a calculated statistic."""
    pass


class CalculatedStatisticResponse(CalculatedStatisticBase):
    """Schema for calculated statistic response."""
    id: int
    calculated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# API Response Schemas
class CrimeStatisticsQuery(BaseModel):
    """Schema for crime statistics query parameters."""
    crime_type: str = "murder"
    year: Optional[int] = None
    start_year: Optional[int] = None
    end_year: Optional[int] = None
    state: Optional[str] = None
    race: Optional[str] = None
    age_group: Optional[str] = None
    sex: Optional[str] = None
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=100, ge=1, le=1000)


class CrimeStatisticsResponse(BaseModel):
    """Schema for crime statistics API response."""
    crime_type: str
    year: Optional[int]
    filters: Dict[str, Optional[str]]
    total_incidents: int
    population: Optional[int]
    per_capita_rate: Optional[float]
    breakdown_by_state: Optional[List[Dict]]


class TrendDataResponse(BaseModel):
    """Schema for trend data API response."""
    crime_type: str
    years: List[int]
    incident_counts: List[int]
    per_capita_rates: List[Optional[float]]
    yoy_changes: List[Optional[float]]


class CrimeTypeInfo(BaseModel):
    """Schema for crime type information."""
    type: str
    display_name: str
    available_years: List[int]
    data_sources: List[str]


class CrimeTypesResponse(BaseModel):
    """Schema for crime types list response."""
    crime_types: List[CrimeTypeInfo]


class HealthCheckResponse(BaseModel):
    """Schema for health check response."""
    status: str
    timestamp: datetime
    version: str


# Comparison Schemas
class ComparisonItem(BaseModel):
    """Schema for a single comparison item."""
    label: str
    year: Optional[int] = None
    state: Optional[str] = None
    demographic_value: Optional[str] = None
    incident_count: int
    population: Optional[int] = None
    per_capita_rate: Optional[float] = None


class ComparisonResponse(BaseModel):
    """Schema for comparison API response."""
    crime_type: str
    comparison_type: str
    items: List[ComparisonItem]


# Rankings Schemas
class RankingItem(BaseModel):
    """Schema for a single ranking item."""
    rank: int
    state: Optional[str] = None
    demographic_value: Optional[str] = None
    incident_count: int
    population: Optional[int] = None
    per_capita_rate: Optional[float] = None
    change_from_previous_year: Optional[float] = None


class RankingsResponse(BaseModel):
    """Schema for rankings API response."""
    crime_type: str
    year: int
    ranking_by: str
    order: str
    rankings: List[RankingItem]


# Analytics Schemas
class YearSummary(BaseModel):
    """Schema for yearly summary statistics."""
    year: int
    total_incidents: int
    total_population: Optional[int] = None
    per_capita_rate: Optional[float] = None
    states_reporting: int
    change_from_previous_year: Optional[float] = None


class AnalyticsSummaryResponse(BaseModel):
    """Schema for analytics summary response."""
    crime_type: str
    start_year: int
    end_year: int
    total_incidents: int
    average_per_capita_rate: Optional[float] = None
    yearly_summaries: List[YearSummary]
    top_states: List[RankingItem]
    bottom_states: List[RankingItem]


# Paginated Response
class PaginationMetadata(BaseModel):
    """Schema for pagination metadata."""
    page: int
    page_size: int
    total_records: int
    total_pages: int
    has_next: bool
    has_previous: bool


class PaginatedCrimeStatisticsResponse(BaseModel):
    """Schema for paginated crime statistics response."""
    data: List[CrimeStatisticResponse]
    pagination: PaginationMetadata


# Search Schemas
class SearchFilters(BaseModel):
    """Schema for advanced search filters."""
    crime_type: Optional[str] = None
    years: Optional[List[int]] = None
    states: Optional[List[str]] = None
    races: Optional[List[str]] = None
    age_groups: Optional[List[str]] = None
    sexes: Optional[List[str]] = None
    min_incidents: Optional[int] = None
    max_incidents: Optional[int] = None
    min_per_capita_rate: Optional[float] = None
    max_per_capita_rate: Optional[float] = None


class SearchResponse(BaseModel):
    """Schema for search results."""
    filters_applied: SearchFilters
    total_results: int
    results: List[CrimeStatisticResponse]
    pagination: Optional[PaginationMetadata] = None
