from datetime import datetime
from pydantic import BaseModel, Field
from app.core.constants import FILE_PREFIX, FILE_EXTENSION

class WeatherFileMetadata(BaseModel):
    """Represents a stored historical weather file."""
    name: str = Field(..., description="The unique filename of the stored artifact")
    size: int = Field(..., description="Size of the file in bytes")
    created_at: datetime = Field(..., description="The timestamp when the file was generated and saved")


def generate_weather_filename(
    latitude: float, 
    longitude: float, 
    start_date: str, 
    end_date: str, 
    timestamp: datetime
) -> str:
    """
    Generates a deterministic and safe filename for storing weather data.
    
    Args:
        latitude: The requested latitude.
        longitude: The requested longitude.
        start_date: String representation of the start date (YYYY-MM-DD).
        end_date: String representation of the end date (YYYY-MM-DD).
        timestamp: A timezone-aware datetime representing when the fetch occurred.
        
    Returns:
        A formatted string like `weather_52_52_13_41_2023-01-01_2023-01-07_20230101T120000Z.json`
    """
    # Format decimals to avoid parsing issues
    lat_str = str(latitude).replace(".", "_")
    lon_str = str(longitude).replace(".", "_")
    
    # Format the timestamp
    ts_str = timestamp.strftime("%Y%m%dT%H%M%SZ")
    
    return f"{FILE_PREFIX}_{lat_str}_{lon_str}_{start_date}_{end_date}_{ts_str}{FILE_EXTENSION}"
