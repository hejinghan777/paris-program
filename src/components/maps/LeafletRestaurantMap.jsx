import { useEffect, useMemo } from 'react'
import L from 'leaflet'
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'
import { useLanguage } from '../../i18n'

const PARIS_CENTER = [48.8566, 2.3522]
const userLocationIcon = L.divIcon({
  className: '',
  html: '<div class="user-location-dot" aria-hidden="true"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

function restaurantIcon(restaurant, isSelected) {
  return L.divIcon({
    className: '',
    html: `<div class="restaurant-number-marker${isSelected ? ' is-selected' : ''}">${restaurant.id}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 28],
    popupAnchor: [0, -26],
  })
}

function MapEffects({ selected, userLocation, route }) {
  const map = useMap()

  useEffect(() => {
    const container = map.getContainer()
    const observer = new ResizeObserver(() => map.invalidateSize({ pan: false }))
    observer.observe(container)
    return () => observer.disconnect()
  }, [map])

  useEffect(() => {
    if (route && userLocation) {
      map.fitBounds([[userLocation.lat, userLocation.lng], ...route.coordinates], {
        padding: [48, 48],
      })
      return
    }
    if (selected) map.flyTo([selected.lat, selected.lng], 15, { duration: 0.7 })
  }, [map, route, selected, userLocation])

  return null
}

export default function LeafletRestaurantMap({
  restaurants,
  selected,
  onSelect,
  userLocation,
  route,
}) {
  const { tr } = useLanguage()
  const icons = useMemo(
    () =>
      new Map(
        restaurants.map((restaurant) => [
          restaurant.id,
          restaurantIcon(restaurant, selected?.id === restaurant.id),
        ]),
      ),
    [restaurants, selected],
  )

  return (
    <MapContainer center={PARIS_CENTER} zoom={13} className="h-full w-full" zoomControl>
      <TileLayer
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {restaurants.map((restaurant) => (
        <Marker
          key={restaurant.id}
          position={[restaurant.lat, restaurant.lng]}
          icon={icons.get(restaurant.id)}
          eventHandlers={{ click: () => onSelect(restaurant) }}
        >
          <Popup>
            <button
              type="button"
              onClick={() => onSelect(restaurant)}
              className="min-w-[190px] text-left"
            >
              <span className="block font-bold text-paris-navy">{restaurant.name}</span>
              <span className="mt-1 block text-xs font-semibold text-paris-red">
                {restaurant.specialty} · {restaurant.price}
              </span>
              <span className="mt-1.5 block text-xs leading-5 text-paris-ink/65">
                {tr(
                  '点击查看餐厅详情和站内路线',
                  'Select for restaurant details and an in-app route',
                  'Sélectionnez pour les détails et l’itinéraire intégré',
                )}
              </span>
            </button>
          </Popup>
        </Marker>
      ))}
      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
          <Popup>
            {tr(
              `你的位置（精度约 ${Math.round(userLocation.accuracy)} 米）`,
              `Your location (about ${Math.round(userLocation.accuracy)} m accuracy)`,
              `Votre position (précision d’environ ${Math.round(userLocation.accuracy)} m)`,
            )}
          </Popup>
        </Marker>
      )}
      {route && (
        <Polyline
          positions={route.coordinates}
          pathOptions={{ color: '#1b52ab', weight: 6, opacity: 0.88 }}
        />
      )}
      <MapEffects selected={selected} userLocation={userLocation} route={route} />
    </MapContainer>
  )
}
