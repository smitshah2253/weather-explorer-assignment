from datetime import date
from typing import Any, Annotated
from pydantic import BaseModel, Field, model_validator

from app.core.constants import LATITUDE_MIN, LATITUDE_MAX, LONGITUDE_MIN, LONGITUDE_MAX
from app.validators.weather_validator import validate_request
from app.models.weather import WeatherFileMetadata


class StoreWeatherRequest(BaseModel):
    """Request schema for historical weather fetch."""
    latitude: Annotated[float, Field(ge=LATITUDE_MIN, le=LATITUDE_MAX, description="Geographic latitude")]
    longitude: Annotated[float, Field(ge=LONGITUDE_MIN, le=LONGITUDE_MAX, description="Geographic longitude")]
    start_date: date = Field(..., description="Start date of the historical period")
    end_date: date = Field(..., description="End date of the historical period")

    @model_validator(mode="after")
    def validate_domain_rules(self) -> "StoreWeatherRequest":
        """Executes cross-field validation rules."""
        validate_request(
            latitude=self.latitude,
            longitude=self.longitude,
            start_date=self.start_date,
            end_date=self.end_date
        )
        return self


class StoreWeatherResponse(BaseModel):
    """Response returned upon successfully fetching and storing weather data."""
    status: str = Field(default="ok", description="Status indicator")
    file: str = Field(..., description="The generated filename where data was stored in GCS")


class ListWeatherFilesResponse(BaseModel):
    """Response returned when listing available stored files."""
    files: list[WeatherFileMetadata] = Field(default_factory=list, description="Array of file metadata objects")


class WeatherFileContentResponse(BaseModel):
    """Wrapper for raw JSON content of a weather file."""
    data: dict[str, Any] = Field(..., description="The raw JSON payload fetched from Open-Meteo")
