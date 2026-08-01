from typing import Any
from fastapi import APIRouter, Depends

from app.schemas.weather import (
    StoreWeatherRequest, 
    StoreWeatherResponse,
    ListWeatherFilesResponse
)
from app.services.weather_service import WeatherService
from app.api.dependencies import get_weather_service
from loguru import logger

router = APIRouter(tags=["Weather"])

@router.post(
    "/store-weather-data",
    response_model=StoreWeatherResponse,
    summary="Fetch and store historical weather data",
    description="Validates location and date ranges, fetches data from Open-Meteo, and stores the raw JSON in Google Cloud Storage.",
    responses={
        200: {"description": "Data successfully fetched and stored."},
        400: {"description": "Validation error for coordinates or date ranges."},
        500: {"description": "Unexpected internal error."},
        502: {"description": "Error communicating with external API (Open-Meteo or GCP)."}
    }
)
async def store_weather_data(
    request: StoreWeatherRequest,
    service: WeatherService = Depends(get_weather_service)
) -> StoreWeatherResponse:
    logger.info(f"Incoming POST request to /store-weather-data for coordinates ({request.latitude}, {request.longitude})")
    return await service.store_weather_data(request)


@router.get(
    "/list-weather-files",
    response_model=ListWeatherFilesResponse,
    summary="List stored weather files",
    description="Retrieves a list of all historical weather files currently stored in the Google Cloud bucket, ordered by newest first. Returns an empty array if the bucket is empty.",
    responses={
        200: {"description": "Successfully retrieved the list of files."}
    }
)
async def list_weather_files(
    service: WeatherService = Depends(get_weather_service)
) -> ListWeatherFilesResponse:
    logger.info("Incoming GET request to /list-weather-files")
    return await service.list_weather_files()


@router.get(
    "/weather-file-content/{filename}",
    response_model=dict[str, Any],
    summary="Get weather file content",
    description="Downloads and returns the raw JSON content of a specific weather file stored in the bucket.",
    responses={
        200: {"description": "Successfully retrieved file content."},
        404: {"description": "The specified file was not found in the storage bucket."}
    }
)
async def get_weather_file_content(
    filename: str,
    service: WeatherService = Depends(get_weather_service)
) -> dict[str, Any]:
    logger.info(f"Incoming GET request to /weather-file-content/{filename}")
    response = await service.get_weather_file(filename)
    return response.data
