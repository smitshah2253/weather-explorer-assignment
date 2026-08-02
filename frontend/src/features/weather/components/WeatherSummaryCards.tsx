import {
  Thermometer,
  Droplets,
  Wind,
  CalendarDays,
  CloudRain,
} from 'lucide-react'
import { formatTemperature } from '@/utils/formatters'
import { Skeleton } from '@/components/ui/Skeleton'
import type { WeatherFileContent } from '@/types/weather'

interface WeatherSummaryCardsProps {
  weatherData: WeatherFileContent | null
  isLoading?: boolean
}

export function WeatherSummaryCards({ weatherData, isLoading = false }: WeatherSummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2.5 sm:gap-3.5 lg:gap-4 w-full font-sans">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="glass-panel rounded-2xl p-3.5 sm:p-4 lg:p-5 flex flex-col justify-between gap-3 shadow-xs min-h-[96px] sm:min-h-[110px]"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-6 w-6 rounded-md" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-6 sm:h-7 w-20" />
              <Skeleton className="h-3 w-14" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!weatherData || !weatherData.daily.time.length) {
    return null
  }

  const {
    temperature_2m_max,
    temperature_2m_min,
    precipitation_sum,
    wind_speed_10m_max,
    time,
  } = weatherData.daily

  const avgMax =
    temperature_2m_max.reduce((acc, v) => acc + v, 0) / temperature_2m_max.length
  const avgMin =
    temperature_2m_min.reduce((acc, v) => acc + v, 0) / temperature_2m_min.length
  const peakMax = Math.max(...temperature_2m_max)
  const lowestMin = Math.min(...temperature_2m_min)

  const totalPrecipitation = precipitation_sum
    ? precipitation_sum.reduce((acc, v) => acc + v, 0)
    : 0
  const rainDays = precipitation_sum
    ? precipitation_sum.filter((r) => r > 0.5).length
    : 0

  const avgWindSpeed = wind_speed_10m_max
    ? wind_speed_10m_max.reduce((acc: number, v: number) => acc + v, 0) /
      wind_speed_10m_max.length
    : 0
  const peakWind = wind_speed_10m_max ? Math.max(...wind_speed_10m_max) : 0

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2.5 sm:gap-3.5 lg:gap-4 w-full font-sans">
      {/* 1. Average High */}
      <div className="glass-panel rounded-2xl p-3.5 sm:p-4 lg:p-5 flex flex-col justify-between gap-2 shadow-xs min-h-[96px] sm:min-h-[110px]">
        <div className="flex items-center justify-between text-muted-foreground gap-1">
          <span className="text-[10px] sm:text-[11px] font-medium tracking-wide uppercase text-muted-foreground truncate">
            Average High
          </span>
          <div className="p-1 rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400 shrink-0">
            <Thermometer className="h-3.5 w-3.5 stroke-[2]" />
          </div>
        </div>
        <div>
          <div className="text-lg sm:text-xl lg:text-2xl font-bold font-mono tracking-tight text-foreground truncate">
            {formatTemperature(avgMax)}
          </div>
          <p className="text-[10px] sm:text-[11px] font-mono text-muted-foreground mt-0.5 truncate">
            Peak: {peakMax}°C
          </p>
        </div>
      </div>

      {/* 2. Average Low */}
      <div className="glass-panel rounded-2xl p-3.5 sm:p-4 lg:p-5 flex flex-col justify-between gap-2 shadow-xs min-h-[96px] sm:min-h-[110px]">
        <div className="flex items-center justify-between text-muted-foreground gap-1">
          <span className="text-[10px] sm:text-[11px] font-medium tracking-wide uppercase text-muted-foreground truncate">
            Average Low
          </span>
          <div className="p-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
            <Thermometer className="h-3.5 w-3.5 stroke-[2]" />
          </div>
        </div>
        <div>
          <div className="text-lg sm:text-xl lg:text-2xl font-bold font-mono tracking-tight text-foreground truncate">
            {formatTemperature(avgMin)}
          </div>
          <p className="text-[10px] sm:text-[11px] font-mono text-muted-foreground mt-0.5 truncate">
            Lowest: {lowestMin}°C
          </p>
        </div>
      </div>

      {/* 3. Total Rainfall */}
      <div className="glass-panel rounded-2xl p-3.5 sm:p-4 lg:p-5 flex flex-col justify-between gap-2 shadow-xs min-h-[96px] sm:min-h-[110px]">
        <div className="flex items-center justify-between text-muted-foreground gap-1">
          <span className="text-[10px] sm:text-[11px] font-medium tracking-wide uppercase text-muted-foreground truncate">
            Total Rainfall
          </span>
          <div className="p-1 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shrink-0">
            <Droplets className="h-3.5 w-3.5 stroke-[2]" />
          </div>
        </div>
        <div>
          <div className="text-lg sm:text-xl lg:text-2xl font-bold font-mono tracking-tight text-foreground truncate">
            {totalPrecipitation.toFixed(1)} <span className="text-[10px] sm:text-xs font-normal">mm</span>
          </div>
          <p className="text-[10px] sm:text-[11px] font-mono text-muted-foreground mt-0.5 truncate">
            Cumulative
          </p>
        </div>
      </div>

      {/* 4. Rain Days */}
      <div className="glass-panel rounded-2xl p-3.5 sm:p-4 lg:p-5 flex flex-col justify-between gap-2 shadow-xs min-h-[96px] sm:min-h-[110px]">
        <div className="flex items-center justify-between text-muted-foreground gap-1">
          <span className="text-[10px] sm:text-[11px] font-medium tracking-wide uppercase text-muted-foreground truncate">
            Rain Days
          </span>
          <div className="p-1 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
            <CloudRain className="h-3.5 w-3.5 stroke-[2]" />
          </div>
        </div>
        <div>
          <div className="text-lg sm:text-xl lg:text-2xl font-bold font-mono tracking-tight text-foreground truncate">
            {rainDays} <span className="text-[10px] sm:text-xs font-normal">Days</span>
          </div>
          <p className="text-[10px] sm:text-[11px] font-mono text-muted-foreground mt-0.5 truncate">
            &gt;0.5 mm Rain
          </p>
        </div>
      </div>

      {/* 5. Wind Speed */}
      <div className="glass-panel rounded-2xl p-3.5 sm:p-4 lg:p-5 flex flex-col justify-between gap-2 shadow-xs min-h-[96px] sm:min-h-[110px]">
        <div className="flex items-center justify-between text-muted-foreground gap-1">
          <span className="text-[10px] sm:text-[11px] font-medium tracking-wide uppercase text-muted-foreground truncate">
            Avg Wind Speed
          </span>
          <div className="p-1 rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400 shrink-0">
            <Wind className="h-3.5 w-3.5 stroke-[2]" />
          </div>
        </div>
        <div>
          <div className="text-lg sm:text-xl lg:text-2xl font-bold font-mono tracking-tight text-foreground truncate">
            {avgWindSpeed.toFixed(1)} <span className="text-[10px] sm:text-xs font-normal">km/h</span>
          </div>
          <p className="text-[10px] sm:text-[11px] font-mono text-muted-foreground mt-0.5 truncate">
            Max: {peakWind.toFixed(1)} km/h
          </p>
        </div>
      </div>

      {/* 6. Observation Days */}
      <div className="glass-panel rounded-2xl p-3.5 sm:p-4 lg:p-5 flex flex-col justify-between gap-2 shadow-xs min-h-[96px] sm:min-h-[110px]">
        <div className="flex items-center justify-between text-muted-foreground gap-1">
          <span className="text-[10px] sm:text-[11px] font-medium tracking-wide uppercase text-muted-foreground truncate">
            Observations
          </span>
          <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
            <CalendarDays className="h-3.5 w-3.5 stroke-[2]" />
          </div>
        </div>
        <div>
          <div className="text-lg sm:text-xl lg:text-2xl font-bold font-mono tracking-tight text-foreground truncate">
            {time.length} <span className="text-[10px] sm:text-xs font-normal">Records</span>
          </div>
          <p className="text-[10px] sm:text-[11px] font-mono text-muted-foreground mt-0.5 truncate">
            100% Complete
          </p>
        </div>
      </div>
    </div>
  )
}
