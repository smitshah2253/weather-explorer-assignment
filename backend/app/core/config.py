from typing import Any, List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


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
    BACKEND_CORS_ORIGINS: Any = [
        "http://localhost:5173",
        "http://localhost:3000",
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="after")
    @classmethod
    def assemble_cors_origins(cls, v: Any) -> list[str]:
        if isinstance(v, str):
            if v == "*":
                return ["*"]
            if not v.startswith("["):
                return [i.strip() for i in v.split(",") if i.strip()]
        return v if isinstance(v, list) else [str(v)]


    # Logging Configuration
    LOG_LEVEL: str = "INFO"

    # Integration URLs
    OPEN_METEO_BASE_URL: str = "https://archive-api.open-meteo.com/v1/archive"

    # Google Cloud Storage Configuration
    GCS_BUCKET_NAME: str = "weather-explorer-data"
    GCP_PROJECT_ID: str | None = None
    GOOGLE_APPLICATION_CREDENTIALS: str | None = None

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

settings = Settings()
