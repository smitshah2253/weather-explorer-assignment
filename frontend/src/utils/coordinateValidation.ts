import { WEATHER_CONSTRAINTS } from '@/constants/weather'

export type CoordinateType = 'latitude' | 'longitude'

export interface CoordinateLimit {
  min: number
  max: number
  label: string
  rangeText: string
  placeholder: string
}

export const COORDINATE_LIMITS: Record<CoordinateType, CoordinateLimit> = {
  latitude: {
    min: WEATHER_CONSTRAINTS.LATITUDE_MIN, // -90.0
    max: WEATHER_CONSTRAINTS.LATITUDE_MAX, // 90.0
    label: 'Latitude',
    rangeText: '-90° to +90°',
    placeholder: 'e.g. 52.5200',
  },
  longitude: {
    min: WEATHER_CONSTRAINTS.LONGITUDE_MIN, // -180.0
    max: WEATHER_CONSTRAINTS.LONGITUDE_MAX, // 180.0
    label: 'Longitude',
    rangeText: '-180° to +180°',
    placeholder: 'e.g. 13.4050',
  },
}

/**
 * Validates whether a candidate string can be typed as a coordinate.
 * Allows intermediate typing states: "", "-", ".", "-."
 * Rejects invalid characters, multiple signs, multiple decimals, extra decimal places (> 6), and out-of-range numbers.
 */
export function isValidCoordinateInput(candidate: string, type: CoordinateType): boolean {
  // Allow empty or intermediate sign/decimal points while typing
  if (candidate === '' || candidate === '-' || candidate === '.' || candidate === '-.') {
    return true
  }

  // Strict coordinate format: optional leading minus, digits, optional decimal with up to 6 places
  const formatRegex = /^-?(\d+(\.\d{0,6})?|\.\d{0,6})$/
  if (!formatRegex.test(candidate)) {
    return false
  }

  const num = parseFloat(candidate)
  if (isNaN(num)) {
    return false
  }

  const limits = COORDINATE_LIMITS[type]
  return num >= limits.min && num <= limits.max
}

/**
 * Simulates the resulting input value when a key is pressed or text is pasted at current selection.
 */
export function simulateInputValue(
  currentValue: string,
  selectionStart: number | null,
  selectionEnd: number | null,
  insertedText: string
): string {
  const start = selectionStart ?? currentValue.length
  const end = selectionEnd ?? currentValue.length
  return currentValue.slice(0, start) + insertedText + currentValue.slice(end)
}

/**
 * Clamps a numeric coordinate to valid geographic bounds and formats to standard precision.
 */
export function clampCoordinate(val: number, type: CoordinateType): number {
  const limits = COORDINATE_LIMITS[type]
  if (isNaN(val)) return 0
  const clamped = Math.max(limits.min, Math.min(limits.max, val))
  return parseFloat(clamped.toFixed(4))
}
