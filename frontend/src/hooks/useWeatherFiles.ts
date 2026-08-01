import { useQuery } from '@tanstack/react-query'
import { listWeatherFiles } from '@/api/weather'
import { WEATHER_KEYS } from '@/constants/query-keys'
import type { WeatherFileMetadata } from '@/types/weather'

export function useWeatherFiles() {
  const query = useQuery({
    queryKey: WEATHER_KEYS.files(),
    queryFn: listWeatherFiles,
    staleTime: 30 * 1000, // 30 seconds fresh
    retry: 2,
  })

  const files: WeatherFileMetadata[] = query.data?.files ?? []

  return {
    ...query,
    files,
    totalCount: files.length,
  }
}
