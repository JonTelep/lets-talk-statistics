"""SQLAlchemy models for crime statistics data."""

from datetime import datetime
from typing import Optional

from sqlalchemy import (
    BigInteger,
    Column,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from app.database import Base


class DataSource(Base):
    """Tracks data source metadata and download history."""

    __tablename__ = "data_sources"

    id = Column(Integer, primary_key=True, autoincrement=True)
    source_name = Column(String(100), nullable=False)  # 'FBI_UCR', 'BJS', etc.
    source_url = Column(Text, nullable=True)
    data_type = Column(String(50), nullable=False)  # 'murder_statistics', etc.
    year = Column(Integer, nullable=False)
    download_date = Column(DateTime, nullable=False, default=datetime.utcnow)
    file_path = Column(Text, nullable=True)  # Path to stored CSV
    file_hash = Column(String(64), nullable=True)  # SHA-256 hash
    status = Column(String(20), nullable=False, default="downloaded")  # 'downloaded', 'processed', 'failed'
    source_metadata = Column(JSONB, nullable=True)  # Additional metadata
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    crime_statistics = relationship("CrimeStatistic", back_populates="source")

    def __repr__(self):
        return f"<DataSource(id={self.id}, source_name='{self.source_name}', year={self.year})>"


class CrimeStatistic(Base):
    """Core crime statistics data (flexible schema for multiple crime types)."""

    __tablename__ = "crime_statistics"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    source_id = Column(Integer, ForeignKey("data_sources.id"), nullable=False)
    year = Column(Integer, nullable=False)
    crime_type = Column(String(50), nullable=False)  # 'murder', 'robbery', 'assault', etc.
    state = Column(String(50), nullable=True)
    jurisdiction = Column(String(100), nullable=True)
    age_group = Column(String(20), nullable=True)  # '0-17', '18-24', '25-34', etc.
    race = Column(String(50), nullable=True)  # Standardized race categories
    sex = Column(String(10), nullable=True)  # 'Male', 'Female', 'Unknown'
    incident_count = Column(Integer, nullable=False)
    population = Column(BigInteger, nullable=True)
    additional_data = Column(JSONB, nullable=True)  # Flexible field for crime-specific data
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    source = relationship("DataSource", back_populates="crime_statistics")

    # Indexes for common queries
    __table_args__ = (
        Index("idx_crime_year_state_type", "year", "state", "crime_type"),
        Index("idx_crime_year_type_race", "year", "crime_type", "race"),
        Index("idx_crime_year_type_age_sex", "year", "crime_type", "age_group", "sex"),
    )

    def __repr__(self):
        return f"<CrimeStatistic(id={self.id}, crime_type='{self.crime_type}', year={self.year})>"


class PopulationData(Base):
    """Population statistics for per capita calculations."""

    __tablename__ = "population_data"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    year = Column(Integer, nullable=False)
    state = Column(String(50), nullable=True)
    age_group = Column(String(20), nullable=True)
    race = Column(String(50), nullable=True)
    sex = Column(String(10), nullable=True)
    population = Column(BigInteger, nullable=False)
    source = Column(String(100), nullable=True)  # 'US_CENSUS', etc.
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Unique constraint to prevent duplicate population records
    __table_args__ = (
        UniqueConstraint("year", "state", "age_group", "race", "sex", name="uq_population_demographics"),
    )

    def __repr__(self):
        return f"<PopulationData(id={self.id}, year={self.year}, population={self.population})>"


class CalculatedStatistic(Base):
    """Pre-calculated statistics for performance optimization."""

    __tablename__ = "calculated_statistics"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    year = Column(Integer, nullable=False)
    crime_type = Column(String(50), nullable=False)  # 'murder', 'robbery', 'assault', etc.
    demographic_type = Column(String(50), nullable=False)  # 'total', 'by_race', 'by_age', 'by_sex'
    demographic_value = Column(String(50), nullable=True)  # Specific value ('White', '18-24', etc.)
    state = Column(String(50), nullable=True)
    incident_count = Column(Integer, nullable=False)
    population = Column(BigInteger, nullable=True)
    per_capita_rate = Column(Numeric(10, 4), nullable=True)  # Per 100,000
    yoy_change = Column(Numeric(10, 2), nullable=True)  # Year-over-year % change
    calculated_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Index for efficient querying
    __table_args__ = (
        Index("idx_calc_year_crime_demo", "year", "crime_type", "demographic_type", "demographic_value"),
    )

    def __repr__(self):
        return f"<CalculatedStatistic(id={self.id}, crime_type='{self.crime_type}', year={self.year})>"
