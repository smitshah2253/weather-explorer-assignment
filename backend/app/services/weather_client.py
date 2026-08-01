import time
from typing import Dict, Any, List
import httpx
from loguru import logger
import orjson

from app.core.config import settings
from app.core.constants import DEFAULT_HTTP_TIMEOUT, DEFAULT_HTTP_RETRIES, DEFAULT_DAILY_VARIABLES
from app.exceptions.weather_exceptions import (
    WeatherTimeoutException,
    WeatherConnectionException,
    WeatherResponseException,
    WeatherAPIException
)
from app.utils.retry import with_retry


class WeatherClient:
    """
    Client for interacting with the Open-Meteo Historical Weather API.
    """
    
    def __init__(self):
        # Set explicit limits to prevent hanging connections
        limits = httpx.Limits(max_keepalive_connections=50, max_connections=100)
        timeout = httpx.Timeout(DEFAULT_HTTP_TIMEOUT, connect=5.0)
        
        # Store config for use in async context manager later
        self._limits = limits
        self._timeout = timeout

    @with_retry(max_retries=DEFAULT_HTTP_RETRIES, initial_backoff=1.0)
    async def _execute_request(self, params: Dict[str, Any]) -> httpx.Response:
        """Executes HTTP request with retry logic. Raises raw httpx exceptions."""
        async with httpx.AsyncClient(limits=self._limits, timeout=self._timeout) as client:
            response = await client.get(settings.OPEN_METEO_BASE_URL, params=params)
            response.raise_for_status()
            return response

    async def fetch_historical_weather(
        self, 
        latitude: float, 
        longitude: float, 
        start_date: str, 
        end_date: str, 
        daily_variables: List[str] = None
    ) -> Dict[str, Any]:
        """
        Fetches historical weather data from Open-Meteo.
        
        Args:
            latitude: Geographic coordinate.
            longitude: Geographic coordinate.
            start_date: Format YYYY-MM-DD.
            end_date: Format YYYY-MM-DD.
            daily_variables: List of data points to fetch. Defaults to standard configuration.
            
        Returns:
            Dict representation of the weather data payload.
            
        Raises:
            WeatherTimeoutException: If the request takes too long.
            WeatherConnectionException: If DNS or network fails entirely.
            WeatherResponseException: If the API returns a 4xx/5xx or invalid JSON.
        """
        if daily_variables is None:
            daily_variables = DEFAULT_DAILY_VARIABLES
            
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "start_date": start_date,
            "end_date": end_date,
            "daily": ",".join(daily_variables),
            "timezone": "auto"
        }
        
        logger.info(f"Initiating Open-Meteo request for coords: ({latitude}, {longitude}) from {start_date} to {end_date}")
        start_time = time.perf_counter()
        
        try:
            response = await self._execute_request(params)
            
            # Parse JSON using ORJSON
            data = orjson.loads(response.content)
            
            process_time = time.perf_counter() - start_time
            logger.info(f"Open-Meteo request completed successfully in {process_time:.4f}s")
            
            return data
                
        except httpx.TimeoutException as e:
            logger.error(f"Open-Meteo request timed out: {e}")
            raise WeatherTimeoutException("Connection to Open-Meteo timed out.") from e
            
        except httpx.ConnectError as e:
            logger.error(f"Open-Meteo connection failed (DNS/Network): {e}")
            raise WeatherConnectionException("Failed to connect to Open-Meteo API.") from e
            
        except httpx.HTTPStatusError as e:
            logger.error(f"Open-Meteo returned HTTP {e.response.status_code}")
            raise WeatherResponseException(
                message=f"Open-Meteo API error: HTTP {e.response.status_code}",
                status_code=e.response.status_code,
                response_text=e.response.text
            ) from e
            
        except orjson.JSONDecodeError as e:
            logger.error("Open-Meteo returned invalid JSON.")
            raise WeatherResponseException(
                message="Failed to parse JSON response from Open-Meteo",
                status_code=200,
                response_text=response.text
            ) from e
            
        except Exception as e:
            logger.exception("Unexpected error occurred while fetching weather data.")
            raise WeatherAPIException(f"An unexpected error occurred: {str(e)}") from e
