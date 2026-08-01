import { useQuery } from '@tanstack/react-query'
import { checkBackendHealth } from '@/api/weather'
import { WEATHER_KEYS } from '@/constants/query-keys'
import { Badge } from '@/components/ui/Badge'
import { Loader2 } from 'lucide-react'

export function StatusBadge() {
  const { data, isLoading, isError } = useQuery({
    queryKey: WEATHER_KEYS.health(),
    queryFn: checkBackendHealth,
    refetchInterval: 30000, // check health every 30s
    retry: 1,
  })

  if (isLoading) {
    return (
      <Badge variant="outline" className="gap-1.5 py-1 px-2.5 font-normal">
        <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Checking API...</span>
      </Badge>
    )
  }

  if (isError || data?.status !== 'healthy') {
    return (
      <Badge variant="destructive" className="gap-1.5 py-1 px-2.5 font-normal">
        <span className="h-2 w-2 rounded-full bg-destructive-foreground animate-ping" />
        <span className="text-xs">API Offline</span>
      </Badge>
    )
  }

  return (
    <Badge variant="success" className="gap-1.5 py-1 px-2.5 font-normal">
      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
      <span className="text-xs font-medium">FastAPI Online</span>
    </Badge>
  )
}
