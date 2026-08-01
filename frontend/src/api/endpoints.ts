/**
 * Backend API REST endpoints mapped to FastAPI routing.
 */
export const API_ENDPOINTS = {
  HEALTH: '/api/v1/health',
  STORE_WEATHER: '/api/v1/store-weather-data',
  LIST_FILES: '/api/v1/list-weather-files',
  FILE_CONTENT: (filename: string) => `/api/v1/weather-file-content/${encodeURIComponent(filename)}`,
} as const
