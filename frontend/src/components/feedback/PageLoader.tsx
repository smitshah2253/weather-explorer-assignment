import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PageLoaderProps {
  className?: string
  message?: string
  fullScreen?: boolean
}

export function PageLoader({
  className,
  message = 'Loading data...',
  fullScreen = false,
}: PageLoaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300',
        fullScreen ? 'min-h-screen fixed inset-0 z-50 bg-background/80 backdrop-blur-sm' : 'min-h-[40vh] w-full',
        className
      )}
    >
      <div className="relative flex items-center justify-center mb-4">
        <div className="h-12 w-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        <Loader2 className="absolute h-5 w-5 text-primary animate-pulse" />
      </div>
      <p className="text-sm font-medium text-muted-foreground">{message}</p>
    </div>
  )
}
