import { useState, useMemo, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  CloudSun,
  Database,
  MapPin,
  Calendar,
  Braces,
} from 'lucide-react'
import { LocationSelector } from '../components/LocationSelector'
import { IngestionControlCard } from '../components/IngestionControlCard'
import { WeatherSummaryCards } from '../components/WeatherSummaryCards'
import { TemperatureChart } from '../components/TemperatureChart'
import { WeatherDataTable } from '../components/WeatherDataTable'
import { WeatherInsightsCard } from '../components/WeatherInsightsCard'
import { JsonModal } from '../components/JsonModal'
import { StoredFilesDrawer } from '../components/StoredFilesDrawer'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/Button'
import {
  parseWeatherFilename,
  getWeatherConditionText,
} from '../data/mockData'
import { DEFAULT_COORDINATES, MAX_DATE_RANGE_DAYS } from '@/constants/weather'
import { normalizeCoordinates } from '@/utils/coordinateValidation'
import { getDaysDifference, formatDateISO, formatDisplayDate } from '@/utils/formatters'
import { getCityFromFilename } from '@/utils/geocoding'
import { useLocationDetails } from '@/hooks/useLocationDetails'
import { useWeatherFiles } from '@/hooks/useWeatherFiles'
import { useWeatherFileContent } from '@/hooks/useWeatherFileContent'
import { useSmartFetchStore } from '@/hooks/useSmartFetchStore'
import type { WeatherFileMetadata, WeatherFileContent } from '@/types/weather'
import toast from 'react-hot-toast'

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
}

export default function ExplorePage() {
  const [latitude, setLatitude] = useState<number>(DEFAULT_COORDINATES.latitude)
  const [longitude, setLongitude] = useState<number>(DEFAULT_COORDINATES.longitude)
  const location = useLocationDetails(latitude, longitude)

  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date()
    d.setDate(d.getDate() - 31)
    return formatDateISO(d)
  })
  const [endDate, setEndDate] = useState<string>(() => {
    const d = new Date()
    d.setDate(d.getDate() - 2)
    return formatDateISO(d)
  })

  const [selectedFilename, setSelectedFilename] = useState<string | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false)

  // 1. Live Weather Files Query from backend
  const {
    files,
    isLoading: isFilesLoading,
    refetch: refetchFiles,
  } = useWeatherFiles()

  // Use live files from backend (no mock fallback in production)
  const displayFiles: WeatherFileMetadata[] = files

  const hasInitializedRef = useRef(false)

  // Automatically select the newest file ONCE on initial mount
  useEffect(() => {
    if (!hasInitializedRef.current && displayFiles.length > 0) {
      hasInitializedRef.current = true
      const initialFile = displayFiles[0]
      if (initialFile) {
        setSelectedFilename(initialFile.name)
        const parsed = parseWeatherFilename(initialFile.name)
        if (parsed) {
          setLatitude(parsed.latitude)
          setLongitude(parsed.longitude)
          setStartDate(parsed.startDate)
          setEndDate(parsed.endDate)
        }
      }
    }
  }, [displayFiles])

  // 2. Fetch active file content via React Query
  const {
    data: fetchedContent,
    isLoading: isFetchingContent,
  } = useWeatherFileContent(selectedFilename)

  // 3. Smart Fetch & Store with deduplication
  const { smartFetchAndStore, isPending: isStoring } = useSmartFetchStore(
    displayFiles,
    {
      onSuccess: (res) => {
        if (res.file) {
          setSelectedFilename(res.file)
        }
      },
      onExistingFile: (filename) => {
        setSelectedFilename(filename)
      },
    }
  )

  // Strict date validation
  const daysDiff = getDaysDifference(startDate, endDate)
  const isEndBeforeStart = new Date(endDate) < new Date(startDate)
  const isRangeTooLong = daysDiff > MAX_DATE_RANGE_DAYS
  const isDateValid = !isEndBeforeStart && !isRangeTooLong && daysDiff > 0

  // Derive active weather data from backend content only (no mock data)
  const activeWeatherData: WeatherFileContent | null = useMemo(() => {
    if (fetchedContent && fetchedContent.daily && fetchedContent.daily.time?.length) {
      return fetchedContent
    }
    return null
  }, [fetchedContent])

  const handleLocationChange = (lat: number, lon: number) => {
    const [normLat, normLon] = normalizeCoordinates(lat, lon)
    setLatitude(normLat)
    setLongitude(normLon)
    setSelectedFilename(null)
  }

  const handleResetLocation = () => {
    setLatitude(DEFAULT_COORDINATES.latitude)
    setLongitude(DEFAULT_COORDINATES.longitude)
    setSelectedFilename(null)
    toast.success('Reset to Berlin, Germany')
  }

  const handleSelectFile = (file: WeatherFileMetadata) => {
    setSelectedFilename(file.name)
    const parsed = parseWeatherFilename(file.name)
    if (parsed) {
      setLatitude(parsed.latitude)
      setLongitude(parsed.longitude)
      setStartDate(parsed.startDate)
      setEndDate(parsed.endDate)
      const fileCity = getCityFromFilename(file.name)
      toast.success(`Loaded dataset for ${fileCity}`)
    }
  }

  const handleFetchAndStore = () => {
    if (!isDateValid) return
    smartFetchAndStore(latitude, longitude, startDate, endDate)
  }

  const handleRefreshFiles = () => {
    refetchFiles()
  }

  const currentCondition = activeWeatherData
    ? getWeatherConditionText(activeWeatherData.daily.weather_code?.[0] ?? 1)
    : null

  const heroMaxTemp = activeWeatherData?.daily.temperature_2m_max[0] ?? 0
  const heroMinTemp = activeWeatherData?.daily.temperature_2m_min[0] ?? 0

  return (
    <div className="min-h-screen w-full flex flex-col font-sans">
      {/* ── NAV ── */}
      <header className="sticky top-0 z-30 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="max-w-[1536px] xl:max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shadow-xs shrink-0"
              aria-hidden="true"
            >
              <CloudSun className="h-4 w-4 stroke-[2.2] text-white" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-foreground truncate">
              Weather Explorer
            </span>
          </div>

          <nav className="flex items-center gap-1.5 sm:gap-2 shrink-0" aria-label="Actions">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsJsonModalOpen(true)}
              disabled={!activeWeatherData}
              leftIcon={<Braces className="h-3.5 w-3.5 stroke-[2]" />}
              className="h-8 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer px-2 sm:px-3"
              aria-label="View raw JSON payload"
            >
              <span className="hidden xs:inline">JSON</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDrawerOpen(true)}
              leftIcon={<Database className="h-3.5 w-3.5 stroke-[2]" />}
              className="h-8 text-xs font-medium cursor-pointer px-2 sm:px-3"
              aria-label={`Open saved files drawer, ${displayFiles.length} files`}
            >
              <span>Saved</span>
              <span className="ml-1 tabular-nums px-1.5 py-px rounded-md bg-muted text-muted-foreground font-mono text-[10px] sm:text-[11px]">
                {displayFiles.length}
              </span>
            </Button>

            <div className="hidden md:flex items-center">
              <StatusBadge />
            </div>

            <div className="h-4 w-px bg-border hidden sm:block" aria-hidden="true" />

            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="flex-1 max-w-[1536px] xl:max-w-[1600px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6">
        
        {/* ── HERO: Shows City Name Prominently ── */}
        <motion.section
          className="glass-panel rounded-2xl p-4 sm:p-5 lg:p-6 shadow-xs"
          {...fadeUp}
          transition={{ duration: 0.2 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                <div className="flex items-center gap-1 font-semibold text-primary">
                  <MapPin className="h-3.5 w-3.5 stroke-[2.5] shrink-0" />
                  <span
                    className={`truncate text-foreground text-sm font-semibold ${!location.isResolved ? 'text-muted-foreground animate-pulse' : ''}`}
                    aria-label={`Location: ${location.fullName}`}
                  >
                    {location.fullName}
                  </span>
                </div>
                <span aria-hidden="true" className="text-muted-foreground/50">·</span>
                <div className="flex items-center gap-1 font-mono text-[10px] sm:text-[11px] text-muted-foreground">
                  <Calendar className="h-3 w-3 stroke-[2] shrink-0" />
                  <span>{formatDisplayDate(startDate)} – {formatDisplayDate(endDate)}</span>
                </div>
              </div>

              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight text-foreground">
                Historical Weather Analysis
              </h1>

              <p className="text-xs text-muted-foreground">
                {daysDiff} daily climate observations
              </p>
            </div>

            {activeWeatherData && (
              <div className="flex items-center gap-3 sm:gap-4 p-3 sm:px-4 sm:py-3 rounded-xl bg-muted/40 border border-border/60 shrink-0 self-start sm:self-auto">
                <div className="min-w-0">
                  <div className="text-[9px] sm:text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Condition</div>
                  <div className="text-xs sm:text-sm font-semibold text-foreground truncate">{currentCondition?.label ?? 'Clear'}</div>
                  <div className="text-[10px] sm:text-[11px] font-mono text-muted-foreground">{heroMinTemp}° – {heroMaxTemp}°C</div>
                </div>
                <div className="h-8 sm:h-9 w-px bg-border/60" aria-hidden="true" />
                <div className="text-right tabular-nums">
                  <div className="text-xl sm:text-2xl font-bold font-mono tracking-tighter text-foreground">{heroMaxTemp}°</div>
                  <div className="text-[9px] sm:text-[10px] text-muted-foreground">High</div>
                </div>
              </div>
            )}
          </div>
        </motion.section>

        {/* ── RESPONSIVE ADAPTIVE GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
          
          {/* 1. Summary Cards (Order 3 on mobile, Order 1 on desktop) */}
          <motion.section
            className="lg:col-span-12 order-3 lg:order-1 w-full"
            {...fadeUp}
            transition={{ duration: 0.2, delay: 0.05 }}
          >
            <WeatherSummaryCards
              weatherData={activeWeatherData}
              isLoading={isFetchingContent || isStoring}
            />
          </motion.section>

          {/* 2. Controls Column: Map & Date Controls (Order 1 on mobile, Order 2 on desktop) */}
          <motion.section
            className="lg:col-span-4 xl:col-span-3.5 order-1 lg:order-2 space-y-4 sm:space-y-6 flex flex-col md:grid md:grid-cols-2 lg:flex lg:flex-col md:gap-4 md:space-y-0 lg:space-y-6 w-full"
            {...fadeUp}
            transition={{ duration: 0.2, delay: 0.1 }}
          >
            <div className="w-full h-full">
              <LocationSelector
                latitude={latitude}
                longitude={longitude}
                onChange={handleLocationChange}
                onReset={handleResetLocation}
              />
            </div>

            <div className="w-full h-full">
              <IngestionControlCard
                latitude={latitude}
                longitude={longitude}
                startDate={startDate}
                endDate={endDate}
                isIngesting={isStoring}
                onDateChange={(start, end) => {
                  setStartDate(start)
                  setEndDate(end)
                  setSelectedFilename(null)
                }}
                onFetchAndStore={handleFetchAndStore}
                activeWeatherData={activeWeatherData}
                activeFilename={selectedFilename}
              />
            </div>
          </motion.section>

          {/* 3. Analytics Column: Chart & Insights (Order 4 on mobile, Order 3 on desktop) */}
          <motion.section
            className="lg:col-span-8 xl:col-span-8.5 order-4 lg:order-3 space-y-4 sm:space-y-6 flex flex-col w-full"
            {...fadeUp}
            transition={{ duration: 0.2, delay: 0.15 }}
          >
            <div className="w-full">
              <TemperatureChart
                weatherData={activeWeatherData}
                isLoading={isFetchingContent || isStoring}
              />
            </div>

            <div className="w-full">
              <WeatherInsightsCard
                weatherData={activeWeatherData}
                isLoading={isFetchingContent || isStoring}
              />
            </div>
          </motion.section>

          {/* 4. Table Section: Full width (Order 5 on mobile, Order 4 on desktop) */}
          <motion.section
            className="lg:col-span-12 order-5 lg:order-4 w-full"
            {...fadeUp}
            transition={{ duration: 0.2, delay: 0.2 }}
          >
            <WeatherDataTable
              weatherData={activeWeatherData}
              isLoading={isFetchingContent || isStoring}
            />
          </motion.section>

        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border/50 py-5 text-center text-[11px] text-muted-foreground font-sans">
        Weather Explorer · Historical climate analytics dashboard
      </footer>

      {/* ── OVERLAYS ── */}
      <StoredFilesDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        files={displayFiles}
        selectedFilename={selectedFilename}
        onSelectFile={handleSelectFile}
        onRefresh={handleRefreshFiles}
        isLoading={isFilesLoading}
      />

      <JsonModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        weatherData={activeWeatherData}
        filename={selectedFilename || undefined}
      />
    </div>
  )
}
