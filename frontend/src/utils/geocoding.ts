import { parseWeatherFilename } from '@/features/weather/data/mockData'
import { PRESET_LOCATIONS } from '@/constants/weather'

const PRESET_MATCH_TOLERANCE = 0.01
const PENDING_LOCATION_LABEL = 'Finding location…'
const UNKNOWN_LOCATION_LABEL = 'Custom location'

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

function findMatchingPresetLocation(latitude: number, longitude: number) {
  return PRESET_LOCATIONS.find(
    (preset) =>
      Math.abs(preset.latitude - latitude) < PRESET_MATCH_TOLERANCE &&
      Math.abs(preset.longitude - longitude) < PRESET_MATCH_TOLERANCE
  )
}

function buildLocationDetails(
  latitude: number,
  longitude: number,
  city: string,
  country: string,
  isResolved: boolean
): LocationDetails {
  const coordinates = formatCoordinates(latitude, longitude)
  const fullName = country ? `${city}, ${country}` : city

  return {
    city,
    country,
    fullName,
    coordinates,
    isResolved,
  }
}

function extractLocalityFromResponse(data: Record<string, unknown>): string | null {
  const city = typeof data.city === 'string' ? data.city : null
  const locality = typeof data.locality === 'string' ? data.locality : null
  const subdivision =
    typeof data.principalSubdivision === 'string' ? data.principalSubdivision : null

  const localityInfo = data.localityInfo as
    | {
        locality?: Array<{ name?: string }>
        administrative?: Array<{ name?: string }>
      }
    | undefined

  const namedLocality = localityInfo?.locality?.find((entry) => entry.name)?.name
  const namedAdmin =
    localityInfo?.administrative?.[2]?.name ?? localityInfo?.administrative?.[1]?.name

  return city || locality || namedLocality || subdivision || namedAdmin || null
}

function isCoordinateLabel(value: string): boolean {
  return /^\d+\.\d+°\s*[NS],\s*\d+\.\d+°\s*[EW]$/.test(value.trim())
}

function readFromCache(key: string): { city: string; country: string } | null {
  if (memoryCache.has(key)) {
    const cached = memoryCache.get(key)!
    if (!isCoordinateLabel(cached.city)) {
      return cached
    }
    memoryCache.delete(key)
  }
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed.city === 'string' && !isCoordinateLabel(parsed.city)) {
        memoryCache.set(key, parsed)
        return parsed
      }
      localStorage.removeItem(STORAGE_PREFIX + key)
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
  if (isNaN(latitude) || isNaN(longitude)) {
    return {
      city: 'Unknown Location',
      country: '',
      fullName: 'Unknown Location',
      coordinates: '0.00° N, 0.00° E',
      isResolved: false,
    }
  }

  const preset = findMatchingPresetLocation(latitude, longitude)
  if (preset) {
    const [city, country = ''] = preset.name.split(',').map((part) => part.trim())
    return buildLocationDetails(latitude, longitude, city, country, true)
  }

  const key = getCacheKey(latitude, longitude)
  const cached = readFromCache(key)

  if (cached) {
    return buildLocationDetails(latitude, longitude, cached.city, cached.country, true)
  }

  // Trigger background fetch if not already in flight
  resolveLocationAsync(latitude, longitude).catch(() => {})

  return buildLocationDetails(latitude, longitude, PENDING_LOCATION_LABEL, '', false)
}

/**
 * Asynchronously resolves coordinates to a city and country using keyless BigDataCloud reverse geocoding.
 * Persists results into memory and localStorage.
 */
export async function resolveLocationAsync(
  latitude: number,
  longitude: number
): Promise<LocationDetails> {
  const key = getCacheKey(latitude, longitude)
  const cached = readFromCache(key)

  const preset = findMatchingPresetLocation(latitude, longitude)
  if (preset) {
    const [city, country = ''] = preset.name.split(',').map((part) => part.trim())
    return buildLocationDetails(latitude, longitude, city, country, true)
  }

  if (cached) {
    return buildLocationDetails(latitude, longitude, cached.city, cached.country, true)
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
        const resolvedCity = extractLocalityFromResponse(data)
        const city = resolvedCity || UNKNOWN_LOCATION_LABEL
        const country =
          (typeof data.countryName === 'string' && data.countryName) ||
          (typeof data.countryCode === 'string' && data.countryCode) ||
          ''

        const result = { city, country }
        writeToCache(key, result)

        return buildLocationDetails(latitude, longitude, city, country, Boolean(resolvedCity))
      }
    } catch {
      // Network error or timeout -> fallback without crashing
    } finally {
      inFlightRequests.delete(key)
    }

    return buildLocationDetails(latitude, longitude, UNKNOWN_LOCATION_LABEL, '', false)
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
