from fastapi import Depends

from app.services.weather_client import WeatherClient
from app.storage.gcs_client import GoogleCloudStorageClient
from app.services.weather_service import WeatherService
from app.core.config import settings

def get_weather_client() -> WeatherClient:
    """Provide WeatherClient."""
    return WeatherClient()

def get_storage_client() -> GoogleCloudStorageClient:
    """Provide GoogleCloudStorageClient."""
    return GoogleCloudStorageClient()

def get_weather_service(
    weather_client: WeatherClient = Depends(get_weather_client),
    storage_client: GoogleCloudStorageClient = Depends(get_storage_client)
) -> WeatherService:
    """Provide WeatherService."""
    return WeatherService(weather_client=weather_client, storage_client=storage_client)
