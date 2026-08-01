/**
 * Common API response envelopes and error types.
 */

export interface ApiResponse<T = unknown> {
  status: string
  data?: T
  message?: string
}

export interface ApiErrorResponse {
  status: string
  message: string
  detail?: string | Array<{ loc: string[]; msg: string; type: string }>
}

export interface HealthCheckResponse {
  status: string
}
