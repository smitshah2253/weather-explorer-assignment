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
 * Formats an ISO date string into short display date (e.g. "Jan 14").
 */
export function formatDisplayDate(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date)
  } catch {
    return dateString
  }
}

/**
 * Formats a Date object to YYYY-MM-DD string.
 */
export function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Calculates day difference between two YYYY-MM-DD strings.
 */
export function getDaysDifference(startDateStr: string, endDateStr: string): number {
  try {
    if (!startDateStr || !endDateStr) return 0
    const start = new Date(startDateStr)
    const end = new Date(endDateStr)
    const diffTime = end.getTime() - start.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  } catch {
    return 0
  }
}

/**
 * Adds (or subtracts) a given number of days to a YYYY-MM-DD string.
 */
export function addDays(dateStr: string, days: number): string {
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    d.setDate(d.getDate() + days)
    return formatDateISO(d)
  } catch {
    return dateStr
  }
}

/**
 * Returns the earlier of two YYYY-MM-DD date strings.
 */
export function getMinDate(d1: string, d2: string): string {
  if (!d1) return d2
  if (!d2) return d1
  return new Date(d1) <= new Date(d2) ? d1 : d2
}

/**
 * Returns the later of two YYYY-MM-DD date strings.
 */
export function getMaxDate(d1: string, d2: string): string {
  if (!d1) return d2
  if (!d2) return d1
  return new Date(d1) >= new Date(d2) ? d1 : d2
}

/**
 * Formats an ISO datetime string into relative time (e.g. "15m ago", "2h ago", "1d ago").
 */
export function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return 'Recent'
  try {
    const diffSec = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000)
    if (diffSec < 60) return 'Just now'
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`
    return `${Math.floor(diffSec / 86400)}d ago`
  } catch {
    return 'Recent'
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
