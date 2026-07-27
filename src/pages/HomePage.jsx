import { useEffect, useState } from 'react'
import {
  ArrowRight,
  Bot,
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSun,
  Droplets,
  LoaderCircle,
  MapPinned,
  RefreshCw,
  Snowflake,
  Sparkles,
  Sun,
  Thermometer,
  Wind,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n'
import { fetchParisWeather, getWeatherPresentation } from '../services/weather'

function WeatherIcon({ kind, ...props }) {
  if (kind === 'clear') return <Sun {...props} />
  if (kind === 'partlyCloudy') return <CloudSun {...props} />
  if (kind === 'fog') return <CloudFog {...props} />
  if (kind === 'rain' || kind === 'drizzle' || kind === 'showers') return <CloudRain {...props} />
  if (kind === 'snow') return <Snowflake {...props} />
  if (kind === 'thunderstorm') return <CloudLightning {...props} />
  return <Cloud {...props} />
}

export default function HomePage() {
  const { language, tr } = useLanguage()
  const [weather, setWeather] = useState(null)
  const [weatherStatus, setWeatherStatus] = useState('loading')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setWeatherStatus('loading')
    fetchParisWeather(controller.signal)
      .then((nextWeather) => {
        setWeather(nextWeather)
        setWeatherStatus('ready')
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setWeatherStatus('error')
      })
    return () => controller.abort()
  }, [refreshKey])

  const weatherPresentation = getWeatherPresentation(weather?.weatherCode, language)
  const actionCardClass =
    'group flex min-h-24 items-center gap-4 rounded-[1.4rem] border border-white/75 bg-white/90 p-4 text-left text-paris-navy shadow-[0_18px_45px_rgba(13,45,75,0.16)] backdrop-blur transition hover:-translate-y-1 hover:bg-white hover:shadow-[0_22px_55px_rgba(13,45,75,0.2)] focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-[#17446c]'

  return (
    <div className="relative flex flex-1 flex-col overflow-x-hidden bg-[#17446c] text-white">
      <img
        src={`${import.meta.env.BASE_URL}hero-eiffel-tech.png`}
        alt=""
        aria-hidden="true"
        fetchPriority="high"
        decoding="async"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[68%_center] brightness-[1.18] contrast-[0.94] saturate-[0.88]"
      />
      <div className="home-hero-shade pointer-events-none absolute inset-0" />
      <div className="hero-grid pointer-events-none absolute inset-0 opacity-15" />
      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-paris-blue/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-cyan-300/10 blur-3xl" />

      <section className="relative mx-auto grid w-full max-w-7xl flex-1 items-center gap-12 px-5 py-10 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:py-14">
        <div className="max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-3.5 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-cyan-200 shadow-[0_10px_35px_rgba(0,0,0,0.16)] backdrop-blur">
            <Sparkles size={14} className="text-cyan-300" aria-hidden="true" />
            {tr(
              '研学行程 · 智能推荐 · 实时定位',
              'Study routes · Smart picks · Live location',
              'Parcours d’étude · Conseils intelligents · Position',
            )}
          </div>
          <h1 className="text-4xl font-black leading-[1.04] tracking-[-0.04em] text-white sm:text-5xl lg:text-[4rem]">
            {tr('让每一次巴黎探索，', 'Give every Paris discovery', 'Donnez à chaque découverte de Paris')}
            <span className="mt-2 block text-cyan-300">
              {tr('都有清晰的下一步。', 'a clear next step.', 'une prochaine étape claire.')}
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-white/65 sm:text-lg">
            {tr(
              '从个性化推荐到步行导航，智能导游结合真实地点数据，帮助你快速找到合适的餐厅与研学地点，并将选择转化为可以立即出发的路线。',
              'From personal recommendations to walking navigation, the smart guide uses real place data to help you find the right restaurants and study locations, then turns your choice into a route ready to follow.',
              'Des recommandations personnalisées à la navigation à pied, le guide utilise des données réelles pour trouver les bons restaurants et lieux d’étude, puis transforme votre choix en itinéraire prêt à suivre.',
            )}
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Link
              to="/chat"
              className={actionCardClass}
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#2367a6] text-white shadow-[0_8px_22px_rgba(27,82,171,0.2)]">
                <Bot size={22} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-black">
                  {tr('咨询智能导游', 'Ask the smart guide', 'Consulter le guide')}
                </span>
                <span className="mt-1 block text-[11px] leading-4 text-paris-ink/50">
                  {tr('告诉我预算、偏好或时间', 'Share your budget, preferences or time', 'Indiquez budget, préférences ou temps')}
                </span>
              </span>
              <ArrowRight size={17} className="transition group-hover:translate-x-1" aria-hidden="true" />
            </Link>
            <Link
              to="/map"
              className={actionCardClass}
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#2367a6] text-white shadow-[0_8px_22px_rgba(27,82,171,0.2)]">
                <MapPinned size={22} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-black">
                  {tr('打开站内地图', 'Open the map', 'Ouvrir la carte')}
                </span>
                <span className="mt-1 block text-[11px] leading-4 text-paris-ink/50">
                  {tr('筛选餐厅并开始步行导航', 'Filter places and start walking', 'Filtrez les lieux et commencez à marcher')}
                </span>
              </span>
              <ArrowRight size={17} className="text-paris-blue transition group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>

          <dl className="mt-8 grid max-w-xl grid-cols-3 divide-x divide-white/20 rounded-2xl border border-white/20 bg-white/10 px-2 py-4 shadow-[0_12px_35px_rgba(13,45,75,0.12)] backdrop-blur">
            {[
              ['26', tr('餐厅资料', 'Restaurants', 'Restaurants')],
              ['11', tr('餐饮分类', 'Categories', 'Catégories')],
              [tr('站内', 'In-app', 'Intégré'), tr('步行导航', 'Walking routes', 'Itinéraires à pied')],
            ].map(([value, label]) => (
              <div key={label} className="px-3 text-center">
                <dt className="text-xl font-black tracking-tight text-white sm:text-2xl">{value}</dt>
                <dd className="mt-1 text-[10px] font-semibold text-white/45 sm:text-xs">{label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative mx-auto w-full max-w-xl lg:translate-x-2">
          <div className="pointer-events-none absolute -inset-5 rounded-[2.8rem] border border-white/20 bg-[#b9d6eb]/15 shadow-[0_35px_100px_rgba(13,45,75,0.2)] backdrop-blur-sm" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/30 bg-[#dcebf5]/18 p-2.5 shadow-[0_28px_80px_rgba(13,45,75,0.22)] backdrop-blur-xl">
            <div className="rounded-[1.55rem] border border-white/15 bg-[#123b61]/88 p-5 text-white shadow-inner sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
                    {tr('今日巴黎', 'Today in Paris', 'Aujourd’hui à Paris')}
                  </p>
                  {weather ? (
                    <>
                      <div className="mt-2 flex items-end gap-3">
                        <h2 className="text-5xl font-black tracking-tight">{weather.temperature}°</h2>
                        <p className="pb-1 text-lg font-bold">{weatherPresentation.label}</p>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-white/60">
                        {tr(
                          `体感 ${weather.apparentTemperature}° · 今日 ${weather.minimumTemperature}° 至 ${weather.maximumTemperature}°`,
                          `Feels like ${weather.apparentTemperature}° · ${weather.minimumTemperature}° to ${weather.maximumTemperature}° today`,
                          `Ressenti ${weather.apparentTemperature}° · de ${weather.minimumTemperature}° à ${weather.maximumTemperature}° aujourd’hui`,
                        )}
                      </p>
                    </>
                  ) : (
                    <>
                      <h2 className="mt-2 text-2xl font-bold">
                        {weatherStatus === 'error'
                          ? tr('天气信息暂不可用', 'Weather unavailable', 'Météo indisponible')
                          : tr('正在获取巴黎天气', 'Loading Paris weather', 'Chargement de la météo')}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-white/60">
                        {weatherStatus === 'error'
                          ? tr(
                              '天气服务暂时未响应，可稍后重新加载。',
                              'The weather service did not respond. Try again shortly.',
                              'Le service météo ne répond pas. Réessayez dans un instant.',
                            )
                          : tr(
                              '正在读取巴黎今天的最新预报…',
                              'Fetching today’s latest Paris forecast…',
                              'Récupération des dernières prévisions pour Paris…',
                            )}
                      </p>
                    </>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setRefreshKey((key) => key + 1)}
                  disabled={weatherStatus === 'loading'}
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-paris-red shadow-lg transition hover:scale-105 disabled:cursor-wait"
                  aria-label={tr('刷新天气', 'Refresh weather', 'Actualiser la météo')}
                >
                  {weatherStatus === 'loading' ? (
                    <LoaderCircle size={24} className="animate-spin" aria-hidden="true" />
                  ) : weatherStatus === 'error' ? (
                    <RefreshCw size={22} aria-hidden="true" />
                  ) : (
                    <WeatherIcon kind={weatherPresentation.kind} size={25} aria-hidden="true" />
                  )}
                </button>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  {
                    icon: Thermometer,
                    title: tr('最高 / 最低', 'High / low', 'Max / min'),
                    text: weather ? `${weather.maximumTemperature}° / ${weather.minimumTemperature}°` : '—',
                  },
                  {
                    icon: Droplets,
                    title: tr('降雨概率', 'Chance of rain', 'Risque de pluie'),
                    text: weather ? `${weather.precipitationProbability}%` : '—',
                  },
                  {
                    icon: Wind,
                    title: tr('当前风速', 'Current wind', 'Vent actuel'),
                    text: weather ? `${weather.windSpeed} km/h` : '—',
                  },
                ].map(({ icon: Icon, title, text }) => (
                  <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4">
                    <Icon size={19} className="text-[#8db7ff]" aria-hidden="true" />
                    <p className="mt-3 text-[10px] font-semibold text-white/45 sm:text-xs">{title}</p>
                    <p className="mt-1 text-sm font-black leading-5 text-white sm:text-base">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-3 py-4 text-white sm:px-5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_5px_rgba(16,185,129,0.12)]" />
              <div>
                <p className="text-sm font-bold text-white">
                  {weatherStatus === 'ready'
                    ? tr('巴黎天气预报已更新', 'Paris forecast updated', 'Prévisions de Paris actualisées')
                    : tr('巴黎天气预报', 'Paris weather forecast', 'Prévisions météo de Paris')}
                </p>
                <p className="text-xs text-white/45">
                  {weather
                    ? tr(
                        `当地时间 ${weather.observedAt.slice(11, 16)} · 天气数据 `,
                        `Local time ${weather.observedAt.slice(11, 16)} · Weather data `,
                        `Heure locale ${weather.observedAt.slice(11, 16)} · Données météo `,
                      )
                    : tr('等待天气数据', 'Waiting for weather data', 'En attente des données météo')}
                  {weather && (
                    <a
                      href="https://open-meteo.com/"
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-cyan-300 hover:underline"
                    >
                      Open-Meteo
                    </a>
                  )}
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-300">
                {weatherStatus === 'ready' ? tr('已更新', 'Updated', 'Actualisé') : '—'}
              </span>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative border-t border-white/15 bg-[#123b61]/72 px-5 py-3 text-center text-[11px] text-white/55 backdrop-blur">
        {tr(
          '地图数据 © OpenStreetMap contributors · 路线结果请结合现场交通与道路状况判断',
          'Map data © OpenStreetMap contributors · Check routes against current street conditions',
          'Données cartographiques © contributeurs OpenStreetMap · Vérifiez les conditions sur place',
        )}
      </footer>
    </div>
  )
}
