import axios from 'axios'
import type { ApiErrorResponse } from '@/types/api'

/**
 * Normalizes any error into a human-readable string message.
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorResponse | undefined
    if (data?.message) {
      return data.message
    }
    if (typeof data?.detail === 'string') {
      return data.detail
    }
    if (Array.isArray(data?.detail) && data.detail.length > 0) {
      return data.detail.map((d) => d.msg).join(', ')
    }
    if (error.response?.statusText) {
      return `Error (${error.response.status}): ${error.response.statusText}`
    }
    if (error.message) {
      return error.message
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'An unexpected error occurred. Please try again.'
}

/**
 * Checks if the error is a 404 Not Found error.
 */
export function isNotFoundError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 404
}

/**
 * Checks if the error is a Network / Gateway error.
 */
export function isNetworkOrServerError(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    return !status || status >= 500
  }
  return false
}
