from fastapi import Request
from fastapi.responses import ORJSONResponse
from fastapi.exceptions import RequestValidationError
from loguru import logger

from app.exceptions.service_exceptions import WeatherServiceError, WeatherServiceNotFoundError

async def validation_exception_handler(request: Request, exc: RequestValidationError) -> ORJSONResponse:
    """Handles Pydantic validation errors (maps to 400)."""
    logger.warning(f"Validation error: {exc}")
    # Returning a generic structure to match ErrorResponse schema
    return ORJSONResponse(
        status_code=400,
        content={"status": "error", "message": "Validation failed", "details": exc.errors()}
    )

async def weather_not_found_handler(request: Request, exc: WeatherServiceNotFoundError) -> ORJSONResponse:
    """Handles missing weather files (maps to 404)."""
    logger.warning(f"Not found: {exc}")
    return ORJSONResponse(
        status_code=404,
        content={"status": "error", "message": str(exc)}
    )

async def weather_service_error_handler(request: Request, exc: WeatherServiceError) -> ORJSONResponse:
    """Handles general service/API errors (maps to 502 Bad Gateway)."""
    logger.error(f"Service error: {exc}")
    return ORJSONResponse(
        status_code=502,
        content={"status": "error", "message": str(exc)}
    )

async def global_exception_handler(request: Request, exc: Exception) -> ORJSONResponse:
    """Catches any unhandled exceptions globally across the application."""
    request_id = getattr(request.state, "request_id", "unknown")
    logger.exception(f"[{request_id}] Unhandled exception caught globally: {exc}")
    
    return ORJSONResponse(
        status_code=500,
        content={"status": "error", "message": "Internal Server Error"}
    )

