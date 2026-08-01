/**
 * Weather domain constraints and presets.
 * Aligned with backend validation rules in FastAPI.
 */

export const WEATHER_CONSTRAINTS = {
  LATITUDE_MIN: -90.0,
  LATITUDE_MAX: 90.0,
  LONGITUDE_MIN: -180.0,
  LONGITUDE_MAX: 180.0,
  MAX_ALLOWED_DAYS: 31,
} as const

export const MAX_DATE_RANGE_DAYS = 31
export const MIN_HISTORICAL_YEAR = 1940

export const DEFAULT_COORDINATES = {
  latitude: 52.52,
  longitude: 13.405,
} as const

export interface PresetLocation {
  name: string
  latitude: number
  longitude: number
}

export const PRESET_LOCATIONS: PresetLocation[] = [
  { name: 'Berlin, Germany', latitude: 52.52, longitude: 13.405 },
  { name: 'London, UK', latitude: 51.5074, longitude: -0.1278 },
  { name: 'New York, USA', latitude: 40.7128, longitude: -74.006 },
  { name: 'Tokyo, Japan', latitude: 35.6762, longitude: 139.6503 },
  { name: 'Sydney, Australia', latitude: -33.8688, longitude: 151.2093 },
  { name: 'Paris, France', latitude: 48.8566, longitude: 2.3522 },
  { name: 'Mumbai, India', latitude: 19.076, longitude: 72.8777 },
]

export const DEFAULT_PRESETS = PRESET_LOCATIONS
