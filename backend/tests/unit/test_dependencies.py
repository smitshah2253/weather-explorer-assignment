from app.api.dependencies import get_weather_client, get_storage_client, get_weather_service
from app.services.weather_client import WeatherClient
from app.storage.gcs_client import GoogleCloudStorageClient
from app.services.weather_service import WeatherService
from unittest.mock import patch, MagicMock

def test_get_weather_client():
    client = get_weather_client()
    assert isinstance(client, WeatherClient)

@patch("app.storage.gcs_client.storage.Client")
def test_get_storage_client(mock_storage):
    client = get_storage_client()
    assert isinstance(client, GoogleCloudStorageClient)

@patch("app.storage.gcs_client.storage.Client")
def test_get_weather_service(mock_storage):
    weather_client = get_weather_client()
    storage_client = get_storage_client()
    service = get_weather_service(weather_client, storage_client)
    assert isinstance(service, WeatherService)
