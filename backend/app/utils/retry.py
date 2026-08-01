import asyncio
from functools import wraps
from typing import Callable, Any
from loguru import logger
import httpx

def with_retry(max_retries: int = 3, initial_backoff: float = 1.0):
    """Async decorator that retries function on specific HTTP failures (5xx, timeouts)."""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs) -> Any:
            attempt = 1
            backoff = initial_backoff
            
            while attempt <= max_retries:
                last_exception = None
                try:
                    return await func(*args, **kwargs)
                    
                except (httpx.TimeoutException, httpx.ConnectError) as e:
                    last_exception = e
                    logger.warning(
                        f"Retry attempt {attempt}/{max_retries} due to connection/timeout error in {func.__name__}: {str(e)}"
                    )
                    
                except httpx.HTTPStatusError as e:
                    # Retry 5xx server errors only
                    if e.response.status_code >= 500:
                        last_exception = e
                        logger.warning(
                            f"Retry attempt {attempt}/{max_retries} due to HTTP {e.response.status_code} in {func.__name__}"
                        )
                    else:
                        # Re-raise 4xx errors immediately
                        raise
                
                # Raise last exception if max retries reached
                if attempt == max_retries:
                    logger.error(f"Max retries ({max_retries}) reached for {func.__name__}. Failing.")
                    raise last_exception
                
                logger.info(f"Sleeping for {backoff} seconds before retrying...")
                await asyncio.sleep(backoff)
                
                # Apply exponential backoff
                backoff *= 2
                attempt += 1
                
        return wrapper
    return decorator
