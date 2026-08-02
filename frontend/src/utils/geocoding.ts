import { parseWeatherFilename } from '@/features/weather/data/mockData'

export interface LocationDetails {
  city: string
  country: string
  fullName: string
  coordinates: string
  isResolved: boolean
}

/**
 * Formats numeric coordinates into standard geographical notation (e.g. 52.52° N, 13.41° E).
 */
export function formatCoordinates(latitude: number, longitude: number): string {
  if (isNaN(latitude) || isNaN(longitude)) return 'Unknown Location'
  const latDir = latitude >= 0 ? 'N' : 'S'
  const lonDir = longitude >= 0 ? 'E' : 'W'
  return `${Math.abs(latitude).toFixed(2)}° ${latDir}, ${Math.abs(longitude).toFixed(2)}° ${lonDir}`
}

const STORAGE_PREFIX = 'weather_geo_cache_'
const memoryCache = new Map<string, { city: string; country: string }>()
const inFlightRequests = new Map<string, Promise<LocationDetails>>()
const listeners = new Set<() => void>()

/**
 * Subscribe to geocoding updates when background lookups resolve.
 */
export function subscribeGeocodingUpdates(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function notifyListeners() {
  listeners.forEach((cb) => {
    try {
      cb()
    } catch {
      // Ignore listener errors
    }
  })
}

function getCacheKey(lat: number, lon: number): string {
  return `${lat.toFixed(2)}_${lon.toFixed(2)}`
}

function readFromCache(key: string): { city: string; country: string } | null {
  if (memoryCache.has(key)) {
    return memoryCache.get(key)!
  }
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed.city === 'string') {
        memoryCache.set(key, parsed)
        return parsed
      }
    }
  } catch {
    // LocalStorage unavailable
  }
  return null
}

function writeToCache(key: string, data: { city: string; country: string }) {
  memoryCache.set(key, data)
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data))
  } catch {
    // LocalStorage quota or disabled
  }
  notifyListeners()
}

/**
 * Synchronous location resolution.
 * Returns cached city/country if available; otherwise returns clean coordinate notation
 * and automatically kicks off a background resolution.
 */
export function getLocationDetails(latitude: number, longitude: number): LocationDetails {
  const coordsFormatted = formatCoordinates(latitude, longitude)
  if (isNaN(latitude) || isNaN(longitude)) {
    return {
      city: 'Unknown Location',
      country: '',
      fullName: 'Unknown Location',
      coordinates: '0.00° N, 0.00° E',
      isResolved: false,
    }
  }

  const key = getCacheKey(latitude, longitude)
  const cached = readFromCache(key)

  if (cached) {
    const fullName = cached.country ? `${cached.city}, ${cached.country}` : cached.city
    return {
      city: cached.city,
      country: cached.country,
      fullName,
      coordinates: coordsFormatted,
      isResolved: true,
    }
  }

  // Trigger background fetch if not already in flight
  resolveLocationAsync(latitude, longitude).catch(() => {})

  return {
    city: coordsFormatted,
    country: '',
    fullName: coordsFormatted,
    coordinates: coordsFormatted,
    isResolved: false,
  }
}

/**
 * Asynchronously resolves coordinates to a city and country using keyless BigDataCloud reverse geocoding.
 * Persists results into memory and localStorage.
 */
export async function resolveLocationAsync(
  latitude: number,
  longitude: number
): Promise<LocationDetails> {
  const coordsFormatted = formatCoordinates(latitude, longitude)
  const key = getCacheKey(latitude, longitude)
  const cached = readFromCache(key)

  if (cached) {
    const fullName = cached.country ? `${cached.city}, ${cached.country}` : cached.city
    return {
      city: cached.city,
      country: cached.country,
      fullName,
      coordinates: coordsFormatted,
      isResolved: true,
    }
  }

  if (inFlightRequests.has(key)) {
    return inFlightRequests.get(key)!
  }

  const fetchPromise = (async (): Promise<LocationDetails> => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3500)

      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
        { signal: controller.signal }
      )
      clearTimeout(timeoutId)

      if (res.ok) {
        const data = await res.json()
        const city =
          data.city ||
          data.locality ||
          data.principalSubdivision ||
          data.localityInfo?.administrative?.[2]?.name ||
          data.localityInfo?.administrative?.[1]?.name ||
          coordsFormatted
        const country = data.countryName || data.countryCode || ''

        const result = { city, country }
        writeToCache(key, result)

        const fullName = country ? `${city}, ${country}` : city
        return {
          city,
          country,
          fullName,
          coordinates: coordsFormatted,
          isResolved: true,
        }
      }
    } catch {
      // Network error or timeout -> fallback to coordinates without crashing
    } finally {
      inFlightRequests.delete(key)
    }

    return {
      city: coordsFormatted,
      country: '',
      fullName: coordsFormatted,
      coordinates: coordsFormatted,
      isResolved: false,
    }
  })()

  inFlightRequests.set(key, fetchPromise)
  return fetchPromise
}

/**
 * Extracts location details from a standard weather filename (e.g. weather_52.52_13.41_...).
 */
export function getLocationFromFilename(filename: string): LocationDetails {
  const parsed = parseWeatherFilename(filename)
  if (!parsed || isNaN(parsed.latitude) || isNaN(parsed.longitude)) {
    return {
      city: 'Archived Dataset',
      country: '',
      fullName: 'Archived Dataset',
      coordinates: '',
      isResolved: false,
    }
  }
  return getLocationDetails(parsed.latitude, parsed.longitude)
}

/**
 * Returns city/country or coordinate string for a filename.
 */
export function getCityFromFilename(filename: string): string {
  return getLocationFromFilename(filename).fullName
}

/**
 * Returns city/country or coordinate string for latitude/longitude.
 */
export function getNearestCity(latitude: number, longitude: number): string {
  return getLocationDetails(latitude, longitude).fullName
}
