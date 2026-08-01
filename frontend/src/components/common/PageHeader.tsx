import type { ReactNode } from 'react'
import { Breadcrumbs } from './Breadcrumbs'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
  showBreadcrumbs?: boolean
}

export function PageHeader({
  title,
  description,
  actions,
  showBreadcrumbs = true,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col space-y-2 mb-6">
      {showBreadcrumbs && <Breadcrumbs />}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2.5 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
