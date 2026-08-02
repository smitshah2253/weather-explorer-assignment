import { useEffect, useState } from 'react'
import {
  getLocationDetails,
  resolveLocationAsync,
  subscribeGeocodingUpdates,
  type LocationDetails,
} from '@/utils/geocoding'

export function useLocationDetails(latitude: number, longitude: number): LocationDetails {
  const [location, setLocation] = useState<LocationDetails>(() =>
    getLocationDetails(latitude, longitude)
  )

  useEffect(() => {
    setLocation(getLocationDetails(latitude, longitude))

    let cancelled = false
    resolveLocationAsync(latitude, longitude).then((resolved) => {
      if (!cancelled) {
        setLocation(resolved)
      }
    })

    return () => {
      cancelled = true
    }
  }, [latitude, longitude])

  useEffect(() => {
    return subscribeGeocodingUpdates(() => {
      setLocation(getLocationDetails(latitude, longitude))
    })
  }, [latitude, longitude])

  return location
}
