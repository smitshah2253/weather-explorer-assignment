/**
 * Formatting utility functions for dates, sizes, coordinates, and units.
 */

/**
 * Formats a raw byte count into human-readable units (e.g. 1.2 KB, 3.4 MB).
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

/**
 * Formats an ISO date string into a user-friendly format (e.g. "Jan 1, 2023").
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date)
  } catch {
    return dateString
  }
}

/**
 * Formats an ISO datetime string into full date and time (e.g. "Jan 1, 2023, 14:30").
 */
export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  } catch {
    return dateString
  }
}

/**
 * Formats decimal coordinates with cardinal direction indicator (e.g. 52.52° N, 13.41° E).
 */
export function formatCoordinates(latitude: number, longitude: number): string {
  const latDir = latitude >= 0 ? 'N' : 'S'
  const lonDir = longitude >= 0 ? 'E' : 'W'
  return `${Math.abs(latitude).toFixed(2)}° ${latDir}, ${Math.abs(longitude).toFixed(2)}° ${lonDir}`
}

/**
 * Formats a temperature value with degree unit (e.g. "24.5 °C").
 */
export function formatTemperature(temp: number | undefined | null, unit = '°C'): string {
  if (temp === undefined || temp === null || isNaN(temp)) return 'N/A'
  return `${temp.toFixed(1)} ${unit}`
}
