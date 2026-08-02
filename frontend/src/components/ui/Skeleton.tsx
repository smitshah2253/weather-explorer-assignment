import { cn } from '@/lib/utils'

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-muted/70 dark:bg-muted/30',
        className
      )}
      {...props}
    />
  )
}
