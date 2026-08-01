import { parseWeatherFilename } from '@/features/weather/data/mockData'


interface CityEntry {
  name: string
  country: string
  latitude: number
  longitude: number
}

// Curated worldwide cities and regional centers for instantaneous offline resolution
const GLOBAL_CITIES: CityEntry[] = [
  // Europe
  { name: 'Berlin', country: 'Germany', latitude: 52.52, longitude: 13.405 },
  { name: 'Gorzów Wielkopolski', country: 'Poland', latitude: 52.7368, longitude: 15.2288 },
  { name: 'Szczecin', country: 'Poland', latitude: 53.4285, longitude: 14.5528 },
  { name: 'Poznań', country: 'Poland', latitude: 52.4064, longitude: 16.9252 },
  { name: 'Warsaw', country: 'Poland', latitude: 52.2297, longitude: 21.0122 },
  { name: 'Kraków', country: 'Poland', latitude: 50.0647, longitude: 19.945 },
  { name: 'Wrocław', country: 'Poland', latitude: 51.1079, longitude: 17.0385 },
  { name: 'London', country: 'UK', latitude: 51.5074, longitude: -0.1278 },
  { name: 'Manchester', country: 'UK', latitude: 53.4808, longitude: -2.2426 },
  { name: 'Edinburgh', country: 'UK', latitude: 55.9533, longitude: -3.1883 },
  { name: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522 },
  { name: 'Lyon', country: 'France', latitude: 45.764, longitude: 4.8357 },
  { name: 'Marseille', country: 'France', latitude: 43.2965, longitude: 5.3698 },
  { name: 'Amsterdam', country: 'Netherlands', latitude: 52.3676, longitude: 4.9041 },
  { name: 'Rotterdam', country: 'Netherlands', latitude: 51.9244, longitude: 4.4777 },
  { name: 'Brussels', country: 'Belgium', latitude: 50.8503, longitude: 4.3517 },
  { name: 'Frankfurt', country: 'Germany', latitude: 50.1109, longitude: 8.6821 },
  { name: 'Munich', country: 'Germany', latitude: 48.1351, longitude: 11.582 },
  { name: 'Hamburg', country: 'Germany', latitude: 53.5511, longitude: 9.9937 },
  { name: 'Cologne', country: 'Germany', latitude: 50.9375, longitude: 6.9603 },
  { name: 'Zurich', country: 'Switzerland', latitude: 47.3769, longitude: 8.5417 },
  { name: 'Geneva', country: 'Switzerland', latitude: 46.2044, longitude: 6.1432 },
  { name: 'Vienna', country: 'Austria', latitude: 48.2082, longitude: 16.3738 },
  { name: 'Prague', country: 'Czechia', latitude: 50.0755, longitude: 14.4378 },
  { name: 'Budapest', country: 'Hungary', latitude: 47.4979, longitude: 19.0402 },
  { name: 'Rome', country: 'Italy', latitude: 41.9028, longitude: 12.4964 },
  { name: 'Milan', country: 'Italy', latitude: 45.4642, longitude: 9.19 },
  { name: 'Madrid', country: 'Spain', latitude: 40.4168, longitude: -3.7038 },
  { name: 'Barcelona', country: 'Spain', latitude: 41.3851, longitude: 2.1734 },
  { name: 'Lisbon', country: 'Portugal', latitude: 38.7223, longitude: -9.1393 },
  { name: 'Copenhagen', country: 'Denmark', latitude: 55.6761, longitude: 12.5683 },
  { name: 'Stockholm', country: 'Sweden', latitude: 59.3293, longitude: 18.0686 },
  { name: 'Oslo', country: 'Norway', latitude: 59.9139, longitude: 10.7522 },
  { name: 'Helsinki', country: 'Finland', latitude: 60.1699, longitude: 24.9384 },
  { name: 'Dublin', country: 'Ireland', latitude: 53.3498, longitude: -6.2603 },
  { name: 'Athens', country: 'Greece', latitude: 37.9838, longitude: 23.7275 },
  { name: 'Istanbul', country: 'Turkey', latitude: 41.0082, longitude: 28.9784 },

  // North America
  { name: 'New York', country: 'USA', latitude: 40.7128, longitude: -74.006 },
  { name: 'Los Angeles', country: 'USA', latitude: 34.0522, longitude: -118.2437 },
  { name: 'Chicago', country: 'USA', latitude: 41.8781, longitude: -87.6298 },
  { name: 'San Francisco', country: 'USA', latitude: 37.7749, longitude: -122.4194 },
  { name: 'Seattle', country: 'USA', latitude: 47.6062, longitude: -122.3321 },
  { name: 'Miami', country: 'USA', latitude: 25.7617, longitude: -80.1918 },
  { name: 'Austin', country: 'USA', latitude: 30.2672, longitude: -97.7431 },
  { name: 'Boston', country: 'USA', latitude: 42.3601, longitude: -71.0589 },
  { name: 'Washington D.C.', country: 'USA', latitude: 38.9072, longitude: -77.0369 },
  { name: 'Toronto', country: 'Canada', latitude: 43.6532, longitude: -79.3832 },
  { name: 'Vancouver', country: 'Canada', latitude: 49.2827, longitude: -123.1207 },
  { name: 'Montreal', country: 'Canada', latitude: 45.5017, longitude: -73.5673 },
  { name: 'Mexico City', country: 'Mexico', latitude: 19.4326, longitude: -99.1332 },

  // South America
  { name: 'São Paulo', country: 'Brazil', latitude: -23.5505, longitude: -46.6333 },
  { name: 'Rio de Janeiro', country: 'Brazil', latitude: -22.9068, longitude: -43.1729 },
  { name: 'Buenos Aires', country: 'Argentina', latitude: -34.6037, longitude: -58.3816 },
  { name: 'Santiago', country: 'Chile', latitude: -33.4489, longitude: -70.6693 },
  { name: 'Bogotá', country: 'Colombia', latitude: 4.711, longitude: -74.0721 },
  { name: 'Lima', country: 'Peru', latitude: -12.0464, longitude: -77.0428 },

  // Asia & Middle East
  { name: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503 },
  { name: 'Osaka', country: 'Japan', latitude: 34.6937, longitude: 135.5023 },
  { name: 'Seoul', country: 'South Korea', latitude: 37.5665, longitude: 126.978 },
  { name: 'Beijing', country: 'China', latitude: 39.9042, longitude: 116.4074 },
  { name: 'Shanghai', country: 'China', latitude: 31.2304, longitude: 121.4737 },
  { name: 'Hong Kong', country: 'Hong Kong', latitude: 22.3193, longitude: 114.1694 },
  { name: 'Taipei', country: 'Taiwan', latitude: 25.033, longitude: 121.5654 },
  { name: 'Singapore', country: 'Singapore', latitude: 1.3521, longitude: 103.8198 },
  { name: 'Bangkok', country: 'Thailand', latitude: 13.7563, longitude: 100.5018 },
  { name: 'Mumbai', country: 'India', latitude: 19.076, longitude: 72.8777 },
  { name: 'Delhi', country: 'India', latitude: 28.6139, longitude: 77.209 },
  { name: 'Bengaluru', country: 'India', latitude: 12.9716, longitude: 77.5946 },
  { name: 'Dubai', country: 'UAE', latitude: 25.2048, longitude: 55.2708 },
  { name: 'Riyadh', country: 'Saudi Arabia', latitude: 24.7136, longitude: 46.6753 },
  { name: 'Tel Aviv', country: 'Israel', latitude: 32.0853, longitude: 34.7818 },
  { name: 'Cairo', country: 'Egypt', latitude: 30.0444, longitude: 31.2357 },

  // Africa & Oceania
  { name: 'Cape Town', country: 'South Africa', latitude: -33.9249, longitude: 18.4241 },
  { name: 'Johannesburg', country: 'South Africa', latitude: -26.2041, longitude: 28.0473 },
  { name: 'Nairobi', country: 'Kenya', latitude: -1.2921, longitude: 36.8219 },
  { name: 'Sydney', country: 'Australia', latitude: -33.8688, longitude: 151.2093 },
  { name: 'Melbourne', country: 'Australia', latitude: -37.8136, longitude: 144.9631 },
  { name: 'Brisbane', country: 'Australia', latitude: -27.4698, longitude: 153.0251 },
  { name: 'Perth', country: 'Australia', latitude: -31.9505, longitude: 115.8605 },
  { name: 'Auckland', country: 'New Zealand', latitude: -36.8485, longitude: 174.7633 },
]

/**
 * Calculates great-circle distance between two points in km using Haversine formula.
 */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * In-memory cache for resolved reverse-geocoded locations.
 */
const geocodeCache = new Map<string, string>()

/**
 * Finds the nearest known city from the internal global database.
 * Completely synchronous, fast (< 1ms), and never fails.
 */
export function getNearestCity(latitude: number, longitude: number): string {
  let nearestCity = GLOBAL_CITIES[0]
  let minDistance = Infinity

  for (const city of GLOBAL_CITIES) {
    const dist = haversineDistance(latitude, longitude, city.latitude, city.longitude)
    if (dist < minDistance) {
      minDistance = dist
      nearestCity = city
    }
  }

  // If very close to city center (< 100km), show "City, Country"
  // If in surrounding region, show "Near City, Country"
  if (minDistance <= 120) {
    return `${nearestCity.name}, ${nearestCity.country}`
  } else if (minDistance <= 350) {
    return `Near ${nearestCity.name}, ${nearestCity.country}`
  } else {
    return `${nearestCity.name} Region, ${nearestCity.country}`
  }
}

/**
 * Asynchronously resolves coordinates to a city name using reverse geocoding.
 * Falls back immediately to the nearest city from the internal database.
 */
export async function resolveCityName(latitude: number, longitude: number): Promise<string> {
  const cacheKey = `${latitude.toFixed(2)}_${longitude.toFixed(2)}`
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!
  }

  const fallback = getNearestCity(latitude, longitude)

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2500)

    // Using BigDataCloud free client-side reverse geocoding or OpenStreetMap Nominatim
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
      { signal: controller.signal }
    )
    clearTimeout(timeoutId)

    if (res.ok) {
      const data = await res.json()
      const city = data.city || data.locality || data.principalSubdivision
      const country = data.countryName || data.countryCode

      if (city && country) {
        const resolved = `${city}, ${country}`
        geocodeCache.set(cacheKey, resolved)
        return resolved
      }
    }
  } catch {
    // Network failure or timeout -> fallback gracefully
  }

  geocodeCache.set(cacheKey, fallback)
  return fallback
}

export function getCityFromFilename(filename: string): string {
  const parsed = parseWeatherFilename(filename)
  if (!parsed || isNaN(parsed.latitude) || isNaN(parsed.longitude)) {
    return 'Saved Dataset'
  }
  return getNearestCity(parsed.latitude, parsed.longitude)
}
