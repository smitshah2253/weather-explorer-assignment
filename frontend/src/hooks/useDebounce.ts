import { useState, useEffect } from 'react'

/**
 * Delays updating state value until delay has elapsed (useful for search/coordinate inputs).
 */
export function useDebounce<T>(value: T, delay: number = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
