import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { RotateCcw, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PRESET_LOCATIONS, type PresetLocation } from '@/constants/weather'

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
      onChange(
        parseFloat(e.latlng.lat.toFixed(4)),
        parseFloat(e.latlng.lng.toFixed(4))
      )
    },
  })
  return null
}

function MapCenterController({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo([lat, lon], map.getZoom(), { duration: 0.6 })
  }, [lat, lon, map])
  return null
}

export function LocationSelector({
  latitude,
  longitude,
  onChange,
  onReset,
}: LocationSelectorProps) {
  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-xs h-[480px] font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400" aria-hidden="true">
            <MapPin className="h-4 w-4 stroke-[2]" />
          </div>
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            Location
          </h3>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="bg-muted/60 px-2 py-0.5 rounded-md border border-border/60 text-[11px] font-mono text-foreground tabular-nums" aria-label={`Coordinates: ${latitude}, ${longitude}`}>
            {latitude >= 0 ? `${latitude.toFixed(2)}°N` : `${Math.abs(latitude).toFixed(2)}°S`},{' '}
            {longitude >= 0 ? `${longitude.toFixed(2)}°E` : `${Math.abs(longitude).toFixed(2)}°W`}
          </span>

          <Button
            variant="ghost"
            size="icon"
            onClick={onReset}
            className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-md cursor-pointer"
            aria-label="Reset to default location"
          >
            <RotateCcw className="h-3.5 w-3.5 stroke-[2]" />
          </Button>
        </div>
      </div>

      {/* Map */}
      <div className="relative flex-1 min-h-0 w-full rounded-xl overflow-hidden border border-border/60 bg-muted/20" role="application" aria-label="Interactive location map">
        <MapContainer
          center={[latitude, longitude]}
          zoom={4}
          scrollWheelZoom={true}
          className="h-full w-full z-0"
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[latitude, longitude]} icon={customMarkerIcon} />
          <MapClickHandler onChange={onChange} />
          <MapCenterController lat={latitude} lon={longitude} />
        </MapContainer>
      </div>

      {/* Presets */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0" role="toolbar" aria-label="Quick city presets">
        {PRESET_LOCATIONS.map((preset: PresetLocation) => {
          const isSelected =
            Math.abs(preset.latitude - latitude) < 0.01 &&
            Math.abs(preset.longitude - longitude) < 0.01

          return (
            <button
              key={preset.name}
              type="button"
              onClick={() => onChange(preset.latitude, preset.longitude)}
              className={`text-[11px] px-2 py-1 rounded-md font-medium transition-all shrink-0 cursor-pointer border focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 ${
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
