/**
 * Domain types for Weather Explorer application.
 * Mirrors backend Pydantic models & weather responses.
 */

export interface StoreWeatherRequest {
  latitude: number
  longitude: number
  start_date: string // YYYY-MM-DD
  end_date: string   // YYYY-MM-DD
}

export interface StoreWeatherResponse {
  status: string
  file: string
}

export interface WeatherFileMetadata {
  name: string
  size: number
  created_at: string | null
}

export interface ListWeatherFilesResponse {
  status: string
  count: number
  files: WeatherFileMetadata[]
}

export interface DailyWeatherData {
  time: string[]
  temperature_2m_max: number[]
  temperature_2m_min: number[]
  precipitation_sum?: number[]
  wind_speed_10m_max?: number[]
  weather_code?: number[]
}

export interface DailyWeatherUnits {
  time: string
  temperature_2m_max: string
  temperature_2m_min: string
  precipitation_sum?: string
  wind_speed_10m_max?: string
  weather_code?: string
}

export interface WeatherFileContent {
  latitude: number
  longitude: number
  elevation?: number
  generationtime_ms?: number
  utc_offset_seconds?: number
  timezone?: string
  timezone_abbreviation?: string
  daily_units?: DailyWeatherUnits
  daily: DailyWeatherData
}

export interface WeatherFileContentResponse {
  status: string
  filename: string
  data: WeatherFileContent
}
