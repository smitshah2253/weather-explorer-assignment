import { useQuery } from '@tanstack/react-query'
import { checkBackendHealth } from '@/api/weather'
import { WEATHER_KEYS } from '@/constants/query-keys'

export function StatusBadge() {
  const { data, isLoading, isError } = useQuery({
    queryKey: WEATHER_KEYS.health(),
    queryFn: checkBackendHealth,
    refetchInterval: 60_000, // 60 seconds — less noisy while still responsive
    staleTime: 55_000,       // Prevent unnecessary refetch on mount within interval
    retry: 1,
  })

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center h-8 w-8"
        title="Checking connection..."
        aria-label="Checking connection"
      >
        <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-pulse" />
      </div>
    )
  }

  if (isError || data?.status !== 'healthy') {
    return (
      <div
        className="flex items-center justify-center h-8 w-8"
        title="Service Offline"
        aria-label="Service Offline"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
        </span>
      </div>
    )
  }

  return (
    <div
      className="flex items-center justify-center h-8 w-8"
      title="Service Online"
      aria-label="Service Online"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
      </span>
    </div>
  )
}
