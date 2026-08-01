import pytest
from unittest.mock import AsyncMock
from app.exceptions.service_exceptions import WeatherServiceError, WeatherServiceNotFoundError

def test_health_check(test_client):
    """Verify the health check endpoint works without mocks."""
    response = test_client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

# -------------------------------------------------------
# POST /store-weather-data
# -------------------------------------------------------

def test_store_weather_data_success(client_with_mocked_service, mock_weather_service):
    """Verify successful weather data storage."""
    mock_weather_service.store_weather_data.return_value = AsyncMock()
    mock_weather_service.store_weather_data.return_value.status = "ok"
    mock_weather_service.store_weather_data.return_value.file = "test_file.json"
    
    payload = {
        "latitude": 52.52,
        "longitude": 13.41,
        "start_date": "2023-01-01",
        "end_date": "2023-01-07"
    }
    
    response = client_with_mocked_service.post("/api/v1/store-weather-data", json=payload)
    
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert response.json()["file"] == "test_file.json"

def test_store_weather_data_validation_failure(client_with_mocked_service):
    """Verify 400 Bad Request on invalid payload (e.g. out of bounds latitude)."""
    payload = {
        "latitude": 900.0, # Invalid
        "longitude": 13.41,
        "start_date": "2023-01-01",
        "end_date": "2023-01-07"
    }
    
    response = client_with_mocked_service.post("/api/v1/store-weather-data", json=payload)
    
    assert response.status_code == 400
    assert response.json()["status"] == "error"

def test_store_weather_data_service_error(client_with_mocked_service, mock_weather_service):
    """Verify 502 Bad Gateway when WeatherService raises WeatherServiceError."""
    mock_weather_service.store_weather_data.side_effect = WeatherServiceError("Upstream failure")
    
    payload = {
        "latitude": 52.52,
        "longitude": 13.41,
        "start_date": "2023-01-01",
        "end_date": "2023-01-07"
    }
    
    response = client_with_mocked_service.post("/api/v1/store-weather-data", json=payload)
    
    assert response.status_code == 502
    assert response.json()["status"] == "error"

def test_store_weather_data_unexpected_error(client_with_mocked_service, mock_weather_service):
    """Verify 500 Internal Server Error when an unhandled exception occurs."""
    mock_weather_service.store_weather_data.side_effect = Exception("Boom")
    
    payload = {
        "latitude": 52.52,
        "longitude": 13.41,
        "start_date": "2023-01-01",
        "end_date": "2023-01-07"
    }
    
    response = client_with_mocked_service.post("/api/v1/store-weather-data", json=payload)
    
    assert response.status_code == 500
    assert response.json()["status"] == "error"

# -------------------------------------------------------
# GET /list-weather-files
# -------------------------------------------------------

def test_list_weather_files_success(client_with_mocked_service, mock_weather_service, sample_stored_file):
    """Verify listing files successfully returns data."""
    # We need to construct a mock that mimics ListWeatherFilesResponse
    mock_weather_service.list_weather_files.return_value = AsyncMock()
    
    from app.models.weather import WeatherFileMetadata
    mock_weather_service.list_weather_files.return_value.files = [WeatherFileMetadata(**sample_stored_file)]
    
    response = client_with_mocked_service.get("/api/v1/list-weather-files")
    
    assert response.status_code == 200
    data = response.json()
    assert len(data["files"]) == 1
    assert data["files"][0]["name"] == sample_stored_file["name"]

def test_list_weather_files_empty(client_with_mocked_service, mock_weather_service):
    """Verify listing files on an empty bucket returns an empty array."""
    mock_weather_service.list_weather_files.return_value = AsyncMock()
    mock_weather_service.list_weather_files.return_value.files = []
    
    response = client_with_mocked_service.get("/api/v1/list-weather-files")
    
    assert response.status_code == 200
    assert response.json()["files"] == []

# -------------------------------------------------------
# GET /weather-file-content/{file}
# -------------------------------------------------------

def test_get_weather_file_content_success(client_with_mocked_service, mock_weather_service):
    """Verify downloading a file successfully returns its JSON content."""
    mock_weather_service.get_weather_file.return_value = AsyncMock()
    mock_weather_service.get_weather_file.return_value.data = {"some": "data"}
    
    response = client_with_mocked_service.get("/api/v1/weather-file-content/test.json")
    
    assert response.status_code == 200
    assert response.json() == {"some": "data"}

def test_get_weather_file_content_not_found(client_with_mocked_service, mock_weather_service):
    """Verify 404 when the requested file does not exist."""
    mock_weather_service.get_weather_file.side_effect = WeatherServiceNotFoundError("Not found")
    
    response = client_with_mocked_service.get("/api/v1/weather-file-content/missing.json")
    
    assert response.status_code == 404
    assert response.json()["status"] == "error"
