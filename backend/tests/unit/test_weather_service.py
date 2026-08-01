import pytest
from unittest.mock import AsyncMock, Mock
from datetime import date

from app.services.weather_service import WeatherService
from app.exceptions.service_exceptions import WeatherServiceError, WeatherServiceNotFoundError
from app.exceptions.weather_exceptions import WeatherAPIException
from app.storage.exceptions import StorageError, StorageFileNotFound
from app.schemas.weather import StoreWeatherRequest

@pytest.fixture
def weather_service(mock_open_meteo_client, mock_gcs_client):
    return WeatherService(weather_client=mock_open_meteo_client, storage_client=mock_gcs_client)

@pytest.fixture
def valid_request():
    return StoreWeatherRequest(
        latitude=52.52,
        longitude=13.41,
        start_date=date(2024, 1, 1),
        end_date=date(2024, 1, 7)
    )

@pytest.mark.asyncio
async def test_store_weather_data_success(weather_service, valid_request, mock_open_meteo_client, mock_gcs_client):
    mock_open_meteo_client.fetch_historical_weather.return_value = {"mock": "data"}
    
    result = await weather_service.store_weather_data(valid_request)
    
    assert result.status == "ok"
    assert result.file.startswith("weather_52_52_13_41")
    assert result.file.endswith(".json")
    
    mock_open_meteo_client.fetch_historical_weather.assert_called_once_with(
        latitude=52.52,
        longitude=13.41,
        start_date="2024-01-01",
        end_date="2024-01-07"
    )
    mock_gcs_client.upload_json.assert_called_once_with(result.file, {"mock": "data"})

@pytest.mark.asyncio
async def test_store_weather_data_weather_api_error(weather_service, valid_request, mock_open_meteo_client):
    mock_open_meteo_client.fetch_historical_weather.side_effect = WeatherAPIException("API Down")
    
    with pytest.raises(WeatherServiceError, match="Failed to fetch weather data: API Down"):
        await weather_service.store_weather_data(valid_request)

@pytest.mark.asyncio
async def test_store_weather_data_storage_error(weather_service, valid_request, mock_open_meteo_client, mock_gcs_client):
    mock_open_meteo_client.fetch_historical_weather.return_value = {"mock": "data"}
    mock_gcs_client.upload_json.side_effect = StorageError("GCS Down")
    
    with pytest.raises(WeatherServiceError, match="Failed to store weather data: GCS Down"):
        await weather_service.store_weather_data(valid_request)

@pytest.mark.asyncio
async def test_list_weather_files_success(weather_service, mock_gcs_client):
    # Pass a valid ISO string so Pydantic can parse datetime for created_at
    mock_gcs_client.list_files.return_value = [{"name": "test.json", "size": 100, "created_at": "2024-01-01T00:00:00Z"}]
    
    result = await weather_service.list_weather_files()
    assert len(result.files) == 1
    assert result.files[0].name == "test.json"

@pytest.mark.asyncio
async def test_list_weather_files_empty(weather_service, mock_gcs_client):
    mock_gcs_client.list_files.return_value = []
    
    result = await weather_service.list_weather_files()
    assert len(result.files) == 0

@pytest.mark.asyncio
async def test_get_weather_file_success(weather_service, mock_gcs_client):
    mock_gcs_client.download_json.return_value = {"hello": "world"}
    
    result = await weather_service.get_weather_file("test.json")
    assert result.data == {"hello": "world"}

@pytest.mark.asyncio
async def test_get_weather_file_not_found(weather_service, mock_gcs_client):
    mock_gcs_client.download_json.side_effect = StorageFileNotFound("Not found")
    
    with pytest.raises(WeatherServiceNotFoundError, match="Weather file 'test.json' was not found."):
        await weather_service.get_weather_file("test.json")

@pytest.mark.asyncio
async def test_store_weather_data_unexpected_error(weather_service, valid_request, mock_open_meteo_client):
    mock_open_meteo_client.fetch_historical_weather.side_effect = Exception("Generic Error")
    with pytest.raises(WeatherServiceError, match="An unexpected error occurred processing the weather data"):
        await weather_service.store_weather_data(valid_request)

@pytest.mark.asyncio
async def test_list_weather_files_storage_error(weather_service, mock_gcs_client):
    mock_gcs_client.list_files.side_effect = StorageError("GCS Error")
    with pytest.raises(WeatherServiceError, match="Failed to list weather files: GCS Error"):
        await weather_service.list_weather_files()

@pytest.mark.asyncio
async def test_list_weather_files_unexpected_error(weather_service, mock_gcs_client):
    mock_gcs_client.list_files.side_effect = Exception("Generic Error")
    with pytest.raises(WeatherServiceError, match="An unexpected error occurred while listing files"):
        await weather_service.list_weather_files()

@pytest.mark.asyncio
async def test_get_weather_file_storage_error(weather_service, mock_gcs_client):
    mock_gcs_client.download_json.side_effect = StorageError("GCS Error")
    with pytest.raises(WeatherServiceError, match="Failed to download weather file: GCS Error"):
        await weather_service.get_weather_file("test.json")

@pytest.mark.asyncio
async def test_get_weather_file_unexpected_error(weather_service, mock_gcs_client):
    mock_gcs_client.download_json.side_effect = Exception("Generic Error")
    with pytest.raises(WeatherServiceError, match="An unexpected error occurred while downloading the file"):
        await weather_service.get_weather_file("test.json")

