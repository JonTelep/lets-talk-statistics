-- ============================================================================
-- Crime Statistics Database Schema for Supabase
-- ============================================================================
-- This script creates all tables, indexes, and constraints needed for the
-- Crime Statistics application. Execute this in Supabase SQL Editor.
-- ============================================================================

-- Enable necessary PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Table: data_sources
-- ============================================================================
-- Tracks metadata about crime data sources and their download history
CREATE TABLE data_sources (
    id SERIAL PRIMARY KEY,
    source_name VARCHAR(100) NOT NULL,
    source_url TEXT,
    data_type VARCHAR(50) NOT NULL,
    year INTEGER NOT NULL,
    download_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    file_path TEXT,
    file_hash VARCHAR(64),
    status VARCHAR(20) NOT NULL DEFAULT 'downloaded',
    source_metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger function for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_data_sources_updated_at
    BEFORE UPDATE ON data_sources
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Table: crime_statistics
-- ============================================================================
-- Stores the actual crime statistics with flexible demographic breakdowns
CREATE TABLE crime_statistics (
    id BIGSERIAL PRIMARY KEY,
    source_id INTEGER NOT NULL REFERENCES data_sources(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    crime_type VARCHAR(50) NOT NULL,
    state VARCHAR(50),
    jurisdiction VARCHAR(100),
    age_group VARCHAR(20),
    race VARCHAR(50),
    sex VARCHAR(10),
    incident_count INTEGER NOT NULL,
    population BIGINT,
    additional_data JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for crime_statistics (optimized for common query patterns)
CREATE INDEX idx_crime_year_state_type ON crime_statistics(year, state, crime_type);
CREATE INDEX idx_crime_year_type_race ON crime_statistics(year, crime_type, race);
CREATE INDEX idx_crime_year_type_age_sex ON crime_statistics(year, crime_type, age_group, sex);
CREATE INDEX idx_crime_source_id ON crime_statistics(source_id);

-- ============================================================================
-- Table: population_data
-- ============================================================================
-- Stores population data for per capita rate calculations with demographic breakdowns
CREATE TABLE population_data (
    id BIGSERIAL PRIMARY KEY,
    year INTEGER NOT NULL,
    state VARCHAR(50),
    age_group VARCHAR(20),
    race VARCHAR(50),
    sex VARCHAR(10),
    population BIGINT NOT NULL,
    source VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_population_demographics UNIQUE (year, state, age_group, race, sex)
);

-- Index for population_data
CREATE INDEX idx_population_year_state ON population_data(year, state);

-- ============================================================================
-- Table: calculated_statistics
-- ============================================================================
-- Stores pre-calculated statistics for performance optimization
CREATE TABLE calculated_statistics (
    id BIGSERIAL PRIMARY KEY,
    year INTEGER NOT NULL,
    crime_type VARCHAR(50) NOT NULL,
    demographic_type VARCHAR(50) NOT NULL,
    demographic_value VARCHAR(50),
    state VARCHAR(50),
    incident_count INTEGER NOT NULL,
    population BIGINT,
    per_capita_rate NUMERIC(10, 4),
    yoy_change NUMERIC(10, 2),
    calculated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for calculated_statistics
CREATE INDEX idx_calc_year_crime_demo ON calculated_statistics(
    year, crime_type, demographic_type, demographic_value
);
CREATE INDEX idx_calc_year_state ON calculated_statistics(year, state);

-- ============================================================================
-- Row Level Security (RLS) Configuration
-- ============================================================================
-- Disable RLS for backend-only application
-- Enable if you need frontend access with authentication
ALTER TABLE data_sources DISABLE ROW LEVEL SECURITY;
ALTER TABLE crime_statistics DISABLE ROW LEVEL SECURITY;
ALTER TABLE population_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE calculated_statistics DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Optional: Read-only Analytics Role
-- ============================================================================
-- Create read-only user for analytics tools (Tableau, Metabase, etc.)
-- Uncomment if needed:
-- CREATE ROLE analytics_readonly WITH LOGIN PASSWORD 'change_me_in_production';
-- GRANT CONNECT ON DATABASE postgres TO analytics_readonly;
-- GRANT USAGE ON SCHEMA public TO analytics_readonly;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics_readonly;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO analytics_readonly;

-- ============================================================================
-- Verification Queries
-- ============================================================================
-- Run these queries after schema creation to verify setup

-- List all tables
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- Check indexes
-- SELECT tablename, indexname, indexdef FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename, indexname;

-- Verify table counts (should all be 0 initially)
-- SELECT 'data_sources' as table_name, COUNT(*) as row_count FROM data_sources
-- UNION ALL
-- SELECT 'crime_statistics', COUNT(*) FROM crime_statistics
-- UNION ALL
-- SELECT 'population_data', COUNT(*) FROM population_data
-- UNION ALL
-- SELECT 'calculated_statistics', COUNT(*) FROM calculated_statistics;
