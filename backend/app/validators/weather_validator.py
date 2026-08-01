from datetime import date
from pydantic import ValidationError

from app.core.constants import (
    MAX_ALLOWED_DAYS,
    LATITUDE_MIN,
    LATITUDE_MAX,
    LONGITUDE_MIN,
    LONGITUDE_MAX
)

def validate_date_range(start_date: date, end_date: date) -> None:
    """Validates date range boundaries."""
    if start_date > end_date:
        raise ValueError("start_date cannot be after end_date")
        
    delta = (end_date - start_date).days
    if delta > MAX_ALLOWED_DAYS:
        raise ValueError(f"Date range cannot exceed {MAX_ALLOWED_DAYS} days")

def validate_coordinates(latitude: float, longitude: float) -> None:
    """Validates geographic coordinates."""
    if not (LATITUDE_MIN <= latitude <= LATITUDE_MAX):
        raise ValueError(f"latitude must be between {LATITUDE_MIN} and {LATITUDE_MAX}")
        
    if not (LONGITUDE_MIN <= longitude <= LONGITUDE_MAX):
        raise ValueError(f"longitude must be between {LONGITUDE_MIN} and {LONGITUDE_MAX}")

def validate_request(latitude: float, longitude: float, start_date: date, end_date: date) -> None:
    """Validates the entire weather request."""
    validate_coordinates(latitude, longitude)
    validate_date_range(start_date, end_date)
