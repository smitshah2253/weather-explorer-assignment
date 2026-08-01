import { useState, useMemo, useEffect } from 'react'
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
  INITIAL_STORED_FILES,
  generateMockWeatherData,
  parseWeatherFilename,
  getWeatherConditionText,
} from '../data/mockData'
import { DEFAULT_COORDINATES, MAX_DATE_RANGE_DAYS } from '@/constants/weather'
import { getDaysDifference, formatDateISO, formatDisplayDate } from '@/utils/formatters'
import { getNearestCity, resolveCityName, getCityFromFilename } from '@/utils/geocoding'
import type { WeatherFileMetadata } from '@/types/weather'
import toast from 'react-hot-toast'

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
}

export default function ExplorePage() {
  const [latitude, setLatitude] = useState<number>(DEFAULT_COORDINATES.latitude)
  const [longitude, setLongitude] = useState<number>(DEFAULT_COORDINATES.longitude)
  const [cityName, setCityName] = useState<string>(() =>
    getNearestCity(DEFAULT_COORDINATES.latitude, DEFAULT_COORDINATES.longitude)
  )

  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date()
    d.setDate(d.getDate() - 15)
    return formatDateISO(d)
  })
  const [endDate, setEndDate] = useState<string>(() => {
    const d = new Date()
    d.setDate(d.getDate() - 2)
    return formatDateISO(d)
  })

  const [files, setFiles] = useState<WeatherFileMetadata[]>(INITIAL_STORED_FILES)
  const [selectedFilename, setSelectedFilename] = useState<string | null>(
    INITIAL_STORED_FILES[0]?.name ?? null
  )
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false)

  // Resolve city name on coordinate change
  useEffect(() => {
    let isMounted = true
    // Immediate fast offline resolution
    setCityName(getNearestCity(latitude, longitude))

    // Asynchronous fine-grained lookup with caching
    resolveCityName(latitude, longitude).then((resolved) => {
      if (isMounted && resolved) {
        setCityName(resolved)
      }
    })

    return () => {
      isMounted = false
    }
  }, [latitude, longitude])

  // Strict date validation
  const daysDiff = getDaysDifference(startDate, endDate)
  const isEndBeforeStart = new Date(endDate) < new Date(startDate)
  const isRangeTooLong = daysDiff > MAX_DATE_RANGE_DAYS
  const isDateValid = !isEndBeforeStart && !isRangeTooLong && daysDiff > 0

  const activeWeatherData = useMemo(() => {
    if (!isDateValid) return null
    return generateMockWeatherData(latitude, longitude, startDate, endDate)
  }, [latitude, longitude, startDate, endDate, isDateValid])

  const handleLocationChange = (lat: number, lon: number) => {
    setLatitude(lat)
    setLongitude(lon)
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
    const filename = `weather_${latitude}_${longitude}_${startDate}_${endDate}.json`
    const newFile: WeatherFileMetadata = {
      name: filename,
      size: 2450 + Math.floor(Math.random() * 200),
      created_at: new Date().toISOString(),
    }

    setFiles((prev) => [newFile, ...prev.filter((f) => f.name !== filename)])
    setSelectedFilename(filename)
    toast.success(`Saved ${cityName} dataset to archive`)
  }

  const handleRefreshFiles = () => {}

  const currentCondition = activeWeatherData
    ? getWeatherConditionText(activeWeatherData.daily.weather_code?.[0] ?? 1)
    : null

  const heroMaxTemp = activeWeatherData?.daily.temperature_2m_max[0] ?? 0
  const heroMinTemp = activeWeatherData?.daily.temperature_2m_min[0] ?? 0

  return (
    <div className="min-h-screen w-full flex flex-col font-sans">
      {/* ── NAV ── */}
      <header className="sticky top-0 z-30 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs"
              aria-hidden="true"
            >
              <CloudSun className="h-4 w-4 stroke-[2.2]" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-foreground">
              Weather Explorer
            </span>
          </div>

          <nav className="flex items-center gap-2" aria-label="Actions">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsJsonModalOpen(true)}
              disabled={!activeWeatherData}
              leftIcon={<Braces className="h-3.5 w-3.5 stroke-[2]" />}
              className="h-8 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label="View raw JSON payload"
            >
              JSON
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDrawerOpen(true)}
              leftIcon={<Database className="h-3.5 w-3.5 stroke-[2]" />}
              className="h-8 text-xs font-medium cursor-pointer"
              aria-label={`Open saved files drawer, ${files.length} files`}
            >
              Saved
              <span className="ml-1 tabular-nums px-1.5 py-px rounded-md bg-muted text-muted-foreground font-mono text-[11px]">
                {files.length}
              </span>
            </Button>

            <div className="hidden sm:flex items-center">
              <StatusBadge />
            </div>

            <div className="h-4 w-px bg-border hidden sm:block" aria-hidden="true" />

            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* ── HERO: Shows City Name Prominently, Zero Coordinate Clutter ── */}
        <motion.section
          className="glass-panel rounded-2xl px-6 py-5 shadow-xs"
          {...fadeUp}
          transition={{ duration: 0.2 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                <div className="flex items-center gap-1 font-semibold text-primary">
                  <MapPin className="h-3.5 w-3.5 stroke-[2.5] shrink-0" />
                  <span className="truncate text-foreground text-sm font-semibold">{cityName}</span>
                </div>
                <span aria-hidden="true" className="text-muted-foreground/50">·</span>
                <div className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
                  <Calendar className="h-3 w-3 stroke-[2] shrink-0" />
                  <span>{formatDisplayDate(startDate)} – {formatDisplayDate(endDate)}</span>
                </div>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Historical Weather Analysis
              </h1>

              <p className="text-xs text-muted-foreground">
                {daysDiff} daily climate observations
              </p>
            </div>

            {activeWeatherData && (
              <div className="flex items-center gap-4 px-4 py-3 rounded-xl bg-muted/40 border border-border/60 shrink-0">
                <div className="min-w-0">
                  <div className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Condition</div>
                  <div className="text-sm font-semibold text-foreground truncate">{currentCondition?.label ?? 'Clear'}</div>
                  <div className="text-[11px] font-mono text-muted-foreground">{heroMinTemp}° – {heroMaxTemp}°C</div>
                </div>
                <div className="h-9 w-px bg-border/60" aria-hidden="true" />
                <div className="text-right tabular-nums">
                  <div className="text-2xl font-bold font-mono tracking-tighter text-foreground">{heroMaxTemp}°</div>
                  <div className="text-[10px] text-muted-foreground">High</div>
                </div>
              </div>
            )}
          </div>
        </motion.section>

        {/* ── SUMMARY METRICS ── */}
        <motion.section {...fadeUp} transition={{ duration: 0.2, delay: 0.05 }}>
          <WeatherSummaryCards weatherData={activeWeatherData} />
        </motion.section>

        {/* ── MAP (3) + CHART (9) ── */}
        <motion.section
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
          {...fadeUp}
          transition={{ duration: 0.2, delay: 0.1 }}
        >
          <div className="lg:col-span-3 h-full">
            <LocationSelector
              latitude={latitude}
              longitude={longitude}
              onChange={handleLocationChange}
              onReset={handleResetLocation}
            />
          </div>

          <div className="lg:col-span-9 h-full">
            <TemperatureChart weatherData={activeWeatherData} />
          </div>
        </motion.section>

        {/* ── FILTERS (3) + INSIGHTS (9) ── */}
        <motion.section
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
          {...fadeUp}
          transition={{ duration: 0.2, delay: 0.15 }}
        >
          <div className="lg:col-span-3 h-full">
            <IngestionControlCard
              latitude={latitude}
              longitude={longitude}
              startDate={startDate}
              endDate={endDate}
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

          <div className="lg:col-span-9 h-full">
            <WeatherInsightsCard weatherData={activeWeatherData} />
          </div>
        </motion.section>

        {/* ── TABLE ── */}
        <motion.section
          className="w-full"
          {...fadeUp}
          transition={{ duration: 0.2, delay: 0.2 }}
        >
          <WeatherDataTable weatherData={activeWeatherData} />
        </motion.section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border/50 py-5 text-center text-[11px] text-muted-foreground font-sans">
        Weather Explorer · Historical climate analytics dashboard
      </footer>

      {/* ── OVERLAYS ── */}
      <StoredFilesDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        files={files}
        selectedFilename={selectedFilename}
        onSelectFile={handleSelectFile}
        onRefresh={handleRefreshFiles}
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
