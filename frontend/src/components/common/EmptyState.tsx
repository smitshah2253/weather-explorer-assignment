import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/20 p-8 text-center animate-in fade-in-50',
        className
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground mb-4 shadow-inner">
        <Icon className="h-8 w-8 stroke-[1.5]" />
      </div>

      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>

      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
          {description}
        </p>
      )}

      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  )
}
