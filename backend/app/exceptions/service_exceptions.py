class WeatherServiceError(Exception):
    """Weather Service error."""
    pass

class WeatherServiceNotFoundError(WeatherServiceError):
    """Weather file not found error."""
    pass
