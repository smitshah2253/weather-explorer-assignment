import pytest
import httpx
from unittest.mock import patch, AsyncMock, MagicMock
import orjson

from app.services.weather_client import WeatherClient
from app.exceptions.weather_exceptions import (
    WeatherTimeoutException,
    WeatherConnectionException,
    WeatherResponseException
)

@pytest.fixture
def client():
    return WeatherClient()
@pytest.mark.asyncio
async def test_fetch_weather_success(client, sample_weather_params):
    """Verify successful data retrieval."""
    mock_response_data = {"daily": {"temperature_2m_max": [10, 11, 12]}}
    mock_response = httpx.Response(
        status_code=200,
        content=orjson.dumps(mock_response_data),
        request=httpx.Request("GET", "https://archive-api.open-meteo.com/v1/archive")
    )

    with patch.object(client, "_execute_request", new_callable=AsyncMock, return_value=mock_response):
        result = await client.fetch_historical_weather(**sample_weather_params)

    assert result == mock_response_data


@pytest.mark.asyncio
async def test_fetch_weather_timeout(client, sample_weather_params):
    """Verify timeout translation."""
    with patch.object(client, "_execute_request", new_callable=AsyncMock, side_effect=httpx.TimeoutException("Timeout")):
        with pytest.raises(WeatherTimeoutException):
            await client.fetch_historical_weather(**sample_weather_params)


@pytest.mark.asyncio
async def test_fetch_weather_connection_error(client, sample_weather_params):
    """Verify DNS failure translation."""
    with patch.object(client, "_execute_request", new_callable=AsyncMock, side_effect=httpx.ConnectError("Network Down")):
        with pytest.raises(WeatherConnectionException):
            await client.fetch_historical_weather(**sample_weather_params)


@pytest.mark.asyncio
async def test_fetch_weather_http_500(client, sample_weather_params):
    """Verify 500 error translation."""
    mock_request = httpx.Request("GET", "https://archive-api.open-meteo.com/v1/archive")
    mock_response = httpx.Response(status_code=500, text="Internal Server Error", request=mock_request)
    error = httpx.HTTPStatusError("Server Error", request=mock_request, response=mock_response)

    with patch.object(client, "_execute_request", new_callable=AsyncMock, side_effect=error):
        with pytest.raises(WeatherResponseException) as exc_info:
            await client.fetch_historical_weather(**sample_weather_params)

    assert exc_info.value.status_code == 500
    assert exc_info.value.response_text == "Internal Server Error"


@pytest.mark.asyncio
async def test_fetch_weather_invalid_json(client, sample_weather_params):
    """Verify malformed JSON handling."""
    mock_response = httpx.Response(
        status_code=200,
        text="<html>Not JSON</html>",
        request=httpx.Request("GET", "https://archive-api.open-meteo.com/v1/archive")
    )

    with patch.object(client, "_execute_request", new_callable=AsyncMock, return_value=mock_response):
        with pytest.raises(WeatherResponseException) as exc_info:
            await client.fetch_historical_weather(**sample_weather_params)

    assert exc_info.value.status_code == 200
    assert exc_info.value.response_text is not None
    assert "<html>Not JSON</html>" in exc_info.value.response_text


@pytest.mark.asyncio
async def test_retry_decorator_logic(client, sample_weather_params):
    """Verify retry executes 3 times on 500 error."""
    with patch("app.services.weather_client.httpx.AsyncClient") as MockClient, \
         patch("app.utils.retry.asyncio.sleep") as mock_sleep:
             
        mock_response = httpx.Response(status_code=502, request=httpx.Request("GET", "url"))
        
        mock_instance = MockClient.return_value.__aenter__.return_value
        mock_instance.get.side_effect = httpx.HTTPStatusError("502 Error", request=mock_response.request, response=mock_response)

        with pytest.raises(WeatherResponseException):
            await client.fetch_historical_weather(**sample_weather_params)
            
        assert mock_instance.get.call_count == 3
        assert mock_sleep.call_count == 2
