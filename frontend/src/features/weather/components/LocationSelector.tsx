import { useState, useEffect, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { RotateCcw, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PRESET_LOCATIONS, type PresetLocation } from '@/constants/weather'
import {
  type CoordinateType,
  COORDINATE_LIMITS,
  isValidCoordinateInput,
  simulateInputValue,
  clampCoordinate,
  normalizeLatitude,
  normalizeLongitude,
  normalizeCoordinates,
} from '@/utils/coordinateValidation'
import toast from 'react-hot-toast'

const customMarkerIcon = L.divIcon({
  className: 'custom-leaflet-marker',
  html: `
    <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-full pointer-events-none">
      <div class="absolute -inset-1 rounded-full bg-blue-500/25 animate-ping"></div>
      <div class="relative h-6 w-6 rounded-full bg-blue-600 text-white shadow-md flex items-center justify-center border-2 border-white dark:border-slate-900">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 24],
})

interface LocationSelectorProps {
  latitude: number
  longitude: number
  onChange: (lat: number, lon: number) => void
  onReset: () => void
}

function MapClickHandler({ onChange }: { onChange: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) {
      // Leaflet's wrap() converts repeated world tile longitudes (e.g. 293.6° -> -66.4°) into standard [-180, 180]
      const wrapped = e.latlng.wrap()
      const [lat, lon] = normalizeCoordinates(wrapped.lat, wrapped.lng)
      onChange(lat, lon)
    },
  })
  return null
}

function MapCenterController({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap()
  useEffect(() => {
    const normLat = normalizeLatitude(lat)
    const normLon = normalizeLongitude(lon)
    map.flyTo([normLat, normLon], map.getZoom(), { duration: 0.6 })
    map.invalidateSize()
  }, [lat, lon, map])
  return null
}

function MapInvalidator() {
  const map = useMap()
  useEffect(() => {
    map.invalidateSize()
    const t1 = setTimeout(() => map.invalidateSize(), 100)
    const t2 = setTimeout(() => map.invalidateSize(), 400)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [map])
  return null
}

export function LocationSelector({
  latitude,
  longitude,
  onChange,
  onReset,
}: LocationSelectorProps) {
  // Local string state to manage natural user typing without cursor jumping or NaN glitch
  const [latInput, setLatInput] = useState<string>(latitude.toString())
  const [lonInput, setLonInput] = useState<string>(longitude.toString())

  // Synchronize local input state whenever parent coordinates change (e.g. map click or preset)
  useEffect(() => {
    setLatInput((prev) => (parseFloat(prev) !== latitude ? latitude.toString() : prev))
  }, [latitude])

  useEffect(() => {
    setLonInput((prev) => (parseFloat(prev) !== longitude ? longitude.toString() : prev))
  }, [longitude])

  /**
   * Block invalid keypresses before they modify the input value
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, type: CoordinateType) => {
      // Allow control/navigation keys and shortcut combos
      if (
        [
          'Backspace',
          'Delete',
          'ArrowLeft',
          'ArrowRight',
          'ArrowUp',
          'ArrowDown',
          'Tab',
          'Home',
          'End',
          'Enter',
          'Escape',
        ].includes(e.key) ||
        e.ctrlKey ||
        e.metaKey ||
        e.altKey
      ) {
        return
      }

      // Block any non-numeric/non-symbol character (like letters, '+', 'e', 'E', spaces)
      if (!/^[\d.-]$/.test(e.key)) {
        e.preventDefault()
        return
      }

      // Simulate the resulting string after key insertion
      const input = e.currentTarget
      const simulated = simulateInputValue(
        input.value,
        input.selectionStart,
        input.selectionEnd,
        e.key
      )

      if (!isValidCoordinateInput(simulated, type)) {
        e.preventDefault()
      }
    },
    []
  )

  /**
   * Latitude change handler with strict format and range checks
   */
  const handleLatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const candidate = e.target.value
    if (!isValidCoordinateInput(candidate, 'latitude')) {
      return
    }

    setLatInput(candidate)

    // Only broadcast complete valid floating numbers to parent
    const parsed = parseFloat(candidate)
    if (
      !isNaN(parsed) &&
      candidate !== '-' &&
      candidate !== '.' &&
      candidate !== '-.' &&
      !candidate.endsWith('.')
    ) {
      onChange(parsed, longitude)
    }
  }

  /**
   * Longitude change handler with strict format and range checks
   */
  const handleLonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const candidate = e.target.value
    if (!isValidCoordinateInput(candidate, 'longitude')) {
      return
    }

    setLonInput(candidate)

    // Only broadcast complete valid floating numbers to parent
    const parsed = parseFloat(candidate)
    if (
      !isNaN(parsed) &&
      candidate !== '-' &&
      candidate !== '.' &&
      candidate !== '-.' &&
      !candidate.endsWith('.')
    ) {
      onChange(latitude, parsed)
    }
  }

  /**
   * Paste handler that rejects out-of-range or malformed pasted text
   */
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, type: CoordinateType) => {
    const pastedText = e.clipboardData.getData('text').trim()
    const input = e.currentTarget
    const simulated = simulateInputValue(
      input.value,
      input.selectionStart,
      input.selectionEnd,
      pastedText
    )

    if (!isValidCoordinateInput(simulated, type)) {
      e.preventDefault()
      const limit = COORDINATE_LIMITS[type]
      toast.error(`Invalid ${limit.label}. Must be between ${limit.rangeText}`)
    }
  }

  /**
   * Latitude blur handler: cleans up incomplete input and ensures valid value
   */
  const handleLatBlur = () => {
    const num = parseFloat(latInput)
    if (isNaN(num) || latInput === '' || latInput === '-' || latInput === '.' || latInput === '-.') {
      setLatInput(latitude.toString())
    } else {
      const clamped = clampCoordinate(num, 'latitude')
      setLatInput(clamped.toString())
      onChange(clamped, longitude)
    }
  }

  /**
   * Longitude blur handler: cleans up incomplete input and ensures valid value
   */
  const handleLonBlur = () => {
    const num = parseFloat(lonInput)
    if (isNaN(num) || lonInput === '' || lonInput === '-' || lonInput === '.' || lonInput === '-.') {
      setLonInput(longitude.toString())
    } else {
      const clamped = clampCoordinate(num, 'longitude')
      setLonInput(clamped.toString())
      onChange(latitude, clamped)
    }
  }

  return (
    <div className="glass-panel rounded-2xl p-3.5 sm:p-4 lg:p-5 flex flex-col justify-between gap-2.5 sm:gap-3 shadow-xs min-h-[380px] sm:min-h-[420px] lg:h-[480px] w-full font-sans">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0" aria-hidden="true">
            <MapPin className="h-4 w-4 stroke-[2]" />
          </div>
          <h3 className="text-sm font-semibold tracking-tight text-foreground truncate">
            Location Coordinates
          </h3>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onReset}
          className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-md cursor-pointer shrink-0"
          aria-label="Reset to default location"
        >
          <RotateCcw className="h-3.5 w-3.5 stroke-[2]" />
        </Button>
      </div>

      {/* Synchronized Latitude & Longitude Numeric Inputs with Strict Validations */}
      <div className="grid grid-cols-2 gap-2 shrink-0">
        <div>
          <label className="text-[10px] font-semibold text-muted-foreground block mb-1">
            Latitude (°N/S)
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              value={latInput}
              onChange={handleLatChange}
              onKeyDown={(e) => handleKeyDown(e, 'latitude')}
              onPaste={(e) => handlePaste(e, 'latitude')}
              onBlur={handleLatBlur}
              className="w-full h-8 px-2.5 rounded-md border border-border/60 bg-background/90 text-xs font-mono tabular-nums text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1.5 focus:ring-primary focus:border-primary transition-all"
              placeholder={COORDINATE_LIMITS.latitude.placeholder}
              aria-label="Latitude coordinate"
              spellCheck={false}
              autoComplete="off"
            />
          </div>
        </div>
        <div>
          <label className="text-[10px] font-semibold text-muted-foreground block mb-1">
            Longitude (°E/W)
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              value={lonInput}
              onChange={handleLonChange}
              onKeyDown={(e) => handleKeyDown(e, 'longitude')}
              onPaste={(e) => handlePaste(e, 'longitude')}
              onBlur={handleLonBlur}
              className="w-full h-8 px-2.5 rounded-md border border-border/60 bg-background/90 text-xs font-mono tabular-nums text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1.5 focus:ring-primary focus:border-primary transition-all"
              placeholder={COORDINATE_LIMITS.longitude.placeholder}
              aria-label="Longitude coordinate"
              spellCheck={false}
              autoComplete="off"
            />
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="relative w-full h-[180px] sm:h-[220px] lg:h-auto lg:flex-1 rounded-xl overflow-hidden border border-border/60 bg-muted/20 shrink-0 lg:shrink" role="application" aria-label="Interactive location map">
        <MapContainer
          center={[normalizeLatitude(latitude), normalizeLongitude(longitude)]}
          zoom={4}
          minZoom={2}
          maxBounds={[
            [-90, -180],
            [90, 180],
          ]}
          maxBoundsViscosity={0.7}
          worldCopyJump={true}
          scrollWheelZoom={true}
          className="h-full w-full z-0"
          style={{ height: '100%', width: '100%', minHeight: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker
            position={[normalizeLatitude(latitude), normalizeLongitude(longitude)]}
            icon={customMarkerIcon}
          />
          <MapClickHandler onChange={onChange} />
          <MapCenterController lat={latitude} lon={longitude} />
          <MapInvalidator />
        </MapContainer>
      </div>

      {/* Presets */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0 py-0.5 -mx-0.5 px-0.5" role="toolbar" aria-label="Quick city presets">
        {PRESET_LOCATIONS.map((preset: PresetLocation) => {
          const isSelected =
            Math.abs(preset.latitude - latitude) < 0.01 &&
            Math.abs(preset.longitude - longitude) < 0.01

          return (
            <button
              key={preset.name}
              type="button"
              onClick={() => onChange(preset.latitude, preset.longitude)}
              className={`text-[11px] px-2.5 py-1.5 sm:px-2 sm:py-1 rounded-md font-medium transition-all shrink-0 cursor-pointer border focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 min-h-[28px] sm:min-h-[26px] flex items-center ${
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                  : 'bg-background hover:bg-muted text-foreground/70 border-border/60 hover:border-border'
              }`}
              aria-pressed={isSelected}
              aria-label={`Select ${preset.name}`}
            >
              {preset.name.split(',')[0]}
            </button>
          )
        })}
      </div>
    </div>
  )
}

