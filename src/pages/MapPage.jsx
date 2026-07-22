import { useEffect, useMemo, useState } from 'react'
import L from 'leaflet'
import { ExternalLink, LocateFixed, LoaderCircle, X } from 'lucide-react'
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import {
  getLiveListingUrl,
  restaurantDataset,
  restaurants,
  specialties,
} from '../data/restaurants'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const PARIS_CENTER = [48.8566, 2.3522]
const ROUTING_ENDPOINT = 'https://routing.openstreetmap.de/routed-foot/route/v1/foot'
const userLocationIcon = L.divIcon({
  className: '',
  html: '<div class="user-location-dot" aria-hidden="true"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

function FilterBar({ active, onChange }) {
  return (
    <div className="shrink-0 border-b border-paris-navy/10 bg-white">
      <div className="flex gap-2 overflow-x-auto px-3 py-2.5" aria-label="Restaurant specialties">
        {['All', ...specialties].map((specialty) => (
          <button
            key={specialty}
            type="button"
            onClick={() => onChange(specialty)}
            aria-pressed={active === specialty}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              active === specialty
                ? 'bg-paris-navy text-paris-cream'
                : 'bg-paris-navy/5 text-paris-navy hover:bg-paris-navy/10'
            }`}
          >
            {specialty}
          </button>
        ))}
      </div>
      <div className="flex items-start justify-between gap-3 border-t border-paris-navy/5 bg-paris-cream/75 px-3 py-2 text-[11px] leading-4 text-paris-navy/60">
        <p>
          Snapshot recovered {restaurantDataset.recoveredOn}. Ratings and price bands are not live; verify before visiting.
        </p>
        <a
          href={restaurantDataset.recoveredFrom}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 font-medium text-paris-gold underline underline-offset-2"
        >
          Source
        </a>
      </div>
    </div>
  )
}

function FitRoute({ route, origin }) {
  const map = useMap()

  useEffect(() => {
    if (!route || !origin) return
    map.fitBounds([[origin.lat, origin.lng], ...route.coordinates], { padding: [36, 36] })
  }, [map, origin, route])

  return null
}

function KeepMapSized() {
  const map = useMap()

  useEffect(() => {
    const container = map.getContainer()
    const observer = new ResizeObserver(() => map.invalidateSize({ pan: false }))
    observer.observe(container)
    return () => observer.disconnect()
  }, [map])

  return null
}

function RestaurantMap({ filteredRestaurants, selected, onSelect, origin, route }) {
  const routeCoordinates = route?.coordinates

  return (
    <MapContainer center={PARIS_CENTER} zoom={13} className="h-full w-full">
      <TileLayer
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {filteredRestaurants.map((restaurant) => (
        <Marker
          key={restaurant.id}
          position={[restaurant.lat, restaurant.lng]}
          eventHandlers={{ click: () => onSelect(restaurant) }}
          opacity={selected && selected.id !== restaurant.id ? 0.72 : 1}
        >
          <Popup>
            <div className="min-w-[190px] space-y-1">
              <p className="font-semibold text-paris-navy">{restaurant.name}</p>
              <p className="text-xs uppercase tracking-wide text-paris-gold">
                {restaurant.specialty} · {restaurant.price}
              </p>
              <p className="text-xs leading-5 text-paris-navy/80">{restaurant.blurb}</p>
              <p className="text-[11px] text-paris-navy/55">
                Snapshot rating: {restaurant.snapshotRating.toFixed(1)} · not live
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
      {origin && <Marker position={[origin.lat, origin.lng]} icon={userLocationIcon} />}
      {routeCoordinates && <Polyline positions={routeCoordinates} pathOptions={{ color: '#c8a951', weight: 5 }} />}
      <FitRoute route={route} origin={origin} />
      <KeepMapSized />
    </MapContainer>
  )
}

function locateUser() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ lat: coords.latitude, lng: coords.longitude }),
      (error) => reject(new Error(error.message || 'Unable to get your location')),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  })
}

function formatInstruction(step) {
  const { maneuver, name } = step
  const street = name ? ` onto ${name}` : ''
  if (maneuver.type === 'depart') return `Head out${street}`
  if (maneuver.type === 'arrive') return 'Arrive at your destination'
  if (maneuver.type === 'roundabout' || maneuver.type === 'rotary') return `Take the roundabout${street}`
  if (maneuver.modifier) return `Turn ${maneuver.modifier}${street}`
  return `Continue${street}`
}

async function fetchWalkingRoute(origin, destination) {
  const url = `${ROUTING_ENDPOINT}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&steps=true`
  const response = await fetch(url)
  if (!response.ok) throw new Error('Could not reach the routing service')

  const payload = await response.json()
  if (payload.code !== 'Ok' || !payload.routes?.length) throw new Error('No walking route found')

  const firstRoute = payload.routes[0]
  return {
    coordinates: firstRoute.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
    distanceMeters: firstRoute.distance,
    durationSeconds: firstRoute.duration,
    steps: firstRoute.legs[0].steps
      .filter((step) => step.distance > 0 || step.maneuver.type === 'arrive')
      .map((step) => ({ instruction: formatInstruction(step), distanceMeters: step.distance })),
  }
}

function RestaurantPanel({ restaurant, onClose, onRoute }) {
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [route, setRoute] = useState(null)
  const isLoading = status === 'locating' || status === 'routing'
  const liveListingUrl = getLiveListingUrl(restaurant)
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${restaurant.lat},${restaurant.lng}&travelmode=walking`

  async function handleDirections() {
    setStatus('locating')
    setError('')
    setRoute(null)
    try {
      const origin = await locateUser()
      setStatus('routing')
      const nextRoute = await fetchWalkingRoute(origin, restaurant)
      setRoute(nextRoute)
      onRoute({ origin, route: nextRoute })
      setStatus('done')
    } catch (routeError) {
      setError(routeError.message)
      setStatus('error')
      onRoute(null)
    }
  }

  return (
    <aside
      aria-label={`${restaurant.name} details`}
      className="flex max-h-[44vh] w-full shrink-0 flex-col gap-3 overflow-y-auto border-t border-paris-navy/10 bg-white p-4 sm:max-h-none sm:w-80 sm:border-l sm:border-t-0"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="font-semibold text-paris-navy">{restaurant.name}</h2>
          <p className="text-xs uppercase tracking-wide text-paris-gold">
            {restaurant.specialty} · {restaurant.price}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-full p-1 text-paris-navy/50 hover:bg-paris-navy/5 hover:text-paris-navy"
          aria-label="Close restaurant details"
        >
          <X aria-hidden="true" size={18} />
        </button>
      </div>

      <p className="text-sm leading-6 text-paris-navy/70">{restaurant.blurb}</p>
      <div className="rounded-xl bg-paris-cream px-3 py-2 text-xs leading-5 text-paris-navy/65">
        Snapshot rating: <strong>{restaurant.snapshotRating.toFixed(1)}</strong>. This is recovered historical data,
        not a live review score.
      </div>

      <a
        href={liveListingUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center justify-center gap-1.5 rounded-full border border-paris-gold px-4 py-2 text-sm font-medium text-paris-gold"
      >
        Check current listing
        <ExternalLink aria-hidden="true" size={14} />
      </a>

      <button
        type="button"
        onClick={handleDirections}
        disabled={isLoading}
        className="flex items-center justify-center gap-2 rounded-full bg-paris-navy px-4 py-2 text-sm font-medium text-paris-cream disabled:opacity-60"
      >
        {isLoading ? (
          <LoaderCircle aria-hidden="true" size={16} className="animate-spin" />
        ) : (
          <LocateFixed aria-hidden="true" size={16} />
        )}
        {status === 'locating'
          ? 'Finding your location…'
          : status === 'routing'
            ? 'Getting directions…'
            : 'Directions from my location'}
      </button>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error} — use the Google Maps link below instead.
        </p>
      )}

      {route && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-paris-navy">
            {(route.distanceMeters / 1000).toFixed(1)} km · {Math.round(route.durationSeconds / 60)} min walk
          </p>
          <ol className="space-y-2 text-sm text-paris-navy/80">
            {route.steps.map((step, index) => (
              <li key={`${step.instruction}-${index}`} className="flex gap-2">
                <span className="font-semibold text-paris-gold">{index + 1}.</span>
                <span>
                  {step.instruction}
                  {step.distanceMeters > 0 && (
                    <span className="text-paris-navy/50"> ({Math.round(step.distanceMeters)} m)</span>
                  )}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <a
        href={directionsUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-auto pt-1 text-center text-sm font-medium text-paris-gold underline underline-offset-2"
      >
        Open directions in Google Maps
      </a>
    </aside>
  )
}

export default function MapPage() {
  const [activeSpecialty, setActiveSpecialty] = useState('All')
  const [selected, setSelected] = useState(null)
  const [origin, setOrigin] = useState(null)
  const [route, setRoute] = useState(null)

  const filteredRestaurants = useMemo(
    () =>
      activeSpecialty === 'All'
        ? restaurants
        : restaurants.filter((restaurant) => restaurant.specialty === activeSpecialty),
    [activeSpecialty],
  )

  function handleFilterChange(specialty) {
    setActiveSpecialty(specialty)
    setSelected(null)
    setOrigin(null)
    setRoute(null)
  }

  function handleSelect(restaurant) {
    setSelected(restaurant)
    setOrigin(null)
    setRoute(null)
  }

  function handleClose() {
    setSelected(null)
    setOrigin(null)
    setRoute(null)
  }

  function handleRoute(nextRoute) {
    if (!nextRoute) {
      setOrigin(null)
      setRoute(null)
      return
    }
    setOrigin(nextRoute.origin)
    setRoute(nextRoute.route)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <FilterBar active={activeSpecialty} onChange={handleFilterChange} />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden sm:flex-row">
        <div className="min-h-[38vh] min-w-0 flex-1 sm:min-h-0">
          <RestaurantMap
            filteredRestaurants={filteredRestaurants}
            selected={selected}
            onSelect={handleSelect}
            origin={origin}
            route={route}
          />
        </div>
        {selected && (
          <RestaurantPanel restaurant={selected} onClose={handleClose} onRoute={handleRoute} />
        )}
      </div>
    </div>
  )
}
