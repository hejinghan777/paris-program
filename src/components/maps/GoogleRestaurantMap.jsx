import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../../i18n'

const PARIS_CENTER = { lat: 48.8566, lng: 2.3522 }
let loaderPromise

function loadGoogleMaps(apiKey) {
  if (window.google?.maps) return Promise.resolve(window.google.maps)
  if (loaderPromise) return loaderPromise

  loaderPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly&loading=async`
    script.async = true
    script.onload = () => resolve(window.google.maps)
    script.onerror = () => reject(new Error('Google 地图加载失败'))
    document.head.appendChild(script)
  })
  return loaderPromise
}

export default function GoogleRestaurantMap({
  apiKey,
  restaurants,
  selected,
  onSelect,
  userLocation,
  route,
  onUnavailable,
}) {
  const { tr } = useLanguage()
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const routeRef = useRef(null)
  const userMarkerRef = useRef(null)
  const accuracyCircleRef = useRef(null)
  const [maps, setMaps] = useState(null)

  useEffect(() => {
    let active = true
    loadGoogleMaps(apiKey)
      .then((loadedMaps) => {
        if (!active) return
        setMaps(loadedMaps)
        mapRef.current = new loadedMaps.Map(containerRef.current, {
          center: PARIS_CENTER,
          zoom: 13,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          clickableIcons: false,
          gestureHandling: 'greedy',
        })
      })
      .catch(onUnavailable)
    return () => {
      active = false
    }
  }, [apiKey, onUnavailable])

  useEffect(() => {
    if (!maps || !mapRef.current) return undefined
    markersRef.current.forEach((marker) => marker.setMap(null))
    markersRef.current = restaurants.map((restaurant) => {
      const marker = new maps.Marker({
        map: mapRef.current,
        position: { lat: restaurant.lat, lng: restaurant.lng },
        title: restaurant.name,
        label: {
          text: String(restaurant.id),
          color: '#ffffff',
          fontSize: '11px',
          fontWeight: '700',
        },
        icon: {
          path: maps.SymbolPath.CIRCLE,
          fillColor: selected?.id === restaurant.id ? '#e6404f' : '#0c1d39',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: selected?.id === restaurant.id ? 17 : 15,
        },
      })
      marker.addListener('click', () => onSelect(restaurant))
      return marker
    })
    return () => markersRef.current.forEach((marker) => marker.setMap(null))
  }, [maps, onSelect, restaurants, selected])

  useEffect(() => {
    if (!maps || !mapRef.current) return
    if (routeRef.current) routeRef.current.setMap(null)
    routeRef.current = null
    if (route) {
      routeRef.current = new maps.Polyline({
        map: mapRef.current,
        path: route.coordinates.map(([lat, lng]) => ({ lat, lng })),
        strokeColor: '#1b52ab',
        strokeOpacity: 0.9,
        strokeWeight: 6,
      })
      const bounds = new maps.LatLngBounds()
      route.coordinates.forEach(([lat, lng]) => bounds.extend({ lat, lng }))
      mapRef.current.fitBounds(bounds, 48)
    } else if (selected) {
      mapRef.current.panTo({ lat: selected.lat, lng: selected.lng })
      mapRef.current.setZoom(15)
    }
  }, [maps, route, selected])

  useEffect(() => {
    if (!maps || !mapRef.current) return
    if (userMarkerRef.current) userMarkerRef.current.setMap(null)
    if (accuracyCircleRef.current) accuracyCircleRef.current.setMap(null)
    if (!userLocation) return

    const position = { lat: userLocation.lat, lng: userLocation.lng }
    userMarkerRef.current = new maps.Marker({
      map: mapRef.current,
      position,
      title: tr('你的位置', 'Your location', 'Votre position'),
      zIndex: 999,
      icon: {
        path: maps.SymbolPath.CIRCLE,
        fillColor: '#2563eb',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
        scale: 9,
      },
    })
    accuracyCircleRef.current = new maps.Circle({
      map: mapRef.current,
      center: position,
      radius: userLocation.accuracy,
      fillColor: '#2563eb',
      fillOpacity: 0.08,
      strokeColor: '#2563eb',
      strokeOpacity: 0.25,
      strokeWeight: 1,
    })
  }, [maps, tr, userLocation])

  return (
    <div
      ref={containerRef}
      className="h-full w-full bg-[#e8edf4]"
      aria-label={tr('Google 地图', 'Google Map', 'Carte Google')}
    />
  )
}
