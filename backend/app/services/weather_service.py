import asyncio
from datetime import datetime, timezone

from app.core.logging import logger
from app.exceptions.service_exceptions import WeatherServiceError, WeatherServiceNotFoundError
from app.exceptions.weather_exceptions import WeatherAPIException
from app.storage.exceptions import StorageError, StorageFileNotFound

from app.schemas.weather import (
    StoreWeatherRequest,
    StoreWeatherResponse,
    ListWeatherFilesResponse,
    WeatherFileContentResponse
)
from app.models.weather import generate_weather_filename

from app.services.weather_client import WeatherClient
from app.storage.gcs_client import GoogleCloudStorageClient

class WeatherService:
    """Weather service layer."""
    def __init__(self, weather_client: WeatherClient, storage_client: GoogleCloudStorageClient):
        self._weather_client = weather_client
        self._storage_client = storage_client

    async def store_weather_data(self, request: StoreWeatherRequest) -> StoreWeatherResponse:
        """Fetch weather data and store in GCS."""
        logger.info(f"Starting weather fetch for lat:{request.latitude}, lon:{request.longitude}")
        
        try:
            raw_data = await self._weather_client.fetch_historical_weather(
                latitude=request.latitude,
                longitude=request.longitude,
                start_date=request.start_date,
                end_date=request.end_date
            )
            logger.info("Weather fetch successful")
            
            timestamp = datetime.now(timezone.utc)
            filename = generate_weather_filename(
                latitude=request.latitude,
                longitude=request.longitude,
                start_date=request.start_date.isoformat(),
                end_date=request.end_date.isoformat(),
                timestamp=timestamp
            )
            
            logger.info(f"Uploading file: {filename}")
            await asyncio.to_thread(self._storage_client.upload_json, filename, raw_data)
            logger.info("Upload successful")
            
            return StoreWeatherResponse(status="ok", file=filename)
            
        except WeatherAPIException as e:
            logger.error(f"Weather API error: {str(e)}")
            raise WeatherServiceError(f"Failed to fetch weather data: {str(e)}") from e
        except StorageError as e:
            logger.error(f"Storage error during upload: {str(e)}")
            raise WeatherServiceError(f"Failed to store weather data: {str(e)}") from e
        except Exception as e:
            logger.error(f"Unexpected error in store_weather_data: {str(e)}")
            raise WeatherServiceError("An unexpected error occurred processing the weather data") from e

    async def list_weather_files(self) -> ListWeatherFilesResponse:
        """List stored weather files."""
        logger.info("Listing files")
        try:
            files = await asyncio.to_thread(self._storage_client.list_files)
            if not files:
                return ListWeatherFilesResponse(files=[])
            return ListWeatherFilesResponse(files=files)
        except StorageError as e:
            logger.error(f"Storage error during list: {str(e)}")
            raise WeatherServiceError(f"Failed to list weather files: {str(e)}") from e
        except Exception as e:
            logger.error(f"Unexpected error in list_weather_files: {str(e)}")
            raise WeatherServiceError("An unexpected error occurred while listing files") from e

    async def get_weather_file(self, filename: str) -> WeatherFileContentResponse:
        """Download a weather file by name."""
        logger.info(f"Downloading file: {filename}")
        try:
            raw_json = await asyncio.to_thread(self._storage_client.download_json, filename)
            return WeatherFileContentResponse(data=raw_json)
        except StorageFileNotFound as e:
            logger.error(f"File not found: {filename}")
            raise WeatherServiceNotFoundError(f"Weather file '{filename}' was not found.") from e
        except StorageError as e:
            logger.error(f"Storage error during download: {str(e)}")
            raise WeatherServiceError(f"Failed to download weather file: {str(e)}") from e
        except Exception as e:
            logger.error(f"Unexpected error in get_weather_file: {str(e)}")
            raise WeatherServiceError("An unexpected error occurred while downloading the file") from e
