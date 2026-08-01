import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo)
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = '/'
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center shadow-lg backdrop-blur-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
              <AlertTriangle className="h-8 w-8" />
            </div>

            <h2 className="text-xl font-bold text-foreground mb-2">
              Something went wrong
            </h2>

            <p className="text-sm text-muted-foreground mb-6">
              {this.state.error?.message ||
                'An unexpected error occurred while rendering this page.'}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={this.handleGoHome}
                leftIcon={<Home className="h-4 w-4" />}
              >
                Back to Home
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={this.handleReset}
                leftIcon={<RefreshCw className="h-4 w-4" />}
              >
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
