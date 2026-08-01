import { Link, useLocation } from 'react-router'
import { ChevronRight, Home } from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { NAV_ITEMS } from '@/constants/navigation'
import type { BreadcrumbItem } from '@/types/navigation'

export function Breadcrumbs() {
  const location = useLocation()
  const pathnames = location.pathname.split('/').filter((x) => x)

  const items: BreadcrumbItem[] = [
    {
      title: 'Home',
      href: ROUTES.EXPLORE,
    },
  ]

  let currentPath = ''
  pathnames.forEach((segment, index) => {
    currentPath += `/${segment}`
    const isLast = index === pathnames.length - 1
    const navMatch = NAV_ITEMS.find((item) => item.href === currentPath)

    const title =
      navMatch?.title ||
      segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')

    items.push({
      title,
      href: isLast ? undefined : currentPath,
      isCurrent: isLast,
    })
  })

  if (items.length <= 1) return null

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center space-x-1.5 text-xs text-muted-foreground mb-4"
    >
      {items.map((item, index) => {
        const isFirst = index === 0

        return (
          <div key={index} className="flex items-center space-x-1.5">
            {index > 0 && (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 flex-shrink-0" />
            )}

            {item.href ? (
              <Link
                to={item.href}
                className="flex items-center hover:text-foreground transition-colors font-medium"
              >
                {isFirst && <Home className="h-3.5 w-3.5 mr-1" />}
                <span>{item.title}</span>
              </Link>
            ) : (
              <span
                className="font-semibold text-foreground truncate max-w-[200px]"
                aria-current="page"
              >
                {item.title}
              </span>
            )}
          </div>
        )
      })}
    </nav>
  )
}
