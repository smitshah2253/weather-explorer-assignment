import apiClient from './axios'
import { API_ENDPOINTS } from './endpoints'
import type {
  StoreWeatherRequest,
  StoreWeatherResponse,
  ListWeatherFilesResponse,
  WeatherFileContent,
} from '@/types/weather'
import type { HealthCheckResponse } from '@/types/api'

/**
 * Weather Explorer API client functions.
 */

export async function checkBackendHealth(): Promise<HealthCheckResponse> {
  const response = await apiClient.get<HealthCheckResponse>(API_ENDPOINTS.HEALTH)
  return response.data
}

export async function storeWeatherData(
  payload: StoreWeatherRequest
): Promise<StoreWeatherResponse> {
  const response = await apiClient.post<StoreWeatherResponse>(
    API_ENDPOINTS.STORE_WEATHER,
    payload
  )
  return response.data
}

export async function listWeatherFiles(): Promise<ListWeatherFilesResponse> {
  const response = await apiClient.get<ListWeatherFilesResponse>(
    API_ENDPOINTS.LIST_FILES
  )
  return response.data
}

export async function getWeatherFileContent(
  filename: string
): Promise<WeatherFileContent> {
  const response = await apiClient.get<WeatherFileContent>(
    API_ENDPOINTS.FILE_CONTENT(filename)
  )
  return response.data
}
