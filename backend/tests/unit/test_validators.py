import pytest
from datetime import date, timedelta
from app.validators.weather_validator import validate_coordinates, validate_date_range, validate_request
from app.core.constants import MAX_ALLOWED_DAYS, LATITUDE_MAX, LATITUDE_MIN, LONGITUDE_MAX, LONGITUDE_MIN

def test_validate_coordinates_valid():
    """Verify valid coordinates pass without raising exceptions."""
    validate_coordinates(52.52, 13.41)
    validate_coordinates(LATITUDE_MIN, LONGITUDE_MIN)
    validate_coordinates(LATITUDE_MAX, LONGITUDE_MAX)

def test_validate_coordinates_invalid_latitude():
    """Verify out of bounds latitude raises ValueError."""
    with pytest.raises(ValueError, match="latitude must be between"):
        validate_coordinates(LATITUDE_MAX + 1, 0)
        
    with pytest.raises(ValueError, match="latitude must be between"):
        validate_coordinates(LATITUDE_MIN - 1, 0)

def test_validate_coordinates_invalid_longitude():
    """Verify out of bounds longitude raises ValueError."""
    with pytest.raises(ValueError, match="longitude must be between"):
        validate_coordinates(0, LONGITUDE_MAX + 1)
        
    with pytest.raises(ValueError, match="longitude must be between"):
        validate_coordinates(0, LONGITUDE_MIN - 1)

def test_validate_date_range_valid():
    """Verify valid date ranges pass."""
    start = date(2023, 1, 1)
    end = date(2023, 1, 7)
    validate_date_range(start, end)
    
    # Same day should pass
    validate_date_range(start, start)
    
    # Exactly max allowed days
    max_end = start + timedelta(days=MAX_ALLOWED_DAYS)
    validate_date_range(start, max_end)

def test_validate_date_range_start_after_end():
    """Verify start_date > end_date raises ValueError."""
    start = date(2023, 1, 7)
    end = date(2023, 1, 1)
    
    with pytest.raises(ValueError, match="start_date cannot be after end_date"):
        validate_date_range(start, end)

def test_validate_date_range_exceeds_max_days():
    """Verify date range > MAX_ALLOWED_DAYS raises ValueError."""
    start = date(2023, 1, 1)
    end = start + timedelta(days=MAX_ALLOWED_DAYS + 1)
    
    with pytest.raises(ValueError, match=f"Date range cannot exceed {MAX_ALLOWED_DAYS} days"):
        validate_date_range(start, end)

def test_validate_request_integration():
    """Verify validate_request calls both coordinate and date validations."""
    # Valid
    validate_request(52.52, 13.41, date(2023, 1, 1), date(2023, 1, 7))
    
    # Invalid coordinates
    with pytest.raises(ValueError):
        validate_request(900, 13.41, date(2023, 1, 1), date(2023, 1, 7))
        
    # Invalid date
    with pytest.raises(ValueError):
        validate_request(52.52, 13.41, date(2023, 1, 7), date(2023, 1, 1))
