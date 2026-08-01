import { Outlet } from 'react-router'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { useSidebar } from '@/hooks/useSidebar'
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary'
import { LoadingBoundary } from '@/components/feedback/LoadingBoundary'

export function RootLayout() {
  const {
    isCollapsed,
    isMobile,
    isMobileOpen,
    toggleCollapse,
    toggleMobile,
    closeMobile,
  } = useSidebar()

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased selection:bg-primary/20 selection:text-primary">
      {/* Top Navbar */}
      <Navbar onMobileMenuToggle={toggleMobile} />

      {/* Main App Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          isCollapsed={isCollapsed}
          isMobile={isMobile}
          isMobileOpen={isMobileOpen}
          onToggleCollapse={toggleCollapse}
          onCloseMobile={closeMobile}
        />

        {/* Content Outlet Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden min-h-[calc(100vh-4rem)] bg-muted/10">
          <ErrorBoundary>
            <LoadingBoundary>
              <Outlet />
            </LoadingBoundary>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}
