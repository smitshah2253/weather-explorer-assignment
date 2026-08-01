import { Suspense, type ReactNode } from 'react'
import { PageLoader } from './PageLoader'

interface LoadingBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

export function LoadingBoundary({ children, fallback }: LoadingBoundaryProps) {
  return (
    <Suspense fallback={fallback || <PageLoader />}>
      {children}
    </Suspense>
  )
}
