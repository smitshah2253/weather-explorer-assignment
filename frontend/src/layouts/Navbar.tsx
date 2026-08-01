import { CloudSun, Menu } from 'lucide-react'
import { Link } from 'react-router'
import { ROUTES } from '@/constants/routes'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/Button'

interface NavbarProps {
  onMobileMenuToggle: () => void
}

export function Navbar({ onMobileMenuToggle }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/80 backdrop-blur-md transition-all">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left Side: Mobile Menu Button & Brand */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMobileMenuToggle}
            className="md:hidden h-9 w-9 rounded-lg"
            aria-label="Toggle navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Link
            to={ROUTES.EXPLORE}
            className="flex items-center gap-2.5 group select-none"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-blue-400 text-primary-foreground shadow-md shadow-primary/20 transition-transform group-hover:scale-105">
              <CloudSun className="h-5 w-5 stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-foreground flex items-center gap-1.5">
                Weather Explorer
                <span className="inline-flex items-center rounded-full bg-primary/10 px-1.5 py-0.2 text-[10px] font-semibold text-primary">
                  v1.0
                </span>
              </span>
              <span className="text-[11px] text-muted-foreground hidden sm:inline-block">
                Climate Intelligence Dashboard
              </span>
            </div>
          </Link>
        </div>

        {/* Right Side: Status Badge & Theme Switcher */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <StatusBadge />
          </div>

          <div className="h-4 w-[1px] bg-border hidden sm:block" />

          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
