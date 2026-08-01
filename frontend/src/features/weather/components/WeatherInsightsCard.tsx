import {
  Sparkles,
  Sun,
  Snowflake,
  CloudRain,
  TrendingUp,
  Wind,
} from 'lucide-react'
import type { WeatherFileContent } from '@/types/weather'
import { formatTemperature, formatDisplayDate } from '@/utils/formatters'

interface WeatherInsightsCardProps {
  weatherData: WeatherFileContent | null
}

export function WeatherInsightsCard({ weatherData }: WeatherInsightsCardProps) {
  if (!weatherData || !weatherData.daily.time.length) {
    return null
  }

  const {
    time,
    temperature_2m_max,
    temperature_2m_min,
    precipitation_sum,
    wind_speed_10m_max,
  } = weatherData.daily

  // Warmest Day
  let maxTempIdx = 0
  for (let i = 1; i < temperature_2m_max.length; i++) {
    if (temperature_2m_max[i] > temperature_2m_max[maxTempIdx]) maxTempIdx = i
  }

  // Coldest Day
  let minTempIdx = 0
  for (let i = 1; i < temperature_2m_min.length; i++) {
    if (temperature_2m_min[i] < temperature_2m_min[minTempIdx]) minTempIdx = i
  }

  // Rainiest Day
  let rainiestIdx = 0
  let maxRain = 0
  if (precipitation_sum) {
    for (let i = 0; i < precipitation_sum.length; i++) {
      if (precipitation_sum[i] > maxRain) {
        maxRain = precipitation_sum[i]
        rainiestIdx = i
      }
    }
  }

  // Thermal Trend
  const half = Math.floor(temperature_2m_max.length / 2)
  const firstHalf = temperature_2m_max.slice(0, half).reduce((a, b) => a + b, 0) / (half || 1)
  const secondHalf = temperature_2m_max.slice(half).reduce((a, b) => a + b, 0) / (half || 1)
  const trend = secondHalf - firstHalf

  // Peak Wind
  let maxWindIdx = 0
  let maxWind = 0
  if (wind_speed_10m_max) {
    for (let i = 0; i < wind_speed_10m_max.length; i++) {
      if (wind_speed_10m_max[i] > maxWind) {
        maxWind = wind_speed_10m_max[i]
        maxWindIdx = i
      }
    }
  }

  const insights = [
    {
      icon: Sun,
      label: 'Warmest Day',
      value: formatTemperature(temperature_2m_max[maxTempIdx]),
      detail: formatDisplayDate(time[maxTempIdx]),
      color: 'text-orange-600 dark:text-orange-400',
    },
    {
      icon: Snowflake,
      label: 'Coldest Day',
      value: formatTemperature(temperature_2m_min[minTempIdx]),
      detail: formatDisplayDate(time[minTempIdx]),
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      icon: CloudRain,
      label: 'Most Rainfall',
      value: maxRain > 0 ? `${maxRain.toFixed(1)} mm` : 'None',
      detail: maxRain > 0 ? formatDisplayDate(time[rainiestIdx]) : 'Dry period',
      color: 'text-purple-600 dark:text-purple-400',
    },
    {
      icon: TrendingUp,
      label: 'Temp Trend',
      value: `${trend > 0 ? '+' : ''}${trend.toFixed(1)}°C`,
      detail: trend > 0.5 ? 'Warming' : trend < -0.5 ? 'Cooling' : 'Stable',
      color: 'text-emerald-600 dark:text-emerald-400',
    },
  ]

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-4 shadow-xs h-full font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary" aria-hidden="true">
            <Sparkles className="h-4 w-4 stroke-[2]" />
          </div>
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            Weather Insights
          </h3>
        </div>

        <span className="text-[11px] font-mono text-muted-foreground tabular-nums">
          {time.length} days
        </span>
      </div>

      {/* 4 Insight Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {insights.map((insight) => (
          <div
            key={insight.label}
            className="p-3 rounded-xl border border-border/50 bg-background/40 hover:bg-muted/30 transition-colors duration-150 flex flex-col justify-between gap-1"
          >
            <div className={`flex items-center gap-1.5 text-[11px] font-medium ${insight.color}`}>
              <insight.icon className="h-3.5 w-3.5 stroke-[2]" aria-hidden="true" />
              {insight.label}
            </div>
            <div className="text-base font-bold font-mono text-foreground tabular-nums">
              {insight.value}
            </div>
            <div className="text-[10px] text-muted-foreground font-mono truncate">
              {insight.detail}
            </div>
          </div>
        ))}
      </div>

      {/* Wind Footer */}
      <div className="flex items-center justify-between text-[11px] px-3 py-2 rounded-lg bg-muted/30 border border-border/40 text-muted-foreground font-mono">
        <span className="inline-flex items-center gap-1.5">
          <Wind className="h-3 w-3 text-teal-500 stroke-[2]" aria-hidden="true" />
          Peak wind: <strong className="text-foreground">{maxWind.toFixed(1)} km/h</strong> on {formatDisplayDate(time[maxWindIdx])}
        </span>
      </div>
    </div>
  )
}
