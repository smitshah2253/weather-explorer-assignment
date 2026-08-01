import { Outlet } from 'react-router'
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary'
import { LoadingBoundary } from '@/components/feedback/LoadingBoundary'

export function RootLayout() {
  return (
    <div className="min-h-screen w-full ambient-glow-bg text-foreground flex flex-col antialiased selection:bg-primary/20 selection:text-primary">
      {/* Main App Container */}
      <main className="flex-1 w-full">
        <ErrorBoundary>
          <LoadingBoundary>
            <Outlet />
          </LoadingBoundary>
        </ErrorBoundary>
      </main>
    </div>
  )
}
