import { QueryClient } from '@tanstack/react-query'

/**
 * Enterprise QueryClient configured with caching, garbage collection,
 * and retry backoff strategies for optimal performance and network resilience.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes fresh
      gcTime: 15 * 60 * 1000,   // 15 minutes garbage collection
      retry: (failureCount, error: unknown) => {
        // Do not retry 4xx errors (client faults)
        if (typeof error === 'object' && error !== null && 'response' in error) {
          const status = (error as { response?: { status?: number } }).response?.status
          if (status && status >= 400 && status < 500) {
            return false
          }
        }
        return failureCount < 2
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      throwOnError: false,
    },
    mutations: {
      retry: false,
    },
  },
})
