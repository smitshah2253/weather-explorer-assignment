import { useState, useEffect, useMemo, useCallback } from 'react'
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
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
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
  isLoading?: boolean
}

const PAGE_SIZE = 25

export function StoredFilesDrawer({
  isOpen,
  onClose,
  files,
  selectedFilename,
  onSelectFile,
  onRefresh,
  isLoading = false,
}: StoredFilesDrawerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

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

  // Reset pagination when search/filter changes or drawer opens
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [searchQuery, filterDate, isOpen])

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

  // 1. High Performance: Precompute parsed metadata and city names once per file list change
  // Prevents running Haversine calculation for 90+ cities on every render or filter keystroke
  const indexedFiles = useMemo(() => {
    return files.map((file) => {
      const parsed = parseWeatherFilename(file.name)
      const cityName = getCityFromFilename(file.name)
      const dateText = parsed
        ? `${formatDisplayDate(parsed.startDate)} ${formatDisplayDate(parsed.endDate)} ${parsed.startDate} ${parsed.endDate}`.toLowerCase()
        : ''

      return {
        file,
        parsed,
        cityName,
        searchIndex: `${cityName} ${file.name} ${dateText}`.toLowerCase(),
      }
    })
  }, [files])

  // 2. Filter using precomputed index
  const filteredIndexedFiles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()

    return indexedFiles.filter(({ parsed, searchIndex }) => {
      // Text Search
      if (q && !searchIndex.includes(q)) {
        return false
      }

      // Date Range Filter: Match if filterDate is inside the dataset's date span [startDate, endDate]
      if (filterDate) {
        if (!parsed) return false
        const isWithinRange =
          filterDate >= parsed.startDate && filterDate <= parsed.endDate
        if (!isWithinRange) {
          return false
        }
      }

      return true
    })
  }, [indexedFiles, searchQuery, filterDate])

  const visibleItems = useMemo(() => {
    return filteredIndexedFiles.slice(0, visibleCount)
  }, [filteredIndexedFiles, visibleCount])

  const hasMore = visibleCount < filteredIndexedFiles.length

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredIndexedFiles.length))
  }, [filteredIndexedFiles.length])

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
              className="w-full sm:w-[460px] max-w-full bg-background border-l border-border shadow-2xl flex flex-col"
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
                      {isLoading
                        ? 'Loading archived datasets...'
                        : hasActiveFilters
                        ? `${filteredIndexedFiles.length} of ${files.length} climate datasets`
                        : `${files.length} saved climate datasets`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRefreshClick}
                    disabled={isRefreshing || isLoading}
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

              {/* City-wise & Date-wise Filters (Single Line Layout) */}
              <div className="p-3 border-b border-border/70 bg-muted/20">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 min-w-0">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground stroke-[2] pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search city..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex h-8 w-full rounded-lg border border-input bg-background pl-8 pr-2.5 text-xs shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label="Search saved datasets by city"
                    />
                  </div>

                  <div className="w-[128px] shrink-0">
                    <input
                      type="date"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      className="flex h-8 w-full rounded-lg border border-input bg-background px-2 text-xs font-mono shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                      aria-label="Filter datasets by date"
                    />
                  </div>

                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearFilters}
                      leftIcon={<FilterX className="h-3 w-3 stroke-[2]" />}
                      className="h-8 px-2 text-[11px] text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
                      aria-label="Clear all filters"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              {/* File List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5" role="list">
                {isLoading ? (
                  <div className="space-y-2.5 p-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="p-3.5 rounded-xl border border-border/60 bg-card/50 space-y-2">
                        <div className="flex justify-between items-center">
                          <Skeleton className="h-4 w-28" />
                          <Skeleton className="h-3.5 w-12" />
                        </div>
                        <Skeleton className="h-3 w-40" />
                        <div className="flex justify-between pt-1">
                          <Skeleton className="h-2.5 w-14" />
                          <Skeleton className="h-2.5 w-16" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredIndexedFiles.length === 0 ? (
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
                  <>
                    {visibleItems.map(({ file, parsed, cityName }) => {
                      const isSelected = selectedFilename === file.name

                      return (
                        <div
                          key={file.name}
                          role="listitem"
                          onClick={() => {
                            onSelectFile(file)
                            onClose()
                          }}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                            isSelected
                              ? 'border-primary bg-primary/5 shadow-xs ring-1 ring-primary/30'
                              : 'border-border/80 hover:border-border bg-card/80 hover:bg-muted/40'
                          }`}
                        >
                          {/* City Name Header */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div
                                className={`p-1.5 rounded-lg shrink-0 ${
                                  isSelected
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
                    })}

                    {/* Pagination Load More Button */}
                    {hasMore && (
                      <div className="pt-2 pb-1 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleLoadMore}
                          className="w-full h-8 text-xs font-medium text-muted-foreground hover:text-foreground"
                        >
                          <ChevronDown className="h-3.5 w-3.5 mr-1" />
                          Load More ({visibleCount} of {filteredIndexedFiles.length})
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
