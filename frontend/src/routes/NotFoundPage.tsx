import { Link } from 'react-router'
import { FileQuestion, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/constants/routes'

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full rounded-2xl border border-border bg-card p-8 shadow-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-4">
          <FileQuestion className="h-8 w-8" />
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-2">
          404
        </h1>
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Page Not Found
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          The page you are looking for does not exist or may have been moved.
        </p>

        <Link to={ROUTES.EXPLORE}>
          <Button leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back to Explore
          </Button>
        </Link>
      </div>
    </div>
  )
}
