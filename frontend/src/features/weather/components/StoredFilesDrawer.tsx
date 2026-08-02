import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Database,
  Search,
  RotateCw,
  Braces,
  CalendarDays,
  MapPin,
  Check,
  FilterX,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/common/EmptyState'
import { formatBytes, formatRelativeTime, formatDisplayDate } from '@/utils/formatters'
import { parseWeatherFilename } from '../data/mockData'
import { getCityFromFilename } from '@/utils/geocoding'
import type { WeatherFileMetadata } from '@/types/weather'
import toast from 'react-hot-toast'

interface StoredFilesDrawerProps {
  isOpen: boolean
  onClose: () => void
  files: WeatherFileMetadata[]
  selectedFilename: string | null
  onSelectFile: (file: WeatherFileMetadata) => void
  onRefresh: () => void
}

export function StoredFilesDrawer({
  isOpen,
  onClose,
  files,
  selectedFilename,
  onSelectFile,
  onRefresh,
}: StoredFilesDrawerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleRefreshClick = () => {
    setIsRefreshing(true)
    onRefresh()
    setTimeout(() => {
      setIsRefreshing(false)
      toast.success('Archive storage synchronized')
    }, 450)
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setFilterDate('')
  }

  const hasActiveFilters = Boolean(searchQuery.trim() || filterDate)

  const filteredFiles = files.filter((file) => {
    const parsed = parseWeatherFilename(file.name)
    const cityName = getCityFromFilename(file.name).toLowerCase()

    // 1. Text Search (City, File name, or Formatted Date Text)
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      const formattedDateRange = parsed
        ? `${formatDisplayDate(parsed.startDate)} ${formatDisplayDate(parsed.endDate)} ${parsed.startDate} ${parsed.endDate}`.toLowerCase()
        : ''
      const matchesCity = cityName.includes(q)
      const matchesName = file.name.toLowerCase().includes(q)
      const matchesDateText = formattedDateRange.includes(q)

      if (!matchesCity && !matchesName && !matchesDateText) {
        return false
      }
    }

    // 2. Date-wise Range Filter
    if (filterDate) {
      if (!parsed) return false
      // Match if filterDate is inside the dataset's date span [startDate, endDate]
      const isWithinRange =
        filterDate >= parsed.startDate && filterDate <= parsed.endDate
      if (!isWithinRange) {
        return false
      }
    }

    return true
  })

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            onClick={onClose}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="w-full sm:w-[440px] max-w-full bg-background border-l border-border shadow-2xl flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary" aria-hidden="true">
                    <Database className="h-4 w-4 stroke-[2]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Archive Storage</h3>
                    <p className="text-xs text-muted-foreground">
                      {hasActiveFilters
                        ? `${filteredFiles.length} of ${files.length} climate datasets`
                        : `${files.length} saved climate datasets`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRefreshClick}
                    disabled={isRefreshing}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                    aria-label="Refresh files"
                  >
                    <RotateCw
                      className={`h-3.5 w-3.5 stroke-[2] ${isRefreshing ? 'animate-spin' : ''}`}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                    aria-label="Close drawer"
                  >
                    <X className="h-4 w-4 stroke-[2]" />
                  </Button>
                </div>
              </div>

              {/* City-wise & Date-wise Filters */}
              <div className="p-3 border-b border-border/70 bg-muted/20 space-y-2.5">
                <Input
                  placeholder="Search by city (e.g. Berlin, Tokyo, London)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="h-3.5 w-3.5 text-muted-foreground stroke-[2]" />}
                  className="text-xs h-8 bg-background font-sans placeholder:font-sans"
                  aria-label="Search saved datasets by city"
                />

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input
                      type="date"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      leftIcon={<CalendarDays className="h-3.5 w-3.5 text-muted-foreground stroke-[2]" />}
                      className="text-xs h-8 bg-background font-mono"
                      aria-label="Filter datasets by date"
                    />
                  </div>

                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearFilters}
                      leftIcon={<FilterX className="h-3 w-3 stroke-[2]" />}
                      className="h-8 px-2.5 text-[11px] text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
                      aria-label="Clear all filters"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              {/* File List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5" role="list">
                {filteredFiles.length === 0 ? (
                  <EmptyState
                    icon={Braces}
                    title="No datasets found"
                    description={
                      hasActiveFilters
                        ? `No saved files matching current filters (${[
                          searchQuery ? `city "${searchQuery}"` : null,
                          filterDate ? `date "${filterDate}"` : null,
                        ]
                          .filter(Boolean)
                          .join(', ')})`
                        : 'Fetch and store weather records to populate archive.'
                    }
                  />
                ) : (
                  filteredFiles.map((file) => {
                    const isSelected = selectedFilename === file.name
                    const parsed = parseWeatherFilename(file.name)
                    const cityName = getCityFromFilename(file.name)

                    return (
                      <div
                        key={file.name}
                        role="listitem"
                        onClick={() => {
                          onSelectFile(file)
                          onClose()
                        }}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left ${isSelected
                            ? 'border-primary bg-primary/5 shadow-xs ring-1 ring-primary/30'
                            : 'border-border/80 hover:border-border bg-card/80 hover:bg-muted/40'
                          }`}
                      >
                        {/* City Name Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={`p-1.5 rounded-lg shrink-0 ${isSelected
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted text-muted-foreground'
                                }`}
                            >
                              <MapPin className="h-3.5 w-3.5 stroke-[2.2]" />
                            </div>
                            <span className="text-sm font-semibold text-foreground truncate tracking-tight">
                              {cityName}
                            </span>
                          </div>
                          {isSelected && (
                            <Badge variant="default" className="text-[10px] py-0 px-1.5 font-medium shrink-0">
                              <Check className="h-3 w-3 mr-0.5 stroke-[2.5]" /> Active
                            </Badge>
                          )}
                        </div>

                        {/* Date Range & Metadata */}
                        {parsed && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mt-2">
                            <CalendarDays className="h-3.5 w-3.5 stroke-[2] shrink-0 text-primary/70" />
                            <span>
                              {formatDisplayDate(parsed.startDate)} – {formatDisplayDate(parsed.endDate)}
                            </span>
                          </div>
                        )}

                        {/* Footer info: Size & Relative Time */}
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/40 mt-2.5">
                          <span className="flex items-center gap-1 font-mono">
                            <Database className="h-3 w-3 stroke-[2]" />
                            {formatBytes(file.size)}
                          </span>
                          <span>
                            {file.created_at
                              ? formatRelativeTime(file.created_at)
                              : 'Recent'}
                          </span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
