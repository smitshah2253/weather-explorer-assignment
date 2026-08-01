import sys
from loguru import logger
from app.core.config import settings

def setup_logging() -> None:
    """
    Configures Loguru as the centralized logging system.
    Replaces standard logging for better async performance and JSON formatting support.
    """
    logger.remove()  # Remove default logger

    # Add a custom sink that formats logs elegantly. 
    # In a real production setup, we might output JSON if ENVIRONMENT == "production"
    log_format = (
        "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
        "<level>{level: <8}</level> | "
        "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
        "<level>{message}</level>"
    )

    logger.add(
        sys.stdout,
        level=settings.LOG_LEVEL,
        format=log_format,
        enqueue=True,  # Thread-safe writing
        backtrace=True,
        diagnose=settings.ENVIRONMENT == "development",
    )
    

