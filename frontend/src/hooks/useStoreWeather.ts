import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { storeWeatherData } from '@/api/weather'
import { WEATHER_KEYS } from '@/constants/query-keys'
import { getErrorMessage } from '@/utils/error'
import type { StoreWeatherRequest, StoreWeatherResponse } from '@/types/weather'

interface UseStoreWeatherOptions {
  onSuccess?: (data: StoreWeatherResponse) => void
  onError?: (error: unknown) => void
}

export function useStoreWeather(options?: UseStoreWeatherOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: StoreWeatherRequest) => storeWeatherData(payload),
    onSuccess: (data) => {
      // Invalidate stored files list so cache is refreshed automatically
      queryClient.invalidateQueries({ queryKey: WEATHER_KEYS.files() })
      toast.success('Historical weather data fetched & stored successfully!')
      options?.onSuccess?.(data)
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      toast.error(message || 'Failed to fetch and store weather data')
      options?.onError?.(error)
    },
  })
}
