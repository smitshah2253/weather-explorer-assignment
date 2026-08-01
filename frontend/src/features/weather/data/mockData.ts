import type {
  WeatherFileContent,
  WeatherFileMetadata,
} from '@/types/weather'

export interface WeatherTableRow {
  date: string
  maxTemp: number
  minTemp: number
  avgTemp: number
  precipitation: number
  windSpeed: number
  weatherCode: number
  weatherCondition: string
}

export function getWeatherConditionText(code: number): {
  label: string
  category: 'sun' | 'cloud' | 'rain' | 'snow' | 'thunder'
} {
  if (code === 0) return { label: 'Clear Sky', category: 'sun' }
  if (code <= 3) return { label: 'Partly Cloudy', category: 'cloud' }
  if (code <= 48) return { label: 'Foggy / Overcast', category: 'cloud' }
  if (code <= 67) return { label: 'Light / Moderate Rain', category: 'rain' }
  if (code <= 77) return { label: 'Snow Grains / Snowfall', category: 'snow' }
  if (code <= 82) return { label: 'Rain Showers', category: 'rain' }
  if (code <= 86) return { label: 'Snow Showers', category: 'snow' }
  return { label: 'Thunderstorm', category: 'thunder' }
}

/**
 * Deterministically generates realistic historical daily weather data
 * based on geographic coordinates and date ranges.
 */
export function generateMockWeatherData(
  lat: number,
  lon: number,
  startDateStr: string,
  endDateStr: string
): WeatherFileContent {
  const start = new Date(startDateStr)
  const end = new Date(endDateStr)
  const dates: string[] = []

  const current = new Date(start)
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0])
    current.setDate(current.getDate() + 1)
  }

  // Base seasonal and latitude temperature heuristics
  const month = start.getMonth() // 0-11
  const isNorthern = lat >= 0
  const seasonalFactor = isNorthern
    ? Math.sin(((month - 1) / 12) * 2 * Math.PI)
    : -Math.sin(((month - 1) / 12) * 2 * Math.PI)

  const baseTemp = 18 - (Math.abs(lat) / 90) * 25 + seasonalFactor * 12

  const maxTemps: number[] = []
  const minTemps: number[] = []
  const precipitations: number[] = []
  const windSpeeds: number[] = []
  const weatherCodes: number[] = []

  dates.forEach((_, i) => {
    // Deterministic pseudo-random variation
    const seed = Math.sin(lat * 10 + lon * 5 + i * 1.5)
    const dailyVariation = seed * 4.5

    const max = parseFloat((baseTemp + 4 + dailyVariation).toFixed(1))
    const min = parseFloat((baseTemp - 4 + dailyVariation * 0.8).toFixed(1))
    const precip = Math.abs(seed) > 0.4 ? parseFloat((Math.abs(seed) * 8.5).toFixed(1)) : 0
    const wind = parseFloat((8 + Math.abs(seed) * 18).toFixed(1))

    let code = 0
    if (precip > 5) code = 65 // heavy rain
    else if (precip > 1) code = 61 // rain
    else if (Math.abs(seed) > 0.5) code = 3 // overcast
    else if (Math.abs(seed) > 0.2) code = 1 // partly cloudy

    maxTemps.push(max)
    minTemps.push(min)
    precipitations.push(precip)
    windSpeeds.push(wind)
    weatherCodes.push(code)
  })

  return {
    latitude: lat,
    longitude: lon,
    elevation: 45.0,
    generationtime_ms: 1.25,
    utc_offset_seconds: 0,
    timezone: 'UTC',
    timezone_abbreviation: 'UTC',
    daily_units: {
      time: 'iso8601',
      temperature_2m_max: '°C',
      temperature_2m_min: '°C',
      precipitation_sum: 'mm',
      wind_speed_10m_max: 'km/h',
      weather_code: 'wmo code',
    },
    daily: {
      time: dates,
      temperature_2m_max: maxTemps,
      temperature_2m_min: minTemps,
      precipitation_sum: precipitations,
      wind_speed_10m_max: windSpeeds,
      weather_code: weatherCodes,
    },
  }
}

/**
 * Transforms raw daily arrays into table rows.
 */
export function formatWeatherDataToTable(data: WeatherFileContent): WeatherTableRow[] {
  const { time, temperature_2m_max, temperature_2m_min, precipitation_sum, wind_speed_10m_max, weather_code } =
    data.daily

  return time.map((date, idx) => {
    const maxTemp = temperature_2m_max[idx]
    const minTemp = temperature_2m_min[idx]
    const avgTemp = parseFloat(((maxTemp + minTemp) / 2).toFixed(1))
    const precipitation = precipitation_sum?.[idx] ?? 0
    const windSpeed = wind_speed_10m_max?.[idx] ?? 0
    const code = weather_code?.[idx] ?? 0
    const condition = getWeatherConditionText(code).label

    return {
      date,
      maxTemp,
      minTemp,
      avgTemp,
      precipitation,
      windSpeed,
      weatherCode: code,
      weatherCondition: condition,
    }
  })
}

/**
 * Pre-seeded mock files representing GCS stored objects.
 */
export const INITIAL_STORED_FILES: WeatherFileMetadata[] = [
  {
    name: 'weather_52.52_13.41_2023-01-01_2023-01-14.json',
    size: 2450,
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    name: 'weather_40.71_-74.01_2023-06-01_2023-06-15.json',
    size: 2510,
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    name: 'weather_35.68_139.69_2023-04-10_2023-04-24.json',
    size: 2480,
    created_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
  },
  {
    name: 'weather_51.51_-0.13_2023-07-01_2023-07-15.json',
    size: 2420,
    created_at: new Date(Date.now() - 1000 * 60 * 840).toISOString(),
  },
  {
    name: 'weather_-33.87_151.21_2023-11-01_2023-11-14.json',
    size: 2465,
    created_at: new Date(Date.now() - 1000 * 60 * 1440).toISOString(),
  },
]

/**
 * Extracts coordinates and date range from filename format:
 * `weather_{lat}_{lon}_{startDate}_{endDate}.json`
 */
export function parseWeatherFilename(filename: string): {
  latitude: number
  longitude: number
  startDate: string
  endDate: string
} | null {
  const match = filename.match(
    /^weather_([-\d.]+)_([-\d.]+)_(\d{4}-\d{2}-\d{2})_(\d{4}-\d{2}-\d{2})\.json$/
  )
  if (!match) return null
  return {
    latitude: parseFloat(match[1]),
    longitude: parseFloat(match[2]),
    startDate: match[3],
    endDate: match[4],
  }
}
