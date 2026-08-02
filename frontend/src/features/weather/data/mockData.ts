import type { WeatherFileContent } from '@/types/weather'

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
