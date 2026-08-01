from app.schemas.common import ErrorResponse
from app.schemas.weather import StoreWeatherRequest, StoreWeatherResponse
from datetime import date
import pytest

def test_error_response_model():
    response = ErrorResponse(message="Something went wrong")
    assert response.status == "error"
    assert response.message == "Something went wrong"

def test_store_weather_request_validation():
    req = StoreWeatherRequest(
        latitude=50.0,
        longitude=10.0,
        start_date=date(2023, 1, 1),
        end_date=date(2023, 1, 7)
    )
    assert req.latitude == 50.0

def test_store_weather_response():
    resp = StoreWeatherResponse(status="ok", file="test.json")
    assert resp.status == "ok"
