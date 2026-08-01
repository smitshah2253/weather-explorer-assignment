# HTTP Configuration Constants
DEFAULT_HTTP_TIMEOUT: float = 10.0
DEFAULT_HTTP_RETRIES: int = 3

# Open-Meteo specific constants
# These variables represent the data points we want to extract from the archive API.
DEFAULT_DAILY_VARIABLES = [
    "temperature_2m_max",
    "temperature_2m_min",
    "precipitation_sum",
    "wind_speed_10m_max"
]

# Weather Domain Constants
MAX_ALLOWED_DAYS = 31

LATITUDE_MIN = -90.0
LATITUDE_MAX = 90.0

LONGITUDE_MIN = -180.0
LONGITUDE_MAX = 180.0

DATE_FORMAT = "%Y-%m-%d"

FILE_PREFIX = "weather"
FILE_EXTENSION = ".json"
