import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  ChevronDown,
  Clock3,
  Crosshair,
  Database,
  Footprints,
  LocateFixed,
  LoaderCircle,
  Map,
  Navigation,
  Route,
  Search,
  Star,
  Utensils,
  X,
} from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import GoogleRestaurantMap from '../components/maps/GoogleRestaurantMap'
import LeafletRestaurantMap from '../components/maps/LeafletRestaurantMap'
import { restaurantDataset, specialties } from '../data/restaurants'
import { useLanguage } from '../i18n'
import { useManagedContent } from '../managedContent'
import {
  distanceBetween,
  fetchWalkingRoute,
  formatDistance,
  getCurrentPosition,
} from '../services/navigation'

const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim()
const specialtyLabels = {
  zh: {
    All: '全部',
    'French Bistro': '法式小馆',
    'Fine Dining': '精致餐饮',
    Italian: '意大利菜',
    Japanese: '日本料理',
    Chinese: '中餐',
    'Middle Eastern': '中东料理',
    Crêperie: '可丽饼',
    'Bakery & Pastry': '烘焙甜点',
    'Wine Bar': '葡萄酒吧',
    'Brasserie & Seafood': '海鲜餐厅',
    Vegan: '纯素',
  },
  en: {
    All: 'All',
    'French Bistro': 'French bistro',
    'Fine Dining': 'Fine dining',
    Italian: 'Italian',
    Japanese: 'Japanese',
    Chinese: 'Chinese',
    'Middle Eastern': 'Middle Eastern',
    Crêperie: 'Crêperie',
    'Bakery & Pastry': 'Bakery & pastry',
    'Wine Bar': 'Wine bar',
    'Brasserie & Seafood': 'Seafood & brasserie',
    Vegan: 'Vegan',
  },
  fr: {
    All: 'Tous',
    'French Bistro': 'Bistrot français',
    'Fine Dining': 'Gastronomique',
    Italian: 'Italien',
    Japanese: 'Japonais',
    Chinese: 'Chinois',
    'Middle Eastern': 'Moyen-Orient',
    Crêperie: 'Crêperie',
    'Bakery & Pastry': 'Boulangerie',
    'Wine Bar': 'Bar à vins',
    'Brasserie & Seafood': 'Brasserie & fruits de mer',
    Vegan: 'Végan',
  },
}

function restaurantDescription(restaurant, language) {
  if (language === 'en') return restaurant.blurb
  if (language === 'fr') {
    return `Une adresse parisienne de catégorie « ${specialtyLabels.fr[restaurant.specialty]} », enregistrée dans la base du groupe pour comparer la cuisine, le prix et la position.`
  }
  return `这是一家收录在小组餐厅资料库中的${specialtyLabels.zh[restaurant.specialty]}，可结合价格、历史评分和当前位置进行比较。`
}

function localizedValue(value, language) {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value[language] || value.zh || value.en || value.fr || ''
}

function RestaurantCard({ restaurant, selected, distance, onSelect }) {
  const { language } = useLanguage()

  return (
    <button
      type="button"
      onClick={() => onSelect(restaurant)}
      className={`w-full rounded-2xl border p-3 text-left transition ${
        selected
          ? 'border-paris-blue bg-paris-blue/[0.06] shadow-sm'
          : 'border-paris-navy/8 bg-white hover:-translate-y-0.5 hover:border-paris-blue/30 hover:shadow-md'
      }`}
      aria-pressed={selected}
    >
      <span className="flex items-start gap-3">
        <span
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-xs font-black ${
            selected ? 'bg-paris-blue text-white' : 'bg-paris-navy/[0.06] text-paris-navy'
          }`}
        >
          {restaurant.id}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-2">
            <span className="truncate text-sm font-bold text-paris-navy">{restaurant.name}</span>
            <span className="shrink-0 text-xs font-bold text-paris-red">{restaurant.price}</span>
          </span>
          <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-paris-ink/55">
            <span>{specialtyLabels[language][restaurant.specialty]}</span>
            <span className="font-semibold text-paris-blue">
              €{restaurant.budgetEur.min}–{restaurant.budgetEur.max}
              {language === 'zh' ? '/人' : language === 'fr' ? '/pers.' : ' pp'}
            </span>
            <span className="inline-flex items-center gap-1">
              <Star size={11} className="fill-paris-gold text-paris-gold" aria-hidden="true" />
              {restaurant.snapshotRating.toFixed(1)}
            </span>
            {Number.isFinite(distance) && <span>{formatDistance(distance)}</span>}
          </span>
        </span>
      </span>
    </button>
  )
}

function SelectedRestaurant({
  restaurant,
  userLocation,
  route,
  routeStatus,
  routeError,
  onBack,
  onNavigate,
  onStop,
}) {
  const { language, tr } = useLanguage()

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-paris-navy/8 p-4">
        <button
          type="button"
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-paris-ink/55 hover:text-paris-blue"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          {tr('返回餐厅列表', 'Back to restaurants', 'Retour aux restaurants')}
        </button>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-paris-red">
              {specialtyLabels[language][restaurant.specialty]}
            </p>
            <h2 className="mt-1 text-xl font-black leading-tight text-paris-navy">{restaurant.name}</h2>
          </div>
          <span className="rounded-lg bg-paris-navy/[0.06] px-2.5 py-1 text-sm font-black text-paris-navy">
            {restaurant.price}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full bg-paris-gold/10 px-2.5 py-1 font-bold text-[#8b641d]">
            <Star size={12} className="fill-paris-gold" aria-hidden="true" />
            {tr('历史评分', 'Snapshot rating', 'Note historique')} {restaurant.snapshotRating.toFixed(1)}
          </span>
          <span className="rounded-full bg-paris-blue/8 px-2.5 py-1 font-semibold text-paris-blue">
            {tr('估算人均', 'Estimated per person', 'Estimation par personne')} €{restaurant.budgetEur.min}–
            {restaurant.budgetEur.max}
          </span>
          {userLocation && (
            <span className="rounded-full bg-paris-blue/8 px-2.5 py-1 font-semibold text-paris-blue">
              {tr('距你', 'From you', 'Depuis vous')} {formatDistance(distanceBetween(userLocation, restaurant), language)}
            </span>
          )}
        </div>
        <p className="mt-4 text-sm leading-6 text-paris-ink/65">
          {restaurantDescription(restaurant, language)}
        </p>
        {restaurant.openingHours && (
          <div className="mt-3 rounded-xl border border-paris-navy/8 bg-paris-cream/60 px-3 py-2.5">
            <p className="flex items-start gap-2 text-xs font-bold text-paris-navy">
              <Clock3 size={14} className="mt-0.5 shrink-0 text-paris-blue" aria-hidden="true" />
              <span>
                {localizedValue(restaurant.openingHours.summary, language) ||
                  tr('关门时间尚未确认', 'Closing time not confirmed', 'Heure de fermeture non confirmée')}
                <span
                  className={`ml-2 inline-flex rounded-full px-1.5 py-0.5 text-[9px] ${
                    restaurant.openingHours.certainty === 'confirmed'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {restaurant.openingHours.certainty === 'confirmed'
                    ? tr('已确认', 'Confirmed', 'Confirmé')
                    : tr('可能变化', 'May vary', 'Variable')}
                </span>
              </span>
            </p>
            {localizedValue(restaurant.openingHours.note, language) && (
              <p className="mt-1.5 text-[10px] leading-4 text-paris-ink/50">
                {localizedValue(restaurant.openingHours.note, language)}
                {restaurant.openingHours.checkedOn &&
                  tr(
                    ` · 核对日期 ${restaurant.openingHours.checkedOn}`,
                    ` · Checked ${restaurant.openingHours.checkedOn}`,
                    ` · Vérifié le ${restaurant.openingHours.checkedOn}`,
                  )}
              </p>
            )}
          </div>
        )}
        <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-[11px] leading-5 text-amber-800">
          {tr(
            `人均预算是 ${restaurantDataset.budgetReviewedOn} 核对的估算区间；饮品、套餐和菜单变化可能增加实际花费。评分为历史快照，并非实时营业信息。`,
            `The per-person budget is an estimate reviewed on ${restaurantDataset.budgetReviewedOn}; drinks, set menus and menu changes may increase the bill. Ratings are a historical snapshot, not live business information.`,
            `Le budget par personne est une estimation vérifiée le ${restaurantDataset.budgetReviewedOn} ; boissons, menus et changements de carte peuvent augmenter l’addition. Les notes sont historiques, pas en temps réel.`,
          )}
        </p>
      </div>

      <div className="border-b border-paris-navy/8 p-4">
        {route ? (
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-paris-blue px-3 py-3 text-white">
              <span className="flex items-center gap-1.5 text-[11px] text-white/65">
                <Footprints size={13} aria-hidden="true" />
                {tr('步行距离', 'Walking distance', 'Distance à pied')}
              </span>
              <strong className="mt-1 block text-lg">{formatDistance(route.distanceMeters, language)}</strong>
            </div>
            <div className="rounded-xl bg-paris-navy px-3 py-3 text-white">
              <span className="flex items-center gap-1.5 text-[11px] text-white/65">
                <Clock3 size={13} aria-hidden="true" />
                {tr('预计用时', 'Estimated time', 'Temps estimé')}
              </span>
              <strong className="mt-1 block text-lg">
                {Math.max(1, Math.round(route.durationSeconds / 60))} {tr('分钟', 'min', 'min')}
              </strong>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={onNavigate}
            disabled={routeStatus === 'loading'}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-paris-blue px-4 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(27,82,171,0.2)] transition hover:bg-[#16468f] disabled:cursor-wait disabled:opacity-65"
          >
            {routeStatus === 'loading' ? (
              <LoaderCircle className="animate-spin" size={17} aria-hidden="true" />
            ) : (
              <Navigation size={17} aria-hidden="true" />
            )}
            {routeStatus === 'loading'
              ? tr('正在获取精确位置与路线…', 'Getting your precise location and route…', 'Localisation précise et calcul de l’itinéraire…')
              : tr('从我的位置开始站内导航', 'Navigate from my location', 'Itinéraire depuis ma position')}
          </button>
        )}

        {route && (
          <button
            type="button"
            onClick={onStop}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-paris-navy/10 px-4 py-2.5 text-xs font-bold text-paris-navy hover:bg-paris-navy/[0.04]"
          >
            <X size={14} aria-hidden="true" />
            {tr('结束导航', 'Stop navigation', 'Arrêter la navigation')}
          </button>
        )}
        {routeError && (
          <p role="alert" className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs leading-5 text-red-700">
            {routeError}
            {tr(
              '。地图与餐厅信息仍可继续使用。',
              '. The map and restaurant information remain available.',
              '. La carte et les informations des restaurants restent disponibles.',
            )}
          </p>
        )}
      </div>

      {route && (
        <div className="thin-scrollbar min-h-0 flex-1 overflow-y-auto p-4">
          <p className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-paris-navy/55">
            <Route size={14} aria-hidden="true" />
            {tr('步行指引', 'Walking directions', 'Instructions à pied')}
          </p>
          <ol className="space-y-3">
            {route.steps.map((step, index) => (
              <li key={`${step.instruction}-${index}`} className="flex gap-3 text-sm">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-paris-blue/10 text-[10px] font-black text-paris-blue">
                  {index + 1}
                </span>
                <span className="leading-6 text-paris-ink/75">
                  {step.instruction}
                  {step.distanceMeters > 0 && (
                    <span className="ml-1 text-xs text-paris-ink/40">
                      · {formatDistance(step.distanceMeters, language)}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}

export default function MapPage() {
  const { language, tr } = useLanguage()
  const { restaurants } = useManagedContent()
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [activeSpecialty, setActiveSpecialty] = useState('All')
  const [sortBy, setSortBy] = useState('recommended')
  const [selected, setSelected] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [locationStatus, setLocationStatus] = useState('idle')
  const [locationError, setLocationError] = useState('')
  const [route, setRoute] = useState(null)
  const [routeStatus, setRouteStatus] = useState('idle')
  const [routeError, setRouteError] = useState('')
  const [mapEngine, setMapEngine] = useState(googleMapsApiKey ? 'google' : 'open')
  const watchIdRef = useRef(null)
  const routeAbortRef = useRef(null)
  const lastRouteOriginRef = useRef(null)
  const lastRerouteAtRef = useRef(0)

  const handleSelect = useCallback((restaurant) => {
    setSelected(restaurant)
    setRoute(null)
    setRouteStatus('idle')
    setRouteError('')
  }, [])

  useEffect(() => {
    const requestedId = Number(searchParams.get('restaurant'))
    if (requestedId) {
      const requestedRestaurant = restaurants.find((restaurant) => restaurant.id === requestedId)
      if (requestedRestaurant) handleSelect(requestedRestaurant)
    }
  }, [handleSelect, searchParams])

  useEffect(() => {
    if (!selected) return
    const current = restaurants.find((restaurant) => restaurant.id === selected.id)
    if (current && current !== selected) setSelected(current)
  }, [restaurants, selected])

  useEffect(
    () => () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current)
      routeAbortRef.current?.abort()
    },
    [],
  )

  const visibleRestaurants = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    const nextRestaurants = restaurants.filter((restaurant) => {
      const matchesSpecialty =
        activeSpecialty === 'All' || restaurant.specialty === activeSpecialty
      const searchable = `${restaurant.name} ${restaurant.specialty} ${specialtyLabels[language][restaurant.specialty]} ${restaurant.blurb}`.toLowerCase()
      return matchesSpecialty && (!normalized || searchable.includes(normalized))
    })

    return [...nextRestaurants].sort((first, second) => {
      if (sortBy === 'rating') return second.snapshotRating - first.snapshotRating
      if (sortBy === 'price') return first.budgetEur.min - second.budgetEur.min
      if (sortBy === 'distance' && userLocation) {
        return distanceBetween(userLocation, first) - distanceBetween(userLocation, second)
      }
      return first.id - second.id
    })
  }, [activeSpecialty, language, query, restaurants, sortBy, userLocation])

  const startLocationWatch = useCallback(() => {
    if (!navigator.geolocation || watchIdRef.current !== null) return
    watchIdRef.current = navigator.geolocation.watchPosition(
      ({ coords, timestamp }) => {
        setUserLocation({
          lat: coords.latitude,
          lng: coords.longitude,
          accuracy: coords.accuracy,
          timestamp,
        })
        setLocationStatus('ready')
        setLocationError('')
      },
      (error) => {
        if (error.code === 1) {
          setLocationError(
            tr(
              '定位权限已关闭，请在浏览器设置中重新允许',
              'Location access is disabled. Please allow it in your browser settings.',
              'La géolocalisation est désactivée. Autorisez-la dans votre navigateur.',
            ),
          )
        }
      },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 15000 },
    )
  }, [tr])

  const locateMe = useCallback(async () => {
    setLocationStatus('loading')
    setLocationError('')
    try {
      const position = await getCurrentPosition(language)
      setUserLocation(position)
      setLocationStatus('ready')
      startLocationWatch()
      return position
    } catch (error) {
      setLocationStatus('error')
      setLocationError(error.message)
      throw error
    }
  }, [language, startLocationWatch])

  const calculateRoute = useCallback(async (origin, destination, background = false) => {
    routeAbortRef.current?.abort()
    const controller = new AbortController()
    routeAbortRef.current = controller
    if (!background) setRouteStatus('loading')
    setRouteError('')

    try {
      const nextRoute = await fetchWalkingRoute(origin, destination, controller.signal, language)
      setRoute(nextRoute)
      setRouteStatus('ready')
      lastRouteOriginRef.current = origin
      lastRerouteAtRef.current = Date.now()
    } catch (error) {
      if (error.name === 'AbortError') return
      setRouteStatus('error')
      setRouteError(error.message)
    }
  }, [language])

  async function startNavigation() {
    if (!selected) return
    try {
      const origin = userLocation || (await locateMe())
      await calculateRoute(origin, selected)
    } catch {
      setRouteError(
        tr(
          '无法开始导航，请确认已经授予定位权限',
          'Navigation could not start. Please allow location access.',
          'Impossible de démarrer la navigation. Autorisez la géolocalisation.',
        ),
      )
    }
  }

  useEffect(() => {
    if (!route || !selected || !userLocation || !lastRouteOriginRef.current) return
    const moved = distanceBetween(lastRouteOriginRef.current, userLocation)
    const enoughTimePassed = Date.now() - lastRerouteAtRef.current > 25000
    if (moved >= 60 && enoughTimePassed) {
      calculateRoute(userLocation, selected, true)
    }
  }, [calculateRoute, route, selected, userLocation])

  function stopNavigation() {
    routeAbortRef.current?.abort()
    setRoute(null)
    setRouteStatus('idle')
    setRouteError('')
    lastRouteOriginRef.current = null
  }

  function clearSelection() {
    setSelected(null)
    stopNavigation()
  }

  const handleMapUnavailable = useCallback(() => setMapEngine('open'), [])

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#eef1f5]">
      <div className="border-b border-paris-navy/8 bg-white px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-base font-black text-paris-navy">
              {tr('巴黎餐厅与步行导航', 'Paris restaurants & walking routes', 'Restaurants et itinéraires à Paris')}
            </p>
            <p className="text-[11px] text-paris-ink/50">
              {tr(
                '所有路线都直接显示在本站，不再跳转外部地图',
                'Routes stay inside this site—no redirect to another map',
                'Les itinéraires restent sur ce site, sans redirection',
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-paris-navy/[0.05] px-3 py-1.5 text-[11px] font-semibold text-paris-ink/60">
              <Map size={13} aria-hidden="true" />
              {mapEngine === 'google'
                ? tr('Google Maps 已接入', 'Google Maps connected', 'Google Maps connecté')
                : tr('OpenStreetMap 在线底图', 'OpenStreetMap live map', 'Carte OpenStreetMap')}
            </span>
            <button
              type="button"
              onClick={() => locateMe().catch(() => {})}
              disabled={locationStatus === 'loading'}
              className="inline-flex items-center gap-1.5 rounded-full bg-paris-blue px-3 py-1.5 text-[11px] font-bold text-white disabled:opacity-60"
            >
              {locationStatus === 'loading' ? (
                <LoaderCircle size={13} className="animate-spin" aria-hidden="true" />
              ) : (
                <Crosshair size={13} aria-hidden="true" />
              )}
              {userLocation
                ? tr(
                    `定位精度约 ${Math.round(userLocation.accuracy)} 米`,
                    `Accuracy about ${Math.round(userLocation.accuracy)} m`,
                    `Précision d’environ ${Math.round(userLocation.accuracy)} m`,
                  )
                : tr('获取我的位置', 'Locate me', 'Me localiser')}
            </button>
          </div>
        </div>
        {locationError && (
          <p role="alert" className="mx-auto mt-2 max-w-[1500px] text-right text-[11px] text-red-600">
            {locationError}
          </p>
        )}
      </div>

      <div className="mx-auto flex min-h-0 w-full max-w-[1500px] flex-1 flex-col overflow-hidden md:flex-row">
        <aside className="order-2 flex max-h-[49vh] min-h-0 w-full flex-col border-t border-paris-navy/10 bg-[#f8f8f6] md:order-1 md:max-h-none md:w-[410px] md:border-r md:border-t-0">
          {selected ? (
            <SelectedRestaurant
              restaurant={selected}
              userLocation={userLocation}
              route={route}
              routeStatus={routeStatus}
              routeError={routeError}
              onBack={clearSelection}
              onNavigate={startNavigation}
              onStop={stopNavigation}
            />
          ) : (
            <>
              <div className="space-y-3 border-b border-paris-navy/8 bg-white p-4">
                <div className="relative">
                  <Search
                    size={17}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-paris-ink/35"
                    aria-hidden="true"
                  />
                  <label htmlFor="restaurant-search" className="sr-only">
                    {tr('搜索餐厅或菜系', 'Search restaurant or cuisine', 'Rechercher un restaurant')}
                  </label>
                  <input
                    id="restaurant-search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={tr(
                      '搜索餐厅、菜系或关键词',
                      'Search restaurants or cuisines',
                      'Rechercher un restaurant ou une cuisine',
                    )}
                    className="w-full rounded-xl border border-paris-navy/10 bg-paris-cream/60 py-2.5 pl-10 pr-3 text-sm outline-none transition placeholder:text-paris-ink/35 focus:border-paris-blue focus:ring-2 focus:ring-paris-blue/10"
                  />
                </div>

                <div
                  className="thin-scrollbar flex gap-2 overflow-x-auto pb-1"
                  aria-label={tr('餐厅分类筛选', 'Restaurant filters', 'Filtres des restaurants')}
                >
                  {['All', ...specialties].map((specialty) => (
                    <button
                      key={specialty}
                      type="button"
                      onClick={() => setActiveSpecialty(specialty)}
                      aria-pressed={activeSpecialty === specialty}
                      className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold transition ${
                        activeSpecialty === specialty
                          ? 'bg-paris-navy text-white'
                          : 'bg-paris-navy/[0.05] text-paris-ink/60 hover:bg-paris-navy/10'
                      }`}
                    >
                      {specialtyLabels[language][specialty]}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-paris-ink/50">
                    {tr(
                      `找到 ${visibleRestaurants.length} 家餐厅`,
                      `${visibleRestaurants.length} restaurants found`,
                      `${visibleRestaurants.length} restaurants trouvés`,
                    )}
                  </p>
                  <label className="relative">
                    <span className="sr-only">
                      {tr('餐厅排序', 'Restaurant sort', 'Tri des restaurants')}
                    </span>
                    <select
                      value={sortBy}
                      onChange={(event) => setSortBy(event.target.value)}
                      className="appearance-none rounded-lg border border-paris-navy/10 bg-white py-1.5 pl-2.5 pr-7 text-[11px] font-semibold text-paris-navy outline-none focus:border-paris-blue"
                    >
                      <option value="recommended">{tr('默认排序', 'Default order', 'Tri par défaut')}</option>
                      <option value="distance">{tr('距离最近', 'Nearest', 'Les plus proches')}</option>
                      <option value="rating">{tr('评分最高', 'Top rated', 'Mieux notés')}</option>
                      <option value="price">{tr('价格较低', 'Lower price', 'Prix plus bas')}</option>
                    </select>
                    <ChevronDown
                      size={13}
                      className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2"
                      aria-hidden="true"
                    />
                  </label>
                </div>
              </div>

              <div className="thin-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
                {visibleRestaurants.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    selected={false}
                    distance={distanceBetween(userLocation, restaurant)}
                    onSelect={handleSelect}
                  />
                ))}
                {visibleRestaurants.length === 0 && (
                  <div className="grid place-items-center px-6 py-12 text-center">
                    <Utensils size={28} className="text-paris-ink/20" aria-hidden="true" />
                    <p className="mt-3 text-sm font-bold text-paris-navy">
                      {tr('没有找到匹配餐厅', 'No matching restaurant', 'Aucun restaurant correspondant')}
                    </p>
                    <p className="mt-1 text-xs text-paris-ink/45">
                      {tr(
                        '请尝试清除关键词或切换分类',
                        'Clear the search or choose another category',
                        'Effacez la recherche ou changez de catégorie',
                      )}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 border-t border-paris-navy/8 bg-white px-4 py-2 text-[10px] leading-4 text-paris-ink/45">
                <Database size={13} className="shrink-0" aria-hidden="true" />
                {tr(
                  '预算为每人估算区间，评分为历史快照，不代表实时状态',
                  'Budgets are per-person estimates; ratings are a historical snapshot',
                  'Budgets estimés par personne ; notes issues d’un instantané historique',
                )}
              </div>
            </>
          )}
        </aside>

        <section
          className="relative order-1 min-h-[43vh] min-w-0 flex-1 md:order-2 md:min-h-0"
          aria-label={tr('站内导航地图', 'In-app navigation map', 'Carte de navigation intégrée')}
        >
          {mapEngine === 'google' ? (
            <GoogleRestaurantMap
              apiKey={googleMapsApiKey}
              restaurants={visibleRestaurants}
              selected={selected}
              onSelect={handleSelect}
              userLocation={userLocation}
              route={route}
              onUnavailable={handleMapUnavailable}
            />
          ) : (
            <LeafletRestaurantMap
              restaurants={visibleRestaurants}
              selected={selected}
              onSelect={handleSelect}
              userLocation={userLocation}
              route={route}
            />
          )}
          <div className="pointer-events-none absolute bottom-4 left-1/2 z-[500] -translate-x-1/2 rounded-full border border-white/70 bg-paris-navy/90 px-3 py-1.5 text-[10px] font-semibold text-white shadow-lg backdrop-blur">
            <span className="inline-flex items-center gap-1.5">
              <LocateFixed size={12} aria-hidden="true" />
              {tr(
                '点击编号标记查看详情与路线',
                'Select a numbered marker for details and routes',
                'Sélectionnez un repère numéroté pour les détails',
              )}
            </span>
          </div>
        </section>
      </div>
    </div>
  )
}
