import { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import {
  Clock3,
  Crosshair,
  Footprints,
  LoaderCircle,
  MapPinned,
  Navigation,
} from 'lucide-react'
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'
import { useLanguage } from '../../i18n'
import {
  fetchWaypointRoute,
  formatDistance,
  getCurrentPosition,
} from '../../services/navigation'

const userLocationIcon = L.divIcon({
  className: '',
  html: '<div class="user-location-dot" aria-hidden="true"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

function placeIcon(index) {
  return L.divIcon({
    className: '',
    html: `<div class="restaurant-number-marker">${index + 1}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 28],
    popupAnchor: [0, -26],
  })
}

function FitRecommendationRoute({ points, route }) {
  const map = useMap()

  useEffect(() => {
    const visiblePoints = route?.coordinates?.length
      ? route.coordinates
      : points.map((point) => [point.lat, point.lng])
    if (visiblePoints.length > 1) {
      map.fitBounds(visiblePoints, { padding: [34, 34] })
    } else if (visiblePoints.length === 1) {
      map.setView(visiblePoints[0], 15)
    }
    window.setTimeout(() => map.invalidateSize({ pan: false }), 50)
  }, [map, points, route])

  return null
}

export default function RecommendationRouteMap({ recommendations }) {
  const { language, tr } = useLanguage()
  const points = useMemo(
    () =>
      recommendations.filter(
        (recommendation) =>
          Number.isFinite(recommendation.lat) && Number.isFinite(recommendation.lng),
      ),
    [recommendations],
  )
  const [route, setRoute] = useState(null)
  const [routeStatus, setRouteStatus] = useState('idle')
  const [routeError, setRouteError] = useState('')
  const [userLocation, setUserLocation] = useState(null)
  const routeAbortRef = useRef(null)
  const pointKey = points.map((point) => `${point.id}:${point.lat}:${point.lng}`).join('|')

  useEffect(() => {
    if (points.length < 2) return undefined
    const controller = new AbortController()
    routeAbortRef.current = controller
    setRouteStatus('loading')
    setRouteError('')
    setUserLocation(null)

    fetchWaypointRoute(points, controller.signal, language)
      .then((nextRoute) => {
        setRoute(nextRoute)
        setRouteStatus('ready')
      })
      .catch((error) => {
        if (error.name === 'AbortError') return
        setRoute(null)
        setRouteStatus('error')
        setRouteError(error.message)
      })

    return () => controller.abort()
  }, [language, pointKey])

  async function routeFromMyLocation() {
    routeAbortRef.current?.abort()
    const controller = new AbortController()
    routeAbortRef.current = controller
    setRouteStatus('locating')
    setRouteError('')
    try {
      const position = await getCurrentPosition(language)
      setUserLocation(position)
      setRouteStatus('loading')
      const nextRoute = await fetchWaypointRoute(
        [position, ...points],
        controller.signal,
        language,
      )
      setRoute(nextRoute)
      setRouteStatus('ready')
    } catch (error) {
      if (error.name === 'AbortError') return
      setRouteStatus('error')
      setRouteError(error.message)
    }
  }

  if (!points.length) return null

  const center = [
    points.reduce((sum, point) => sum + point.lat, 0) / points.length,
    points.reduce((sum, point) => sum + point.lng, 0) / points.length,
  ]

  return (
    <section className="mt-3 overflow-hidden rounded-2xl border border-paris-navy/10 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-paris-navy/8 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-paris-blue/10 text-paris-blue">
            <MapPinned size={15} aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-black text-paris-navy">
              {tr('推荐导航地图', 'Recommended route map', 'Carte du parcours recommandé')}
            </p>
            <p className="text-[10px] text-paris-ink/45">
              {tr(
                `${points.length} 个推荐地点 · 站内步行路线`,
                `${points.length} recommended places · in-app walking route`,
                `${points.length} lieux recommandés · parcours à pied intégré`,
              )}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={routeFromMyLocation}
          disabled={routeStatus === 'locating' || routeStatus === 'loading'}
          className="inline-flex items-center gap-1.5 rounded-full bg-paris-blue px-3 py-1.5 text-[10px] font-bold text-white transition hover:bg-[#16468f] disabled:cursor-wait disabled:opacity-60"
        >
          {routeStatus === 'locating' ? (
            <LoaderCircle size={12} className="animate-spin" aria-hidden="true" />
          ) : (
            <Crosshair size={12} aria-hidden="true" />
          )}
          {routeStatus === 'locating'
            ? tr('正在定位…', 'Locating…', 'Localisation…')
            : tr('从我的位置出发', 'Start from my location', 'Depuis ma position')}
        </button>
      </div>

      <div className="relative h-64 w-full bg-[#e8edf4] sm:h-72">
        <MapContainer
          center={center}
          zoom={13}
          className="h-full w-full"
          scrollWheelZoom={false}
          zoomControl
        >
          <TileLayer
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {points.map((point, index) => (
            <Marker
              key={`${point.type}-${point.id}`}
              position={[point.lat, point.lng]}
              icon={placeIcon(index)}
            >
              <Popup>
                <strong>{index + 1}. {point.title}</strong>
                <br />
                <span>{point.meta}</span>
              </Popup>
            </Marker>
          ))}
          {userLocation && (
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={userLocationIcon}
            >
              <Popup>
                {tr(
                  `你的位置（精度约 ${Math.round(userLocation.accuracy)} 米）`,
                  `Your location (accuracy about ${Math.round(userLocation.accuracy)} m)`,
                  `Votre position (précision d’environ ${Math.round(userLocation.accuracy)} m)`,
                )}
              </Popup>
            </Marker>
          )}
          {route && (
            <Polyline
              positions={route.coordinates}
              pathOptions={{ color: '#1b52ab', weight: 5, opacity: 0.88 }}
            />
          )}
          <FitRecommendationRoute
            points={userLocation ? [userLocation, ...points] : points}
            route={route}
          />
        </MapContainer>

        {routeStatus === 'loading' && (
          <div className="pointer-events-none absolute inset-0 z-[500] grid place-items-center bg-white/55 backdrop-blur-[1px]">
            <span className="inline-flex items-center gap-2 rounded-full bg-paris-navy px-3 py-2 text-[11px] font-bold text-white shadow-lg">
              <LoaderCircle size={14} className="animate-spin" aria-hidden="true" />
              {tr('正在生成推荐路线…', 'Building the recommended route…', 'Calcul du parcours recommandé…')}
            </span>
          </div>
        )}
      </div>

      <div className="flex min-h-10 flex-wrap items-center justify-between gap-2 bg-paris-cream/55 px-3 py-2">
        {route ? (
          <div className="flex flex-wrap items-center gap-3 text-[10px] font-semibold text-paris-ink/60">
            <span className="inline-flex items-center gap-1">
              <Footprints size={12} className="text-paris-blue" aria-hidden="true" />
              {formatDistance(route.distanceMeters, language)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock3 size={12} className="text-paris-blue" aria-hidden="true" />
              {Math.max(1, Math.round(route.durationSeconds / 60))} {tr('分钟', 'min', 'min')}
            </span>
            {userLocation && (
              <span className="inline-flex items-center gap-1 text-emerald-700">
                <Navigation size={11} aria-hidden="true" />
                {tr('已从你的位置重新规划', 'Routed from your location', 'Recalculé depuis votre position')}
              </span>
            )}
          </div>
        ) : (
          <p className="text-[10px] text-paris-ink/45">
            {tr(
              '地图已显示推荐地点',
              'The recommended places are shown on the map',
              'Les lieux recommandés sont affichés sur la carte',
            )}
          </p>
        )}
        <p className="text-[9px] text-paris-ink/35">
          {tr('路线仅供步行参考', 'Walking guidance only', 'Parcours piéton indicatif')}
        </p>
      </div>

      {routeError && (
        <p role="alert" className="border-t border-red-100 bg-red-50 px-3 py-2 text-[10px] text-red-700">
          {routeError}
        </p>
      )}
    </section>
  )
}
