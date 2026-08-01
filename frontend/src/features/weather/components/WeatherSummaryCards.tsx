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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 w-full font-sans">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="glass-panel rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-6 w-6 rounded-md" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-7 w-20" />
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
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 w-full font-sans">
      {/* 1. Average High */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-2.5 shadow-xs">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-[11px] font-medium tracking-wide uppercase text-muted-foreground">
            Average High
          </span>
          <div className="p-1 rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400">
            <Thermometer className="h-3.5 w-3.5 stroke-[2]" />
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-foreground">
            {formatTemperature(avgMax)}
          </div>
          <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
            Peak: {peakMax}°C
          </p>
        </div>
      </div>

      {/* 2. Average Low */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-2.5 shadow-xs">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-[11px] font-medium tracking-wide uppercase text-muted-foreground">
            Average Low
          </span>
          <div className="p-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Thermometer className="h-3.5 w-3.5 stroke-[2]" />
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-foreground">
            {formatTemperature(avgMin)}
          </div>
          <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
            Lowest: {lowestMin}°C
          </p>
        </div>
      </div>

      {/* 3. Total Rainfall */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-2.5 shadow-xs">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-[11px] font-medium tracking-wide uppercase text-muted-foreground">
            Total Rainfall
          </span>
          <div className="p-1 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
            <Droplets className="h-3.5 w-3.5 stroke-[2]" />
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-foreground">
            {totalPrecipitation.toFixed(1)} <span className="text-xs font-normal">mm</span>
          </div>
          <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
            Cumulative
          </p>
        </div>
      </div>

      {/* 4. Rain Days */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-2.5 shadow-xs">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-[11px] font-medium tracking-wide uppercase text-muted-foreground">
            Rain Days
          </span>
          <div className="p-1 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <CloudRain className="h-3.5 w-3.5 stroke-[2]" />
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-foreground">
            {rainDays} <span className="text-xs font-normal">Days</span>
          </div>
          <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
            &gt;0.5 mm Rain
          </p>
        </div>
      </div>

      {/* 5. Wind Speed */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-2.5 shadow-xs">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-[11px] font-medium tracking-wide uppercase text-muted-foreground">
            Avg Wind Speed
          </span>
          <div className="p-1 rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400">
            <Wind className="h-3.5 w-3.5 stroke-[2]" />
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-foreground">
            {avgWindSpeed.toFixed(1)} <span className="text-xs font-normal">km/h</span>
          </div>
          <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
            Max: {peakWind.toFixed(1)} km/h
          </p>
        </div>
      </div>

      {/* 6. Observation Days */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-2.5 shadow-xs">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-[11px] font-medium tracking-wide uppercase text-muted-foreground">
            Observations
          </span>
          <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CalendarDays className="h-3.5 w-3.5 stroke-[2]" />
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-foreground">
            {time.length} <span className="text-xs font-normal">Records</span>
          </div>
          <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
            100% Complete
          </p>
        </div>
      </div>
    </div>
  )
}
