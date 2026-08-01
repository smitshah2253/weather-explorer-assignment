import pytest
from unittest.mock import AsyncMock, MagicMock
from fastapi.testclient import TestClient
from typing import Any

from app.main import app
from app.services.weather_client import WeatherClient
from app.storage.gcs_client import GoogleCloudStorageClient
from app.services.weather_service import WeatherService
from app.api.dependencies import get_weather_service

# -------------------------------------------------------
# FastAPI & Test Client Fixtures
# -------------------------------------------------------

@pytest.fixture
def fastapi_app():
    """Provides the FastAPI application instance."""
    return app

@pytest.fixture
def test_client(fastapi_app):
    """Provides a TestClient for the FastAPI app."""
    return TestClient(fastapi_app, raise_server_exceptions=False)

# -------------------------------------------------------
# Mock Client Fixtures
# -------------------------------------------------------

@pytest.fixture
def mock_open_meteo_client():
    """Provides a mocked Open-Meteo Client."""
    mock = MagicMock(spec=WeatherClient)
    mock.fetch_historical_weather = AsyncMock()
    return mock

@pytest.fixture
def mock_gcs_client():
    """Provides a mocked Google Cloud Storage Client."""
    mock = MagicMock(spec=GoogleCloudStorageClient)
    # Using MagicMock for non-async methods
    mock.upload_json = MagicMock(return_value="weather_data.json")
    mock.download_json = MagicMock()
    mock.list_files = MagicMock(return_value=[])
    mock.blob_exists = MagicMock(return_value=True)
    mock.delete_file = MagicMock()
    return mock

@pytest.fixture
def mock_weather_service():
    """Provides a mocked WeatherService for testing routes."""
    mock = MagicMock(spec=WeatherService)
    mock.store_weather_data = AsyncMock()
    mock.list_weather_files = AsyncMock()
    mock.get_weather_file = AsyncMock()
    return mock

# -------------------------------------------------------
# Route Dependency Override Fixture
# -------------------------------------------------------

@pytest.fixture
def client_with_mocked_service(fastapi_app, mock_weather_service):
    """Overrides the get_weather_service dependency for route tests."""
    fastapi_app.dependency_overrides[get_weather_service] = lambda: mock_weather_service
    yield TestClient(fastapi_app, raise_server_exceptions=False)
    # Clean up overrides after test
    fastapi_app.dependency_overrides.clear()

# -------------------------------------------------------
# Sample Data Fixtures
# -------------------------------------------------------

@pytest.fixture
def sample_weather_response() -> dict[str, Any]:
    """Provides a valid mock response from Open-Meteo."""
    return {
        "latitude": 52.52,
        "longitude": 13.41,
        "generationtime_ms": 0.25,
        "utc_offset_seconds": 0,
        "timezone": "GMT",
        "timezone_abbreviation": "GMT",
        "elevation": 38.0,
        "daily_units": {
            "time": "iso8601",
            "temperature_2m_max": "°C",
            "temperature_2m_min": "°C"
        },
        "daily": {
            "time": ["2023-01-01", "2023-01-02"],
            "temperature_2m_max": [10.5, 11.2],
            "temperature_2m_min": [5.0, 6.1]
        }
    }

@pytest.fixture
def sample_stored_file() -> dict[str, Any]:
    """Provides a valid mock response for a single stored file's metadata."""
    import datetime
    return {
        "name": "weather_52.52_13.41_20230101_20230107_123456789.json",
        "size": 1024,
        "created_at": datetime.datetime(2023, 1, 8, 12, 0, 0, tzinfo=datetime.timezone.utc)
    }

@pytest.fixture
def sample_weather_params():
    """Provides valid parameters for fetching weather."""
    return {
        "latitude": 52.52,
        "longitude": 13.41,
        "start_date": "2023-01-01",
        "end_date": "2023-01-07"
    }
