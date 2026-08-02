import { useState } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import {
  TrendingUp,
  FileDown,
  Droplets,
  Check,
  LineChart,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDisplayDate, formatTemperature } from '@/utils/formatters'
import type { WeatherFileContent } from '@/types/weather'
import toast from 'react-hot-toast'

interface TemperatureChartProps {
  weatherData: WeatherFileContent | null
  isLoading?: boolean
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    color: string
    dataKey: string
  }>
  label?: string
}

function ChartTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length && label) {
    return (
      <div className="bg-popover/95 backdrop-blur-md p-3 rounded-xl border border-border shadow-xl text-xs min-w-[170px] font-sans">
        <div className="font-semibold text-foreground font-mono pb-1.5 mb-1.5 border-b border-border/60 text-[11px]">
          {formatDisplayDate(label)}
        </div>
        <div className="space-y-1 font-mono text-[11px]">
          {payload.map((item) => (
            <div key={item.dataKey} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-muted-foreground">{item.name}</span>
              </span>
              <span className="font-semibold text-foreground tabular-nums">
                {item.dataKey.includes('precipitation')
                  ? `${item.value.toFixed(1)} mm`
                  : formatTemperature(item.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
}

export function TemperatureChart({
  weatherData,
  isLoading = false,
}: TemperatureChartProps) {
  const [viewMode, setViewMode] = useState<'both' | 'max' | 'min'>('both')
  const [showPrecipitation, setShowPrecipitation] = useState(true)

  if (isLoading) {
    return (
      <div className="glass-panel rounded-2xl p-4 sm:p-6 shadow-xs h-[320px] sm:h-[380px] lg:h-[460px] xl:h-[480px] w-full flex flex-col justify-between font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1.5">
            <Skeleton className="h-5 sm:h-6 w-48 sm:w-56" />
            <Skeleton className="h-4 w-36 sm:w-44" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-24 sm:w-28 rounded-lg" />
            <Skeleton className="h-7 w-14 sm:w-16 rounded-lg" />
          </div>
        </div>
        <div className="flex-1 w-full pt-4 sm:pt-6 flex flex-col justify-end gap-3">
          <Skeleton className="h-[200px] sm:h-[260px] lg:h-[280px] w-full rounded-xl" />
          <div className="flex justify-between px-2">
            <Skeleton className="h-3 w-10 sm:w-12" />
            <Skeleton className="h-3 w-10 sm:w-12" />
            <Skeleton className="h-3 w-10 sm:w-12" />
            <Skeleton className="h-3 w-10 sm:w-12" />
          </div>
        </div>
      </div>
    )
  }

  if (!weatherData || !weatherData.daily.time.length) {
    return (
      <div className="glass-panel rounded-2xl p-6 sm:p-8 lg:p-10 shadow-xs min-h-[360px] sm:min-h-[420px] lg:min-h-[460px] w-full flex flex-col items-center justify-center text-center font-sans">
        {/* Animated Visual Icon */}
        <div className="relative mb-4 sm:mb-5">
          <div className="absolute -inset-1.5 bg-gradient-to-r from-primary/30 to-blue-500/30 rounded-2xl blur-md opacity-70 animate-pulse" />
          <div className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/20 flex items-center justify-center shadow-inner">
            <LineChart className="h-7 w-7 sm:h-8 sm:w-8 text-primary stroke-[1.8]" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold text-foreground mb-2 tracking-tight">
          Ready to Explore Climate Data
        </h3>

        {/* Detailed Explanation */}
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mb-6 leading-relaxed">
          Select coordinates on the map or choose a city, set your date range, and click{' '}
          <strong className="text-primary font-semibold">Fetch &amp; Store Weather Data</strong> to retrieve live historical records and generate interactive analytics.
        </p>

        {/* 3 Step Workflow Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 w-full max-w-lg mb-5 text-left">
          <div className="p-3 rounded-xl bg-muted/30 border border-border/60 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">1</span>
              Set Location
            </div>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Click the map or search any city worldwide.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-muted/30 border border-border/60 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">2</span>
              Fetch &amp; Store
            </div>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Fetch Open-Meteo data into GCS archive.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-muted/30 border border-border/60 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">3</span>
              Visualize
            </div>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Explore charts, AI insights &amp; data tables.
            </p>
          </div>
        </div>

        {/* Pro Tip */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-muted/50 border border-border/70 text-[11px] text-muted-foreground max-w-md">
          <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          <span>Tip: You can also open <strong className="text-foreground font-medium">Archive Storage</strong> (top-right) to browse and load previously saved datasets.</span>
        </div>
      </div>
    )
  }

  const { time, temperature_2m_max, temperature_2m_min, precipitation_sum } =
    weatherData.daily

  const chartData = time.map((date, idx) => ({
    date,
    maxTemp: temperature_2m_max[idx],
    minTemp: temperature_2m_min[idx],
    precipitation: precipitation_sum?.[idx] ?? 0,
  }))

  const handleExportCSV = () => {
    const headers = 'Date,Max Temperature (°C),Min Temperature (°C),Precipitation (mm)\n'
    const rows = chartData
      .map((r) => `${r.date},${r.maxTemp},${r.minTemp},${r.precipitation}`)
      .join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `weather_${weatherData.latitude}_${weatherData.longitude}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Exported CSV')
  }

  const viewModes = [
    { key: 'both' as const, label: 'All' },
    { key: 'max' as const, label: 'Highs' },
    { key: 'min' as const, label: 'Lows' },
  ]

  return (
    <div className="glass-panel rounded-2xl p-3.5 sm:p-5 lg:p-6 flex flex-col justify-between shadow-xs h-[320px] sm:h-[380px] lg:h-[460px] xl:h-[480px] w-full font-sans">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-border/60">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 shrink-0" aria-hidden="true">
            <TrendingUp className="h-4 w-4 stroke-[2]" />
          </div>
          <h3 className="text-sm font-semibold tracking-tight text-foreground truncate">
            Temperature & Rain
          </h3>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
          {/* Series Switcher */}
          <div className="flex items-center rounded-lg border border-border/60 bg-muted/30 p-0.5" role="radiogroup" aria-label="Select data series">
            {viewModes.map((mode) => (
              <button
                key={mode.key}
                type="button"
                role="radio"
                aria-checked={viewMode === mode.key}
                onClick={() => setViewMode(mode.key)}
                className={`px-2 py-1 rounded-md text-[11px] font-medium cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-ring min-h-[28px] sm:min-h-[24px] flex items-center ${
                  viewMode === mode.key
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowPrecipitation(!showPrecipitation)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring min-h-[28px] sm:min-h-[24px] ${
              showPrecipitation
                ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/25'
                : 'bg-background hover:bg-muted text-muted-foreground border-border/60'
            }`}
            aria-pressed={showPrecipitation}
            aria-label="Toggle rainfall overlay"
          >
            {showPrecipitation ? (
              <Check className="h-3 w-3 stroke-[2.5]" />
            ) : (
              <Droplets className="h-3 w-3 stroke-[2]" />
            )}
            Rain
          </button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleExportCSV}
            leftIcon={<FileDown className="h-3 w-3 stroke-[2]" />}
            className="h-7.5 sm:h-7 text-[11px] font-medium text-muted-foreground hover:text-foreground px-2"
            aria-label="Export chart data as CSV"
          >
            CSV
          </Button>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 w-full min-h-0 pt-3" role="img" aria-label="Temperature and precipitation chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 8, right: showPrecipitation ? -12 : 8, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="gMax" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ea580c" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ea580c" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="gMin" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="gRain" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-border/30"
              vertical={false}
            />

            <XAxis
              dataKey="date"
              minTickGap={22}
              tickFormatter={(val) => {
                if (!val) return ''
                const p = val.split('-')
                return `${p[1]}/${p[2]}`
              }}
              className="text-[10px] fill-muted-foreground font-mono"
              tickLine={false}
              axisLine={false}
            />

            {/* Left Y-Axis: Temperature (°C) */}
            <YAxis
              yAxisId="temp"
              unit="°"
              domain={[(dataMin: number) => Math.floor(dataMin - 2), (dataMax: number) => Math.ceil(dataMax + 2)]}
              className="text-[10px] fill-muted-foreground font-mono"
              tickLine={false}
              axisLine={false}
            />

            {/* Right Y-Axis: Precipitation (mm) */}
            {showPrecipitation && (
              <YAxis
                yAxisId="rain"
                orientation="right"
                unit="mm"
                domain={[0, (dataMax: number) => Math.max(10, Math.ceil(dataMax * 1.5))]}
                className="text-[10px] fill-muted-foreground font-mono"
                tickLine={false}
                axisLine={false}
              />
            )}

            <Tooltip content={<ChartTooltip />} />

            {(viewMode === 'both' || viewMode === 'max') && (
              <Area
                yAxisId="temp"
                type="monotone"
                dataKey="maxTemp"
                name="Max Temp"
                stroke="#ea580c"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#gMax)"
                dot={{ r: 2.5, fill: '#ea580c' }}
                activeDot={{ r: 4.5, strokeWidth: 2, stroke: '#fff' }}
              />
            )}

            {(viewMode === 'both' || viewMode === 'min') && (
              <Area
                yAxisId="temp"
                type="monotone"
                dataKey="minTemp"
                name="Min Temp"
                stroke="#0284c7"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#gMin)"
                dot={{ r: 2.5, fill: '#0284c7' }}
                activeDot={{ r: 4.5, strokeWidth: 2, stroke: '#fff' }}
              />
            )}

            {showPrecipitation && (
              <Area
                yAxisId="rain"
                type="monotone"
                dataKey="precipitation"
                name="Rain"
                stroke="#06b6d4"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                fillOpacity={1}
                fill="url(#gRain)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
