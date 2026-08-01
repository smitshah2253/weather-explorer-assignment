import time
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from loguru import logger

class LoggingMiddleware(BaseHTTPMiddleware):
    """
    Logs the start, end, and duration of all HTTP requests.
    Keeps latency monitoring and access logs centralized.
    """
    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = getattr(request.state, "request_id", "unknown")
        
        logger.info(f"[{request_id}] Request started: {request.method} {request.url.path}")
        start_time = time.perf_counter()
        
        try:
            response = await call_next(request)
            process_time = time.perf_counter() - start_time
            logger.info(f"[{request_id}] Request completed: {response.status_code} | duration: {process_time:.4f}s")
            return response
        except Exception as e:
            process_time = time.perf_counter() - start_time
            logger.error(f"[{request_id}] Request failed: {str(e)} | duration: {process_time:.4f}s")
            raise
