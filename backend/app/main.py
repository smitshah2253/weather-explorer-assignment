from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import ORJSONResponse

from app.core.config import settings
from app.core.logging import setup_logging
from app.api.router import api_router
from app.middleware.request_id_middleware import RequestIDMiddleware
from app.middleware.logging_middleware import LoggingMiddleware
from app.exceptions.handlers import (
    global_exception_handler,
    validation_exception_handler,
    weather_not_found_handler,
    weather_service_error_handler
)
from fastapi.exceptions import RequestValidationError
from app.exceptions.service_exceptions import WeatherServiceError, WeatherServiceNotFoundError

def create_app() -> FastAPI:
    """
    Application factory.
    Facilitates testing by allowing customized app instances.
    """
    
    # 1. Initialize Logger
    setup_logging()

    # 2. Initialize FastAPI with ORJSONResponse for better serialization performance
    app = FastAPI(
        title=settings.PROJECT_NAME,
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        docs_url="/docs",
        redoc_url="/redoc",
        default_response_class=ORJSONResponse,
    )

    # 3. Add Middlewares (Order matters: outer to inner)
    
    # CORS Middleware must be the outermost to ensure pre-flight requests 
    # are handled properly even if the request is rejected later.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Add logging and request ID middlewares.
    # RequestID goes first so the Logging middleware has access to the ID.
    app.add_middleware(LoggingMiddleware)
    app.add_middleware(RequestIDMiddleware)

    # 4. Add Exception Handlers
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(WeatherServiceNotFoundError, weather_not_found_handler)
    app.add_exception_handler(WeatherServiceError, weather_service_error_handler)
    app.add_exception_handler(Exception, global_exception_handler)

    # 5. Include API Router
    app.include_router(api_router, prefix=settings.API_V1_STR)

    return app

# The main application instance run by Uvicorn
app = create_app()
