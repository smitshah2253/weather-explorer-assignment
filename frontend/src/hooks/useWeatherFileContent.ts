import { useQuery } from '@tanstack/react-query'
import { getWeatherFileContent } from '@/api/weather'
import { WEATHER_KEYS } from '@/constants/query-keys'
import type { WeatherFileContent } from '@/types/weather'

export function useWeatherFileContent(filename: string | null) {
  return useQuery<WeatherFileContent, Error>({
    queryKey: WEATHER_KEYS.fileContent(filename ?? ''),
    queryFn: () => {
      if (!filename) {
        throw new Error('Filename is required')
      }
      return getWeatherFileContent(filename)
    },
    enabled: Boolean(filename),
    staleTime: Infinity, // File contents in bucket are immutable, cache permanently
    gcTime: 30 * 60 * 1000, // 30 minutes in garbage collection
    retry: 2,
  })
}
