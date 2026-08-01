from fastapi import Request
from fastapi.responses import ORJSONResponse
from loguru import logger

async def global_exception_handler(request: Request, exc: Exception) -> ORJSONResponse:
    """
    Catches any unhandled exceptions globally across the application.
    Prevents raw stack traces from leaking to the client in production
    by returning a standardized JSON response.
    """
    request_id = getattr(request.state, "request_id", "unknown")
    logger.exception(f"[{request_id}] Unhandled exception caught globally: {exc}")
    
    return ORJSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error", "request_id": request_id}
    )
