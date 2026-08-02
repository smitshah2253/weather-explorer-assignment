import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Database,
  Search,
  RotateCw,
  CalendarDays,
  MapPin,
  Check,
  FilterX,
  ArrowUpDown,
  Layers,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import {
  formatBytes,
  formatRelativeTime,
  formatDisplayDate,
  formatDateRange,
  getDaysDifference,
} from '@/utils/formatters'
import { parseWeatherFilename } from '../data/mockData'
import {
  getLocationFromFilename,
  subscribeGeocodingUpdates,
  type LocationDetails,
} from '@/utils/geocoding'
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

type SortOption = 'newest' | 'oldest' | 'location' | 'size'
type PresetFilter = 'all' | 'today' | '7days' | '30days'

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'newest', label: 'Newest First' },
  { id: 'oldest', label: 'Oldest First' },
  { id: 'location', label: 'Location A–Z' },
  { id: 'size', label: 'File Size' },
]

const PRESET_FILTERS: { id: PresetFilter; label: string }[] = [
  { id: 'all', label: 'All Datasets' },
  { id: 'today', label: 'Today' },
  { id: '7days', label: 'Last 7 Days' },
  { id: '30days', label: 'Last 30 Days' },
]

const PAGE_SIZE = 30

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
  const [activePreset, setActivePreset] = useState<PresetFilter>('all')
  const [filterDate, setFilterDate] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [geoVersion, setGeoVersion] = useState(0)

  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  // Subscribe to background reverse geocoding updates for live location resolution
  useEffect(() => {
    return subscribeGeocodingUpdates(() => {
      setGeoVersion((v) => v + 1)
    })
  }, [])

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

  // Reset pagination when filters or sort changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [searchQuery, activePreset, filterDate, sortBy, isOpen])

  const handleRefreshClick = () => {
    setIsRefreshing(true)
    onRefresh()
    setTimeout(() => {
      setIsRefreshing(false)
      toast.success('Archive storage synchronized')
    }, 500)
  }

  const handleResetFilters = useCallback(() => {
    setSearchQuery('')
    setActivePreset('all')
    setFilterDate('')
  }, [])

  const hasActiveFilters = Boolean(
    searchQuery.trim() || activePreset !== 'all' || filterDate
  )

  // 1. High Performance: Precompute parsed metadata and search index once per dataset list
  const indexedFiles = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0]
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]

    return files.map((file) => {
      const parsed = parseWeatherFilename(file.name)
      const location: LocationDetails = getLocationFromFilename(file.name)
      const durationDays =
        parsed && parsed.startDate && parsed.endDate
          ? getDaysDifference(parsed.startDate, parsed.endDate)
          : 0

      const createdDateStr = file.created_at
        ? file.created_at.split('T')[0]
        : parsed?.endDate || ''

      const isToday = createdDateStr === todayStr || parsed?.endDate === todayStr
      const isLast7Days =
        createdDateStr >= sevenDaysAgo ||
        (parsed?.endDate ? parsed.endDate >= sevenDaysAgo : false)
      const isLast30Days =
        createdDateStr >= thirtyDaysAgo ||
        (parsed?.endDate ? parsed.endDate >= thirtyDaysAgo : false)

      const dateText = parsed
        ? `${formatDisplayDate(parsed.startDate)} ${formatDisplayDate(parsed.endDate)} ${parsed.startDate} ${parsed.endDate}`.toLowerCase()
        : ''

      const searchIndex = `${location.city} ${location.country} ${location.fullName} ${location.coordinates} ${file.name} ${dateText}`.toLowerCase()

      const createdAtMs = file.created_at
        ? new Date(file.created_at).getTime()
        : parsed?.endDate
        ? new Date(parsed.endDate).getTime()
        : 0

      return {
        file,
        parsed,
        location,
        durationDays,
        createdAtMs,
        isToday,
        isLast7Days,
        isLast30Days,
        searchIndex,
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files, geoVersion])

  // 2. Filter using precomputed index
  const filteredFiles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()

    return indexedFiles.filter((item) => {
      // Text Search
      if (q && !item.searchIndex.includes(q)) {
        return false
      }

      // Quick Preset Filter
      if (activePreset === 'today' && !item.isToday) return false
      if (activePreset === '7days' && !item.isLast7Days) return false
      if (activePreset === '30days' && !item.isLast30Days) return false

      // Custom Date Filter: Check if date falls within dataset span [startDate, endDate]
      if (filterDate) {
        if (!item.parsed) return false
        const isWithin =
          filterDate >= item.parsed.startDate && filterDate <= item.parsed.endDate
        if (!isWithin) return false
      }

      return true
    })
  }, [indexedFiles, searchQuery, activePreset, filterDate])

  // 3. Sorting
  const sortedFiles = useMemo(() => {
    const list = [...filteredFiles]

    list.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.createdAtMs - a.createdAtMs
        case 'oldest':
          return a.createdAtMs - b.createdAtMs
        case 'location':
          return a.location.city.localeCompare(b.location.city)
        case 'size':
          return b.file.size - a.file.size
        default:
          return 0
      }
    })

    return list
  }, [filteredFiles, sortBy])

  // 4. Progressive Chunk Loader for 1,000+ Files
  const visibleItems = useMemo(() => {
    return sortedFiles.slice(0, visibleCount)
  }, [sortedFiles, visibleCount])

  const hasMore = visibleCount < sortedFiles.length

  // 5. IntersectionObserver Infinite Scroll
  useEffect(() => {
    const target = loadMoreRef.current
    if (!target || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, sortedFiles.length))
        }
      },
      { root: null, rootMargin: '160px', threshold: 0.05 }
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [hasMore, sortedFiles.length])

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 overflow-hidden font-sans"
          role="dialog"
          aria-modal="true"
          aria-label="Archive Storage Panel"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 bg-black/45 backdrop-blur-xs"
            onClick={onClose}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="w-full sm:w-[480px] max-w-full bg-background border-l border-border shadow-2xl flex flex-col h-full overflow-hidden"
            >
              {/* ── Compact SaaS Header ── */}
              <div className="px-3.5 sm:px-4 py-2.5 sm:py-3 border-b border-border flex items-center justify-between gap-3 bg-card/60 shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="flex h-7.5 w-7.5 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0"
                    aria-hidden="true"
                  >
                    <Database className="h-4 w-4 stroke-[2.2]" />
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <h3 className="text-sm font-bold tracking-tight text-foreground whitespace-nowrap">
                      Archive Storage
                    </h3>
                    <Badge
                      variant="secondary"
                      className="text-[10px] font-mono px-1.5 py-0 h-4.5 font-medium shrink-0"
                    >
                      {isLoading ? '...' : files.length}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {/* Refresh Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRefreshClick}
                    disabled={isRefreshing || isLoading}
                    className="h-7.5 w-7.5 text-muted-foreground hover:text-foreground cursor-pointer"
                    aria-label="Synchronize archive storage"
                  >
                    <RotateCw
                      className={`h-3.5 w-3.5 stroke-[2] ${
                        isRefreshing ? 'animate-spin text-primary' : ''
                      }`}
                    />
                  </Button>

                  {/* Close Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="h-7.5 w-7.5 text-muted-foreground hover:text-foreground cursor-pointer"
                    aria-label="Close archive storage panel"
                  >
                    <X className="h-4 w-4 stroke-[2]" />
                  </Button>
                </div>
              </div>

              {/* ── Search & Filter Controls ── */}
              <div className="p-3 border-b border-border/60 bg-muted/20 space-y-2 shrink-0">
                {/* Search Input + Date Filter Row */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 min-w-0">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground stroke-[2] pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search city, country, or file..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex h-8 w-full rounded-lg border border-input bg-background pl-8 pr-7 text-xs shadow-xs placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-1.5 focus-visible:ring-ring transition-colors"
                      aria-label="Search datasets"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
                        aria-label="Clear search text"
                      >
                        <X className="h-3 w-3 stroke-[2]" />
                      </button>
                    )}
                  </div>

                  <div className="w-[118px] sm:w-[124px] shrink-0">
                    <input
                      type="date"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      className="flex h-8 w-full rounded-lg border border-input bg-background px-2 text-[11px] sm:text-xs font-mono shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-1.5 focus-visible:ring-ring transition-colors"
                      aria-label="Filter by specific date"
                    />
                  </div>
                </div>

                {/* Quick Preset Filter Pills + Sort Select Row */}
                <div className="flex items-center justify-between gap-1.5 pt-0.5">
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 max-w-[calc(100%-110px)]">
                    {PRESET_FILTERS.map((preset) => {
                      const isActive = activePreset === preset.id
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setActivePreset(preset.id)}
                          className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                            isActive
                              ? 'bg-primary text-primary-foreground shadow-2xs font-semibold'
                              : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
                          }`}
                        >
                          {preset.label}
                        </button>
                      )
                    })}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {/* Sort Select */}
                    <div className="relative">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="h-6.5 pl-2 pr-5 text-[11px] rounded-md border border-border/80 bg-background text-muted-foreground hover:text-foreground font-medium appearance-none cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        aria-label="Sort datasets"
                      >
                        {SORT_OPTIONS.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <ArrowUpDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-2.5 w-2.5 text-muted-foreground pointer-events-none stroke-[2]" />
                    </div>

                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="flex items-center gap-0.5 text-[11px] text-muted-foreground hover:text-primary font-medium px-1 py-0.5 rounded-md hover:bg-muted/50 transition-colors shrink-0 cursor-pointer"
                        aria-label="Reset all filters"
                      >
                        <FilterX className="h-3 w-3 stroke-[2]" />
                        <span>Clear</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* ── File List (Scrollable Container) ── */}
              <div
                className="flex-1 overflow-y-auto p-3 space-y-2 focus-visible:outline-none"
                role="list"
                aria-label="Stored weather datasets"
              >
                {isLoading ? (
                  /* Loading Skeletons matching exact compact layout */
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl border border-border/50 bg-card/60 space-y-2"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-3.5 w-3.5 rounded-full" />
                            <Skeleton className="h-4 w-28" />
                          </div>
                          <Skeleton className="h-4 w-10 rounded-md" />
                        </div>
                        <div className="flex items-center gap-2 pt-0.5">
                          <Skeleton className="h-3 w-36" />
                          <Skeleton className="h-3 w-12" />
                          <Skeleton className="h-3 w-14 ml-auto" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : sortedFiles.length === 0 ? (
                  /* Modern Empty State */
                  <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 space-y-3">
                    <div className="p-3 rounded-2xl bg-muted/60 text-muted-foreground/80 ring-1 ring-border/50">
                      {hasActiveFilters ? (
                        <FilterX className="h-6 w-6 stroke-[1.8]" />
                      ) : (
                        <Layers className="h-6 w-6 stroke-[1.8]" />
                      )}
                    </div>
                    <div className="space-y-1 max-w-[280px]">
                      <h4 className="text-sm font-semibold text-foreground">
                        {hasActiveFilters
                          ? 'No matching datasets'
                          : 'No archived datasets yet'}
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {hasActiveFilters
                          ? 'Try adjusting your search keywords, location name, or date range filter.'
                          : 'Fetch weather data using the explorer form to create your first cloud archive.'}
                      </p>
                    </div>
                    {hasActiveFilters && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleResetFilters}
                        leftIcon={<FilterX className="h-3.5 w-3.5 stroke-[2]" />}
                        className="h-8 text-xs font-medium cursor-pointer mt-1"
                      >
                        Reset All Filters
                      </Button>
                    )}
                  </div>
                ) : (
                  /* Compact File Cards */
                  <>
                    {visibleItems.map(({ file, parsed, location, durationDays }) => {
                      const isSelected = selectedFilename === file.name

                      return (
                        <div
                          key={file.name}
                          role="listitem"
                          tabIndex={0}
                          onClick={() => {
                            onSelectFile(file)
                            onClose()
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              onSelectFile(file)
                              onClose()
                            }
                          }}
                          className={`group relative p-2.5 rounded-xl border transition-all duration-150 cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring select-none ${
                            isSelected
                              ? 'border-primary/70 bg-primary/[0.04] ring-1 ring-primary/25 border-l-[3.5px] border-l-primary shadow-xs'
                              : 'border-border/70 hover:border-border/90 bg-card hover:bg-muted/40 hover:shadow-2xs'
                          }`}
                        >
                          {/* Row 1: City, Country, Duration Tag, Active Indicator */}
                          <div className="flex items-center justify-between gap-2 min-w-0">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <MapPin
                                className={`h-3.5 w-3.5 shrink-0 stroke-[2.2] ${
                                  isSelected
                                    ? 'text-primary'
                                    : 'text-muted-foreground/70 group-hover:text-foreground'
                                }`}
                              />
                              <span className="text-xs font-semibold text-foreground truncate tracking-tight">
                                {location.city}
                              </span>
                              {location.country && (
                                <span className="text-[11px] text-muted-foreground font-normal truncate">
                                  {location.country}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {durationDays > 0 && (
                                <span className="font-mono text-[10px] font-medium px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border/40">
                                  {durationDays}d
                                </span>
                              )}
                              {isSelected && (
                                <div className="flex items-center justify-center h-4 w-4 rounded-full bg-primary text-primary-foreground shrink-0 shadow-2xs">
                                  <Check className="h-2.5 w-2.5 stroke-[3]" />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Row 2: Date Range, File Size, Last Updated */}
                          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1.5 mt-1 border-t border-border/35 min-w-0">
                            <div className="flex items-center gap-1 min-w-0 font-mono">
                              <CalendarDays className="h-3 w-3 shrink-0 text-muted-foreground/70" />
                              {parsed ? (
                                <span className="truncate">
                                  {formatDateRange(parsed.startDate, parsed.endDate)}
                                </span>
                              ) : (
                                <span className="truncate">Archive Record</span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0 font-mono text-[10px]">
                              <span>{formatBytes(file.size)}</span>
                              <span className="text-muted-foreground/40">•</span>
                              <span>
                                {file.created_at
                                  ? formatRelativeTime(file.created_at)
                                  : 'Saved'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}

                    {/* Infinite Scroll Load Trigger */}
                    {hasMore && (
                      <div
                        ref={loadMoreRef}
                        className="py-2.5 text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5"
                      >
                        <RotateCw className="h-3 w-3 animate-spin text-muted-foreground/60" />
                        <span>Loading more datasets...</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* ── Footer Status Bar ── */}
              <div className="px-4 py-2 border-t border-border/60 bg-muted/15 flex items-center justify-between text-[11px] text-muted-foreground shrink-0 font-mono">
                <span>
                  Showing {visibleItems.length} of {sortedFiles.length}
                </span>
                <span className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-primary/70 stroke-[2]" />
                  GCS Synchronized
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
