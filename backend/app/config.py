"""Application configuration - simplified."""

import json
from functools import lru_cache
from pathlib import Path
from typing import Optional

from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment."""

    # App settings
    app_name: str = "Let's Talk Statistics"
    debug: bool = False

    # Logging
    log_level: str = "INFO"
    log_format: str = "standard"  # "standard" or "json"

    # API Keys (optional - many gov APIs are open)
    census_api_key: Optional[str] = None
    bls_api_key: Optional[str] = None
    fec_api_key: Optional[str] = None

    # Data cache settings
    data_dir: Path = Path("/app/data")
    cache_ttl_hours: int = 24  # How long to cache API responses

    # CORS
    cors_origins: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        """Parse CORS origins from JSON string or list."""
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                # Treat as comma-separated string
                return [origin.strip() for origin in v.split(",")]
        return v

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
