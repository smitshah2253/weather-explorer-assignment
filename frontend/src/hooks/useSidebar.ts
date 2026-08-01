import { useLocalStorage } from './useLocalStorage'
import { useMediaQuery } from './useMediaQuery'

const SIDEBAR_STORAGE_KEY = 'weather-explorer-sidebar-collapsed'

/**
 * Manages desktop and mobile sidebar states with persistent memory.
 */
export function useSidebar() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [isCollapsed, setIsCollapsed] = useLocalStorage<boolean>(
    SIDEBAR_STORAGE_KEY,
    false
  )
  const [isMobileOpen, setIsMobileOpen] = useLocalStorage<boolean>(
    'weather-explorer-mobile-sidebar-open',
    false
  )

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev)
  }

  const toggleMobile = () => {
    setIsMobileOpen((prev) => !prev)
  }

  const closeMobile = () => {
    setIsMobileOpen(false)
  }

  return {
    isCollapsed: isMobile ? false : isCollapsed,
    isMobile,
    isMobileOpen,
    toggleCollapse,
    toggleMobile,
    closeMobile,
  }
}
