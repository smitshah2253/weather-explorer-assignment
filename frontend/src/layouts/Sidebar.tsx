import { NavLink } from 'react-router'
import { ChevronLeft, ChevronRight, X, ExternalLink } from 'lucide-react'
import { NAV_ITEMS } from '@/constants/navigation'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface SidebarProps {
  isCollapsed: boolean
  isMobile: boolean
  isMobileOpen: boolean
  onToggleCollapse: () => void
  onCloseMobile: () => void
}

export function Sidebar({
  isCollapsed,
  isMobile,
  isMobileOpen,
  onToggleCollapse,
  onCloseMobile,
}: SidebarProps) {
  const sidebarContent = (
    <div className="flex h-full flex-col justify-between p-3">
      {/* Top Section: Nav Links */}
      <div className="space-y-4">
        {/* Mobile Header Close */}
        {isMobile && (
          <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Navigation
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCloseMobile}
              className="h-8 w-8 rounded-lg"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={isMobile ? onCloseMobile : undefined}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 select-none relative',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25'
                    : 'text-muted-foreground hover:bg-accent/80 hover:text-foreground',
                  isCollapsed && !isMobile && 'justify-center px-0'
                )
              }
              title={isCollapsed && !isMobile ? item.title : undefined}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />

              {(!isCollapsed || isMobile) && (
                <span className="truncate">{item.title}</span>
              )}

              {item.badge && (!isCollapsed || isMobile) && (
                <span className="ml-auto rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Bottom Section: Footer Actions & Collapse Toggle */}
      <div className="space-y-2 pt-4 border-t border-border/60">
        <a
          href="https://open-meteo.com/en/docs/historical-weather-api"
          target="_blank"
          rel="noreferrer"
          className={cn(
            'flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors',
            isCollapsed && !isMobile && 'justify-center px-0'
          )}
          title="Open-Meteo Documentation"
        >
          <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
          {(!isCollapsed || isMobile) && (
            <span className="truncate">Open-Meteo Docs</span>
          )}
        </a>

        {!isMobile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className={cn(
              'w-full justify-start text-xs text-muted-foreground hover:text-foreground',
              isCollapsed && 'justify-center px-0'
            )}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )

  // Mobile Drawer Mode
  if (isMobile) {
    if (!isMobileOpen) return null

    return (
      <div className="fixed inset-0 z-50 flex">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in"
          onClick={onCloseMobile}
        />

        {/* Drawer panel */}
        <aside className="relative z-50 w-72 max-w-[85vw] bg-card border-r border-border shadow-2xl animate-in slide-in-from-left duration-200">
          {sidebarContent}
        </aside>
      </div>
    )
  }

  // Desktop Collapsible Sidebar
  return (
    <aside
      className={cn(
        'hidden md:flex flex-col border-r border-border/70 bg-card/40 backdrop-blur-sm transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {sidebarContent}
    </aside>
  )
}
