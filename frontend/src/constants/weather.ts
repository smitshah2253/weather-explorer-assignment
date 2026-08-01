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

export const DEFAULT_PRESETS = [
  { name: 'London, UK', latitude: 51.5074, longitude: -0.1278 },
  { name: 'New York, USA', latitude: 40.7128, longitude: -74.006 },
  { name: 'Tokyo, Japan', latitude: 35.6762, longitude: 139.6503 },
  { name: 'Sydney, Australia', latitude: -33.8688, longitude: 151.2093 },
  { name: 'Berlin, Germany', latitude: 52.52, longitude: 13.405 },
] as const
