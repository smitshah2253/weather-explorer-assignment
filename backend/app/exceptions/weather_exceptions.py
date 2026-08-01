class WeatherAPIException(Exception):
    """Base exception for all weather API related errors."""
    pass


class WeatherTimeoutException(WeatherAPIException):
    """Raised when a request to the weather API times out."""
    pass


class WeatherConnectionException(WeatherAPIException):
    """Raised when unable to establish a connection to the weather API (e.g., DNS failure, network down)."""
    pass


class WeatherResponseException(WeatherAPIException):
    """
    Raised when the weather API returns an unexpected or erroneous response.
    Includes the status code and raw response text if available.
    """
    def __init__(self, message: str, status_code: int = None, response_text: str = None):
        super().__init__(message)
        self.status_code = status_code
        self.response_text = response_text
