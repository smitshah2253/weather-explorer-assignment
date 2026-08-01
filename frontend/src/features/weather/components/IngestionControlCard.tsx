import { useState } from 'react'
import {
  CalendarDays,
  Loader2,
  FileDown,
  Copy,
  Check,
  Database,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import {
  getDaysDifference,
  formatDateISO,
  addDays,
  getMinDate,
  getMaxDate,
} from '@/utils/formatters'
import { MAX_DATE_RANGE_DAYS, MIN_HISTORICAL_YEAR } from '@/constants/weather'
import type { WeatherFileContent } from '@/types/weather'
import toast from 'react-hot-toast'

interface IngestionControlCardProps {
  latitude: number
  longitude: number
  startDate: string
  endDate: string
  onDateChange: (start: string, end: string) => void
  onFetchAndStore: () => void
  activeWeatherData: WeatherFileContent | null
  activeFilename: string | null
}

export function IngestionControlCard({
  latitude,
  longitude,
  startDate,
  endDate,
  onDateChange,
  onFetchAndStore,
  activeWeatherData,
  activeFilename,
}: IngestionControlCardProps) {
  const [isIngesting, setIsIngesting] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const today = formatDateISO(new Date())

  // Max allowable end date from current start date (strictly <= 31 days range)
  const maxAllowedEndDate = startDate
    ? getMinDate(addDays(startDate, MAX_DATE_RANGE_DAYS - 1), today)
    : today

  // Min allowable start date from current end date
  const minAllowedStartDate = endDate
    ? getMaxDate(`${MIN_HISTORICAL_YEAR}-01-01`, addDays(endDate, -(MAX_DATE_RANGE_DAYS - 1)))
    : `${MIN_HISTORICAL_YEAR}-01-01`

  const daysDiff = getDaysDifference(startDate, endDate)
  const isEndBeforeStart = startDate && endDate && new Date(endDate) < new Date(startDate)
  const isEndInFuture = endDate && endDate > today
  const isRangeTooLong = daysDiff > MAX_DATE_RANGE_DAYS
  const isDateValid =
    !!startDate &&
    !!endDate &&
    !isEndBeforeStart &&
    !isEndInFuture &&
    !isRangeTooLong &&
    daysDiff > 0

  const handleStartDateChange = (newStart: string) => {
    if (!newStart) {
      onDateChange(newStart, endDate)
      return
    }

    let adjustedEnd = endDate
    // If new start date is after current end date, push end date forward
    if (newStart > endDate) {
      adjustedEnd = getMinDate(addDays(newStart, 14), today)
    }
    // If range exceeds 31 days, clamp end date
    const diff = getDaysDifference(newStart, adjustedEnd)
    if (diff > MAX_DATE_RANGE_DAYS) {
      adjustedEnd = getMinDate(addDays(newStart, MAX_DATE_RANGE_DAYS - 1), today)
    }

    onDateChange(newStart, adjustedEnd)
  }

  const handleEndDateChange = (newEnd: string) => {
    if (!newEnd) {
      onDateChange(startDate, newEnd)
      return
    }

    let adjustedStart = startDate
    // If new end date is before current start date, push start date backward
    if (newEnd < startDate) {
      adjustedStart = getMaxDate(`${MIN_HISTORICAL_YEAR}-01-01`, addDays(newEnd, -14))
    }
    // If range exceeds 31 days, clamp start date
    const diff = getDaysDifference(adjustedStart, newEnd)
    if (diff > MAX_DATE_RANGE_DAYS) {
      adjustedStart = getMaxDate(
        `${MIN_HISTORICAL_YEAR}-01-01`,
        addDays(newEnd, -(MAX_DATE_RANGE_DAYS - 1))
      )
    }

    onDateChange(adjustedStart, newEnd)
  }

  const handleQuickPreset = (presetType: '7d' | '14d' | '30d' | '1y') => {
    const end = new Date()
    end.setDate(end.getDate() - 2)

    if (presetType === '1y') {
      const yearAgoEnd = new Date(end)
      yearAgoEnd.setFullYear(yearAgoEnd.getFullYear() - 1)
      const yearAgoStart = new Date(yearAgoEnd)
      yearAgoStart.setDate(yearAgoStart.getDate() - 13)
      onDateChange(formatDateISO(yearAgoStart), formatDateISO(yearAgoEnd))
      return
    }

    const days = presetType === '7d' ? 7 : presetType === '14d' ? 14 : 30
    const start = new Date(end)
    start.setDate(end.getDate() - (days - 1))
    onDateChange(formatDateISO(start), formatDateISO(end))
  }

  const handleExecuteFetch = () => {
    if (!isDateValid) return
    setIsIngesting(true)
    setTimeout(() => {
      setIsIngesting(false)
      onFetchAndStore()
    }, 600)
  }

  const handleExportDataset = () => {
    if (!activeWeatherData) return
    const jsonStr = JSON.stringify(activeWeatherData, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download =
      activeFilename ||
      `weather_${latitude}_${longitude}_${startDate}_${endDate}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Exported dataset')
  }

  const handleCopyResponse = async () => {
    if (!activeWeatherData) return
    try {
      await navigator.clipboard.writeText(JSON.stringify(activeWeatherData, null, 2))
      setIsCopied(true)
      toast.success('Copied to clipboard')
      setTimeout(() => setIsCopied(false), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-4 shadow-xs h-full font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400" aria-hidden="true">
            <CalendarDays className="h-4 w-4 stroke-[2]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-foreground">
              Date Range
            </h3>
          </div>
        </div>

        <Badge
          variant={isDateValid ? 'secondary' : 'destructive'}
          className="text-[11px] py-0.5 px-2 font-mono tabular-nums"
        >
          {isDateValid ? `${daysDiff} of ${MAX_DATE_RANGE_DAYS} Days` : 'Invalid'}
        </Badge>
      </div>

      {/* Date Inputs with strict selection clamping */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Start Date"
          type="date"
          min={minAllowedStartDate}
          max={getMinDate(endDate, today)}
          value={startDate}
          onChange={(e) => handleStartDateChange(e.target.value)}
          className="h-8 text-xs font-mono bg-background/80"
          aria-label="Start date"
        />
        <Input
          label="End Date"
          type="date"
          min={startDate || `${MIN_HISTORICAL_YEAR}-01-01`}
          max={maxAllowedEndDate}
          value={endDate}
          onChange={(e) => handleEndDateChange(e.target.value)}
          className="h-8 text-xs font-mono bg-background/80"
          aria-label="End date"
        />
      </div>

      {/* Quick Presets */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none" role="toolbar" aria-label="Date range presets">
        <span className="text-[11px] text-muted-foreground font-medium shrink-0 mr-0.5">Presets:</span>
        {[
          { label: '7d', type: '7d' as const },
          { label: '14d', type: '14d' as const },
          { label: '30d', type: '30d' as const },
          { label: '1 Year Ago', type: '1y' as const },
        ].map(({ label, type }) => (
          <button
            key={label}
            type="button"
            onClick={() => handleQuickPreset(type)}
            className="text-[11px] px-2 py-1 rounded-md bg-background hover:bg-muted text-foreground/70 border border-border/60 font-medium cursor-pointer transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label={`Set date range to ${label}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="space-y-2 pt-3 border-t border-border/60">
        <Button
          className="w-full h-9 text-xs font-semibold shadow-xs"
          disabled={!isDateValid || isIngesting}
          onClick={handleExecuteFetch}
          leftIcon={
            isIngesting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Database className="h-3.5 w-3.5 stroke-[2]" />
            )
          }
          aria-label={isIngesting ? 'Saving data...' : 'Fetch and store weather data'}
        >
          {isIngesting ? 'Saving...' : 'Fetch & Store Data'}
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportDataset}
            disabled={!activeWeatherData}
            leftIcon={<FileDown className="h-3 w-3 stroke-[2]" />}
            className="flex-1 h-7.5 text-[11px] font-medium"
            aria-label="Export dataset as JSON file"
          >
            Export JSON
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyResponse}
            disabled={!activeWeatherData}
            leftIcon={
              isCopied ? (
                <Check className="h-3 w-3 stroke-[2.5] text-emerald-500" />
              ) : (
                <Copy className="h-3 w-3 stroke-[2]" />
              )
            }
            className="flex-1 h-7.5 text-[11px] font-medium"
            aria-label={isCopied ? 'Copied to clipboard' : 'Copy JSON to clipboard'}
          >
            {isCopied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </div>
    </div>
  )
}
