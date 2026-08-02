import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
} from '@/utils/formatters'
import { MAX_DATE_RANGE_DAYS, MIN_HISTORICAL_YEAR } from '@/constants/weather'
import { weatherFormSchema, type WeatherFormValues } from '../schemas/weatherSchema'
import type { WeatherFileContent } from '@/types/weather'
import toast from 'react-hot-toast'

const MIN_HISTORICAL_DATE = `${MIN_HISTORICAL_YEAR}-01-01`

interface IngestionControlCardProps {
  latitude: number
  longitude: number
  startDate: string
  endDate: string
  isIngesting?: boolean
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
  isIngesting = false,
  onDateChange,
  onFetchAndStore,
  activeWeatherData,
  activeFilename,
}: IngestionControlCardProps) {
  const [isCopied, setIsCopied] = useState(false)
  const today = formatDateISO(new Date())

  // Initialize React Hook Form with Zod schema as the single source of truth
  const {
    setValue,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<WeatherFormValues>({
    resolver: zodResolver(weatherFormSchema),
    defaultValues: {
      latitude,
      longitude,
      startDate,
      endDate,
    },
    mode: 'onChange',
  })

  // Synchronize form values when parent props change (map click, file select)
  useEffect(() => {
    setValue('latitude', latitude, { shouldValidate: true })
    setValue('longitude', longitude, { shouldValidate: true })
  }, [latitude, longitude, setValue])

  useEffect(() => {
    setValue('startDate', startDate, { shouldValidate: true })
    setValue('endDate', endDate, { shouldValidate: true })
  }, [startDate, endDate, setValue])

  const formStartDate = watch('startDate') || startDate
  const formEndDate = watch('endDate') || endDate
  const daysDiff = getDaysDifference(formStartDate, formEndDate)

  /**
   * Handle start date change:
   * - Allow ANY historical date (no lower bound clamping to endDate - 30 days)
   * - Only auto-adjust end date if resulting range exceeds MAX_DATE_RANGE_DAYS
   */
  const handleStartDateChange = useCallback((newStart: string) => {
    if (!newStart) return

    let adjustedEnd = formEndDate

    // If new start is after current end, push end forward
    if (newStart > formEndDate) {
      adjustedEnd = getMinDate(addDays(newStart, 14), today)
    }

    // If range exceeds max, clamp end date
    const diff = getDaysDifference(newStart, adjustedEnd)
    if (diff > MAX_DATE_RANGE_DAYS) {
      adjustedEnd = getMinDate(addDays(newStart, MAX_DATE_RANGE_DAYS - 1), today)
    }

    setValue('startDate', newStart, { shouldValidate: true })
    setValue('endDate', adjustedEnd, { shouldValidate: true })
    onDateChange(newStart, adjustedEnd)
  }, [formEndDate, today, setValue, onDateChange])

  /**
   * Handle end date change:
   * - Allow ANY historical end date
   * - Only auto-adjust start date if resulting range exceeds MAX_DATE_RANGE_DAYS
   */
  const handleEndDateChange = useCallback((newEnd: string) => {
    if (!newEnd) return

    let adjustedStart = formStartDate

    // If new end is before current start, push start backward
    if (newEnd < formStartDate) {
      adjustedStart = addDays(newEnd, -14)
      if (adjustedStart < MIN_HISTORICAL_DATE) {
        adjustedStart = MIN_HISTORICAL_DATE
      }
    }

    // If range exceeds max, clamp start date
    const diff = getDaysDifference(adjustedStart, newEnd)
    if (diff > MAX_DATE_RANGE_DAYS) {
      adjustedStart = addDays(newEnd, -(MAX_DATE_RANGE_DAYS - 1))
      if (adjustedStart < MIN_HISTORICAL_DATE) {
        adjustedStart = MIN_HISTORICAL_DATE
      }
    }

    setValue('startDate', adjustedStart, { shouldValidate: true })
    setValue('endDate', newEnd, { shouldValidate: true })
    onDateChange(adjustedStart, newEnd)
  }, [formStartDate, setValue, onDateChange])

  const handleQuickPreset = (presetType: '7d' | '14d' | '30d' | '1y') => {
    const end = new Date()
    end.setDate(end.getDate() - 2)

    if (presetType === '1y') {
      const yearAgoEnd = new Date(end)
      yearAgoEnd.setFullYear(yearAgoEnd.getFullYear() - 1)
      const yearAgoStart = new Date(yearAgoEnd)
      yearAgoStart.setDate(yearAgoStart.getDate() - 13)
      const s = formatDateISO(yearAgoStart)
      const e = formatDateISO(yearAgoEnd)
      setValue('startDate', s, { shouldValidate: true })
      setValue('endDate', e, { shouldValidate: true })
      onDateChange(s, e)
      return
    }

    const days = presetType === '7d' ? 7 : presetType === '14d' ? 14 : 30
    const start = new Date(end)
    start.setDate(end.getDate() - (days - 1))
    const s = formatDateISO(start)
    const e = formatDateISO(end)
    setValue('startDate', s, { shouldValidate: true })
    setValue('endDate', e, { shouldValidate: true })
    onDateChange(s, e)
  }

  const onFormSubmit = () => {
    onFetchAndStore()
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
      `weather_${latitude}_${longitude}_${formStartDate}_${formEndDate}.json`
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

  // Use Zod isValid as the single source of truth for form validity
  const canSubmit = isValid && daysDiff > 0

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className="glass-panel rounded-2xl p-3.5 sm:p-4 lg:p-5 flex flex-col justify-between gap-4 shadow-xs w-full h-full font-sans"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 shrink-0" aria-hidden="true">
            <CalendarDays className="h-4 w-4 stroke-[2]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-foreground truncate">
              Date Range
            </h3>
          </div>
        </div>

        <Badge
          variant={canSubmit ? 'secondary' : 'destructive'}
          className="text-[10px] sm:text-[11px] py-0.5 px-2 font-mono tabular-nums shrink-0"
        >
          {canSubmit ? `${daysDiff} of ${MAX_DATE_RANGE_DAYS} Days` : 'Invalid'}
        </Badge>
      </div>

      {/* Date Inputs — min/max prevent future dates but allow ANY historical date */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-2.5 sm:gap-3">
        <div>
          <Input
            label="Start Date"
            type="date"
            min={MIN_HISTORICAL_DATE}
            max={today}
            value={formStartDate}
            onChange={(e) => handleStartDateChange(e.target.value)}
            className="h-9 sm:h-8 text-xs font-mono bg-background/80"
            aria-label="Start date"
            aria-invalid={!!errors.startDate}
          />
          {errors.startDate && (
            <p className="text-[10px] text-destructive mt-1" role="alert">{errors.startDate.message}</p>
          )}
        </div>
        <div>
          <Input
            label="End Date"
            type="date"
            min={MIN_HISTORICAL_DATE}
            max={today}
            value={formEndDate}
            onChange={(e) => handleEndDateChange(e.target.value)}
            className="h-9 sm:h-8 text-xs font-mono bg-background/80"
            aria-label="End date"
            aria-invalid={!!errors.endDate}
          />
          {errors.endDate && (
            <p className="text-[10px] text-destructive mt-1" role="alert">{errors.endDate.message}</p>
          )}
        </div>
      </div>

      {/* Quick Presets */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5 -mx-1 px-1" role="toolbar" aria-label="Date range presets">
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
            className="text-[11px] px-2.5 py-1.5 sm:px-2 sm:py-1 rounded-md bg-background hover:bg-muted text-foreground/70 border border-border/60 font-medium cursor-pointer transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-ring min-h-[32px] sm:min-h-[26px] flex items-center"
            aria-label={`Set date range to ${label}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="space-y-2.5 pt-3 border-t border-border/60">
        <Button
          type="submit"
          className="w-full h-11 sm:h-9.5 text-xs sm:text-xs font-semibold shadow-xs"
          disabled={!canSubmit || isIngesting}
          leftIcon={
            isIngesting ? (
              <Loader2 className="h-4 w-4 sm:h-3.5 sm:w-3.5 animate-spin" />
            ) : (
              <Database className="h-4 w-4 sm:h-3.5 sm:w-3.5 stroke-[2]" />
            )
          }
          aria-label={isIngesting ? 'Saving data...' : 'Fetch and store weather data'}
        >
          {isIngesting ? 'Fetching & Saving...' : 'Fetch & Store Data'}
        </Button>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportDataset}
            disabled={!activeWeatherData}
            leftIcon={<FileDown className="h-3.5 w-3.5 sm:h-3 sm:w-3 stroke-[2]" />}
            className="flex-1 h-9 sm:h-8 text-[11px] sm:text-xs font-medium"
            aria-label="Export dataset as JSON file"
          >
            Export JSON
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyResponse}
            disabled={!activeWeatherData}
            leftIcon={
              isCopied ? (
                <Check className="h-3.5 w-3.5 sm:h-3 sm:w-3 stroke-[2.5] text-emerald-500" />
              ) : (
                <Copy className="h-3.5 w-3.5 sm:h-3 sm:w-3 stroke-[2]" />
              )
            }
            className="flex-1 h-9 sm:h-8 text-[11px] sm:text-xs font-medium"
            aria-label={isCopied ? 'Copied to clipboard' : 'Copy JSON to clipboard'}
          >
            {isCopied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </div>
    </form>
  )
}
