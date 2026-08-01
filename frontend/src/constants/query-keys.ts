/**
 * Centralized TanStack Query key factory for cache management & invalidation.
 */
export const WEATHER_KEYS = {
  all: ['weather'] as const,
  health: () => [...WEATHER_KEYS.all, 'health'] as const,
  files: () => [...WEATHER_KEYS.all, 'files'] as const,
  fileContent: (filename: string) => [...WEATHER_KEYS.all, 'file', filename] as const,
} as const
