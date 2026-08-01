from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """
    Centralized configuration using Pydantic.
    Loads and validates settings from environment variables or .env file at startup.
    """
    PROJECT_NAME: str = "Weather Explorer API"
    ENVIRONMENT: str = "development"
    API_V1_STR: str = "/api/v1"
    
    # CORS Configuration
    # Defaults to frontend ports typically used in local development
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
    ]

    # Logging Configuration
    LOG_LEVEL: str = "INFO"

    # Integration URLs
    OPEN_METEO_BASE_URL: str = "https://archive-api.open-meteo.com/v1/archive"

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
