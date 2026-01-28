"""Application configuration management."""

from functools import lru_cache
from typing import List

from pydantic import Field, validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application Settings
    app_name: str = Field(default="Crime Statistics API", alias="APP_NAME")
    app_version: str = Field(default="1.0.0", alias="APP_VERSION")
    debug: bool = Field(default=False, alias="DEBUG")
    environment: str = Field(default="development", alias="ENVIRONMENT")

    # Server Configuration
    host: str = Field(default="0.0.0.0", alias="HOST")
    port: int = Field(default=8000, alias="PORT")

    # Database Configuration - Supabase
    # Primary database URL (use pooled connection for production)
    database_url: str = Field(
        default="postgresql+asyncpg://crime_stats_user:crime_stats_password@localhost:5432/crime_statistics",
        alias="DATABASE_URL"
    )

    # Direct connection URL for migrations (bypasses pooler)
    database_url_direct: str = Field(
        default="",
        alias="DATABASE_URL_DIRECT"
    )

    # Supabase-specific settings
    supabase_url: str = Field(default="", alias="SUPABASE_URL")
    supabase_anon_key: str = Field(default="", alias="SUPABASE_ANON_KEY")
    supabase_service_role_key: str = Field(default="", alias="SUPABASE_SERVICE_ROLE_KEY")

    # Connection pooling (increased for production with Supabase)
    database_pool_size: int = Field(default=10, alias="DATABASE_POOL_SIZE")
    database_max_overflow: int = Field(default=20, alias="DATABASE_POOL_MAX_OVERFLOW")
    database_pool_pre_ping: bool = Field(default=True, alias="DATABASE_POOL_PRE_PING")
    database_pool_recycle: int = Field(default=3600, alias="DATABASE_POOL_RECYCLE")

    # Redis Configuration
    redis_url: str = Field(default="redis://localhost:6379/0", alias="REDIS_URL")

    # Celery Configuration
    celery_broker_url: str = Field(default="redis://localhost:6379/0", alias="CELERY_BROKER_URL")
    celery_result_backend: str = Field(default="redis://localhost:6379/1", alias="CELERY_RESULT_BACKEND")

    # Data Storage
    data_storage_path: str = Field(default="./storage/raw_data", alias="DATA_STORAGE_PATH")

    # FBI Crime Data Explorer
    fbi_cde_base_url: str = Field(default="https://cde.ucr.cjis.gov", alias="FBI_CDE_BASE_URL")
    fbi_api_key: str = Field(default="", alias="FBI_API_KEY")

    # Logging
    log_level: str = Field(default="INFO", alias="LOG_LEVEL")
    log_format: str = Field(default="json", alias="LOG_FORMAT")

    # API Configuration
    api_v1_prefix: str = Field(default="/api/v1", alias="API_V1_PREFIX")
    cors_origins: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:8000"],
        alias="CORS_ORIGINS"
    )

    # Data Update Schedule (cron format)
    data_update_schedule: str = Field(default="0 3 1 9 *", alias="DATA_UPDATE_SCHEDULE")

    # Per Capita Calculation Base
    per_capita_base: int = Field(default=100000, alias="PER_CAPITA_BASE")

    @validator("cors_origins", pre=True)
    def parse_cors_origins(cls, v):
        """Parse CORS origins from string or list."""
        if isinstance(v, str):
            # Handle JSON string format
            import json
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                # Handle comma-separated string
                return [origin.strip() for origin in v.split(",")]
        return v

    class Config:
        """Pydantic config."""
        env_file = ".env"
        case_sensitive = False


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
