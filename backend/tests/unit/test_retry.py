import pytest
import httpx
from unittest.mock import AsyncMock, patch
from app.utils.retry import with_retry

@pytest.mark.asyncio
async def test_retry_on_timeout():
    """Verify retry works for TimeoutException and eventually fails."""
    mock_func = AsyncMock(side_effect=httpx.TimeoutException("Timeout"))
    
    decorated_func = with_retry(max_retries=2, initial_backoff=0.01)(mock_func)
    
    with pytest.raises(httpx.TimeoutException):
        await decorated_func()
        
    assert mock_func.call_count == 2

@pytest.mark.asyncio
async def test_retry_on_connect_error():
    """Verify retry works for ConnectError and eventually fails."""
    mock_func = AsyncMock(side_effect=httpx.ConnectError("Connection refused"))
    
    decorated_func = with_retry(max_retries=2, initial_backoff=0.01)(mock_func)
    
    with pytest.raises(httpx.ConnectError):
        await decorated_func()
        
    assert mock_func.call_count == 2

@pytest.mark.asyncio
async def test_no_retry_on_4xx():
    """Verify 4xx errors are raised immediately without retries."""
    request = httpx.Request("GET", "https://example.com")
    response = httpx.Response(404, request=request)
    error = httpx.HTTPStatusError("Not Found", request=request, response=response)
    
    mock_func = AsyncMock(side_effect=error)
    
    decorated_func = with_retry(max_retries=3, initial_backoff=0.01)(mock_func)
    
    with pytest.raises(httpx.HTTPStatusError):
        await decorated_func()
        
    assert mock_func.call_count == 1
