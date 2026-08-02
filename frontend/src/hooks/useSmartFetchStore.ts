import { useCallback, useMemo } from 'react'
import { parseWeatherFilename } from '@/features/weather/data/mockData'
import { useStoreWeather } from './useStoreWeather'
import type { WeatherFileMetadata, StoreWeatherResponse } from '@/types/weather'
import toast from 'react-hot-toast'

interface UseSmartFetchStoreOptions {
  onSuccess?: (data: StoreWeatherResponse) => void
  onExistingFile?: (filename: string) => void
}

/**
 * Smart fetch & store hook that checks for existing data in GCS
 * before making an API call. Prevents duplicate Open-Meteo API usage.
 */
export function useSmartFetchStore(
  files: WeatherFileMetadata[],
  options?: UseSmartFetchStoreOptions
) {
  const storeWeatherMutation = useStoreWeather({
    onSuccess: options?.onSuccess,
  })

  /**
   * Build a lookup set of coordinate+date combos for O(1) matching.
   * Normalizes lat/lon to 2 decimal places to match filename precision.
   */
  const fileIndex = useMemo(() => {
    const index = new Map<string, string>()
    for (const file of files) {
      const parsed = parseWeatherFilename(file.name)
      if (parsed) {
        const key = buildLookupKey(
          parsed.latitude,
          parsed.longitude,
          parsed.startDate,
          parsed.endDate
        )
        index.set(key, file.name)
      }
    }
    return index
  }, [files])

  const findMatchingFile = useCallback(
    (lat: number, lon: number, startDate: string, endDate: string): string | null => {
      const key = buildLookupKey(lat, lon, startDate, endDate)
      return fileIndex.get(key) ?? null
    },
    [fileIndex]
  )

  const smartFetchAndStore = useCallback(
    (lat: number, lon: number, startDate: string, endDate: string) => {
      const existingFilename = findMatchingFile(lat, lon, startDate, endDate)

      if (existingFilename) {
        toast.success('Data already exists. Loaded from storage.', {
          icon: '📂',
          duration: 3000,
        })
        options?.onExistingFile?.(existingFilename)
        return
      }

      storeWeatherMutation.mutate({
        latitude: lat,
        longitude: lon,
        start_date: startDate,
        end_date: endDate,
      })
    },
    [findMatchingFile, storeWeatherMutation, options]
  )

  return {
    smartFetchAndStore,
    findMatchingFile,
    isPending: storeWeatherMutation.isPending,
    isError: storeWeatherMutation.isError,
  }
}

/**
 * Builds a normalized lookup key for coordinate+date matching.
 * Rounds coordinates to 2 decimal places to match GCS filename precision.
 */
function buildLookupKey(lat: number, lon: number, startDate: string, endDate: string): string {
  return `${lat.toFixed(2)}|${lon.toFixed(2)}|${startDate}|${endDate}`
}
