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

  dates.forEach((_, idx) => {
    // Stable pseudo-random wave
    const wave = Math.sin(idx * 0.7 + lat * 0.1 + lon * 0.05)
    const dayNoise = Math.cos(idx * 1.3) * 3

    const tMax = Math.round((baseTemp + 4 + wave * 5 + dayNoise) * 10) / 10
    const tMin = Math.round((tMax - 6 - Math.abs(wave) * 3) * 10) / 10

    const rainChance = Math.sin(idx * 0.4 + lon * 0.2)
    const precipitation =
      rainChance > 0.4 ? Math.round((rainChance - 0.4) * 15 * 10) / 10 : 0

    const wind = Math.round((12 + Math.abs(Math.cos(idx * 0.9)) * 18) * 10) / 10

    let code = 0
    if (precipitation > 5) code = 65 // heavy rain
    else if (precipitation > 0) code = 61 // slight rain
    else if (wave > 0.3) code = 1 // partly cloudy
    else if (wave > 0.7) code = 3 // overcast

    maxTemps.push(tMax)
    minTemps.push(tMin)
    precipitations.push(precipitation)
    windSpeeds.push(wind)
    weatherCodes.push(code)
  })

  return {
    latitude: lat,
    longitude: lon,
    elevation: 45,
    generationtime_ms: 0.85,
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
export function formatWeatherDataToTable(
  weatherData: WeatherFileContent
): WeatherTableRow[] {
  const {
    time,
    temperature_2m_max,
    temperature_2m_min,
    precipitation_sum,
    wind_speed_10m_max,
    weather_code,
  } = weatherData.daily

  return time.map((date, index) => {
    const maxTemp = temperature_2m_max[index] ?? 0
    const minTemp = temperature_2m_min[index] ?? 0
    const avgTemp = Math.round(((maxTemp + minTemp) / 2) * 10) / 10
    const precipitation = precipitation_sum?.[index] ?? 0
    const windSpeed = wind_speed_10m_max?.[index] ?? 0
    const code = weather_code?.[index] ?? 0
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
 * Extracts coordinates and date range from filename formats:
 * - `weather_{lat}_{lon}_{startDate}_{endDate}_{ts}.json`
 * - `weather_{lat}_{lon}_{startDate}_{endDate}.json`
 */
export function parseWeatherFilename(filename: string): {
  latitude: number
  longitude: number
  startDate: string
  endDate: string
} | null {
  const match = filename.match(
    /^weather_(.+)_(\d{4}-\d{2}-\d{2})_(\d{4}-\d{2}-\d{2})(?:_[^.]+)?\.json$/
  )
  if (!match) return null

  const coordsPart = match[1]
  const startDate = match[2]
  const endDate = match[3]

  let lat = 0
  let lon = 0

  if (coordsPart.includes('.')) {
    const parts = coordsPart.split('_')
    lat = parseFloat(parts[0]) || 0
    lon = parseFloat(parts[1]) || 0
  } else {
    const parts = coordsPart.split('_')
    if (parts.length === 2) {
      lat = parseFloat(parts[0]) || 0
      lon = parseFloat(parts[1]) || 0
    } else if (parts.length === 4) {
      lat = parseFloat(`${parts[0]}.${parts[1]}`) || 0
      lon = parseFloat(`${parts[2]}.${parts[3]}`) || 0
    } else {
      lat = parseFloat(parts[0]) || 0
      lon = parseFloat(parts[parts.length - 1]) || 0
    }
  }

  return {
    latitude: lat,
    longitude: lon,
    startDate,
    endDate,
  }
}
