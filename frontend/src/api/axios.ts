import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { ENV } from '@/config/env'
import { getErrorMessage } from '@/utils/error'

/**
 * Production-ready Axios instance configured with baseURL, timeouts, and interceptors.
 */
export const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Request Interceptor: Attach correlation / trace ID or auth if needed
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Generate unique request tracking ID if not already present
    const requestId = crypto.randomUUID()
    config.headers.set('X-Client-Request-ID', requestId)
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response Interceptor: Standardize logging and error payloads
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error: AxiosError) => {
    if (ENV.IS_DEV) {
      console.error(
        `[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}:`,
        getErrorMessage(error)
      )
    }
    return Promise.reject(error)
  }
)

export default apiClient
