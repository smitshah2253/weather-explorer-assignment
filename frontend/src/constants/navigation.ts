import { Compass, History, BarChart3, Settings } from 'lucide-react'
import { ROUTES } from './routes'
import type { NavItem } from '@/types/navigation'

export const NAV_ITEMS: NavItem[] = [
  {
    title: 'Explore & Fetch',
    href: ROUTES.EXPLORE,
    icon: Compass,
    description: 'Fetch historical climate data & store to GCS',
  },
  {
    title: 'Stored History',
    href: ROUTES.HISTORY,
    icon: History,
    description: 'Browse saved weather dataset files',
  },
  {
    title: 'Analytics & Trends',
    href: ROUTES.ANALYTICS,
    icon: BarChart3,
    description: 'Temperature and climate metrics visualizer',
  },
  {
    title: 'Settings',
    href: ROUTES.SETTINGS,
    icon: Settings,
    description: 'API configuration and environment status',
  },
]
