"""
Structured logging setup using Loguru.
Provides JSON-formatted logs for production and pretty console logs for dev.
"""

from __future__ import annotations

import sys
from pathlib import Path

from loguru import logger

from app.core.config import settings


def setup_logging() -> None:
    """Configure Loguru sinks based on app environment."""
    logger.remove()  # remove default handler

    log_format = (
        "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
        "<level>{level: <8}</level> | "
        "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
        "<level>{message}</level>"
    )

    # Console sink
    logger.add(
        sys.stdout,
        format=log_format,
        level=settings.LOG_LEVEL,
        colorize=not settings.is_production,
        backtrace=settings.DEBUG,
        diagnose=settings.DEBUG,
    )

    # File sink — rotated at 10 MB, retained for 30 days
    log_path = Path(settings.LOG_FILE)
    log_path.parent.mkdir(parents=True, exist_ok=True)
    logger.add(
        str(log_path),
        format=log_format,
        level=settings.LOG_LEVEL,
        rotation="10 MB",
        retention="30 days",
        compression="gz",
        serialize=settings.is_production,  # JSON in production
        backtrace=True,
        diagnose=settings.DEBUG,
    )

    logger.info(f"Logging configured — level={settings.LOG_LEVEL}")


# Re-export for convenience
__all__ = ["logger", "setup_logging"]
