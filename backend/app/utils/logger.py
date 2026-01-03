"""Logging configuration and utilities."""

import logging
import sys
from typing import Optional

from app.config import get_settings

settings = get_settings()


def get_logger(name: Optional[str] = None) -> logging.Logger:
    """
    Get a configured logger instance.

    Args:
        name: Logger name (typically __name__ of the calling module)

    Returns:
        logging.Logger: Configured logger instance
    """
    logger = logging.getLogger(name or __name__)

    # Only configure if not already configured
    if not logger.handlers:
        # Set log level from settings
        log_level = getattr(logging, settings.log_level.upper(), logging.INFO)
        logger.setLevel(log_level)

        # Create console handler
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(log_level)

        # Create formatter based on settings
        if settings.log_format == "json":
            # Simple JSON-like format
            formatter = logging.Formatter(
                '{"timestamp": "%(asctime)s", "level": "%(levelname)s", '
                '"logger": "%(name)s", "message": "%(message)s"}'
            )
        else:
            # Standard format
            formatter = logging.Formatter(
                "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
            )

        handler.setFormatter(formatter)
        logger.addHandler(handler)

        # Prevent propagation to root logger
        logger.propagate = False

    return logger
