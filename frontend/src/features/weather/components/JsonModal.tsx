import { useState } from 'react'
import {
  X,
  Copy,
  Check,
  FileDown,
  Braces,
  Database,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatBytes } from '@/utils/formatters'
import type { WeatherFileContent } from '@/types/weather'
import toast from 'react-hot-toast'

interface JsonModalProps {
  isOpen: boolean
  onClose: () => void
  weatherData: WeatherFileContent | null
  filename?: string
}

export function JsonModal({
  isOpen,
  onClose,
  weatherData,
  filename,
}: JsonModalProps) {
  const [isCopied, setIsCopied] = useState(false)

  if (!isOpen || !weatherData) return null

  const resolvedFilename =
    filename ||
    `weather_${weatherData.latitude}_${weatherData.longitude}_${
      weatherData.daily.time[0]
    }_${weatherData.daily.time[weatherData.daily.time.length - 1]}.json`

  const jsonString = JSON.stringify(weatherData, null, 2)
  const byteSize = new Blob([jsonString]).size

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = resolvedFilename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success(`Exported ${resolvedFilename}`, { icon: '💾' })
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString)
      setIsCopied(true)
      toast.success('Copied JSON payload', { icon: '📋' })
      setTimeout(() => setIsCopied(false), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="glass-panel w-full max-w-3xl rounded-2xl shadow-2xl border border-border flex flex-col max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between p-3 sm:p-4 border-b border-border/80 bg-muted/40 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
              <Braces className="h-4 w-4 stroke-[2]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-semibold tracking-tight text-foreground truncate">
                Raw Weather JSON Payload
              </h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-mono truncate">
                {resolvedFilename}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-auto sm:ml-0">
            <Badge variant="secondary" className="text-[10px] sm:text-xs font-mono py-0.5 px-2">
              <Database className="h-3 w-3 mr-1" />
              {formatBytes(byteSize)}
            </Badge>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              leftIcon={
                isCopied ? (
                  <Check className="h-3 w-3 text-emerald-500 stroke-[2.5]" />
                ) : (
                  <Copy className="h-3 w-3 stroke-[2]" />
                )
              }
              className="h-8 text-xs font-medium px-2.5"
            >
              {isCopied ? 'Copied' : 'Copy'}
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={handleDownload}
              leftIcon={<FileDown className="h-3 w-3 stroke-[2]" />}
              className="h-8 text-xs font-medium px-2.5"
            >
              Export
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg cursor-pointer shrink-0"
              aria-label="Close JSON modal"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-auto p-3 sm:p-4 bg-muted/20 font-mono text-xs leading-relaxed text-foreground">
          <pre className="whitespace-pre">{jsonString}</pre>
        </div>
      </div>
    </div>
  )
}
