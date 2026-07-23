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

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <div className="hero-grid pointer-events-none absolute inset-0 opacity-55" />
      <div className="pointer-events-none absolute -left-32 top-16 h-80 w-80 rounded-full bg-paris-blue/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-paris-red/10 blur-3xl" />

      <section className="relative mx-auto grid w-full max-w-7xl flex-1 items-center gap-10 px-5 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-16">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-paris-blue/15 bg-white/80 px-3 py-1.5 text-xs font-semibold text-paris-blue shadow-sm backdrop-blur">
            <Sparkles size={14} aria-hidden="true" />
            {tr(
              '研学行程 · 智能推荐 · 实时定位',
              'Study routes · Smart picks · Live location',
              'Parcours d’étude · Conseils intelligents · Position',
            )}
          </div>
          <h1 className="max-w-3xl text-4xl font-black leading-[1.08] tracking-tight text-paris-navy sm:text-5xl lg:text-6xl">
            {tr('法国研学第一组', 'France Study Tour', 'Voyage d’étude en France')}
            <span className="mt-2 block text-paris-blue">
              {tr('导游地图', 'Group 1 Guide Map', 'Carte-guide du groupe 1')}
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-paris-ink/65 sm:text-lg">
            {tr(
              '一个为巴黎研学行程设计的站内工具：查看餐厅、获取当前位置、规划步行路线，并根据真实地点资料生成更贴合需求的参观建议。',
              'A practical tool for our Paris study tour: explore restaurants, locate yourself, follow walking routes and receive recommendations based on real place data.',
              'Un outil conçu pour notre voyage d’étude à Paris : restaurants, géolocalisation, itinéraires à pied et recommandations fondées sur des données réelles.',
            )}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/map"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-paris-blue px-5 py-3.5 text-sm font-bold text-white shadow-[0_14px_32px_rgba(27,82,171,0.24)] transition hover:-translate-y-0.5 hover:bg-[#16468f] focus:outline-none focus:ring-2 focus:ring-paris-blue focus:ring-offset-2"
            >
              <MapPinned size={18} aria-hidden="true" />
              {tr('打开站内地图', 'Open the map', 'Ouvrir la carte')}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link
              to="/chat"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-paris-navy/10 bg-white px-5 py-3.5 text-sm font-bold text-paris-navy shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-paris-blue focus:ring-offset-2"
            >
              <Bot size={18} aria-hidden="true" />
              {tr('咨询智能导游', 'Ask the smart guide', 'Consulter le guide')}
            </Link>
          </div>

          <dl className="mt-10 grid max-w-xl grid-cols-3 gap-3">
            {[
              ['26', tr('餐厅资料', 'Restaurants', 'Restaurants')],
              ['11', tr('餐饮分类', 'Categories', 'Catégories')],
              [tr('站内', 'In-app', 'Intégré'), tr('步行导航', 'Walking routes', 'Itinéraires à pied')],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-paris-navy/8 bg-white/70 px-3 py-4 backdrop-blur">
                <dt className="text-xl font-black text-paris-navy sm:text-2xl">{value}</dt>
                <dd className="mt-1 text-xs text-paris-ink/55">{label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative mx-auto w-full max-w-xl">
          <div className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/85 p-3 shadow-[0_28px_80px_rgba(12,29,57,0.18)] backdrop-blur">
            <div className="rounded-[1.45rem] bg-paris-navy p-5 text-white sm:p-6">
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

            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-3 py-4 sm:px-5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_5px_rgba(16,185,129,0.12)]" />
              <div>
                <p className="text-sm font-bold text-paris-navy">
                  {weatherStatus === 'ready'
                    ? tr('巴黎天气预报已更新', 'Paris forecast updated', 'Prévisions de Paris actualisées')
                    : tr('巴黎天气预报', 'Paris weather forecast', 'Prévisions météo de Paris')}
                </p>
                <p className="text-xs text-paris-ink/50">
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
                      className="font-semibold text-paris-blue hover:underline"
                    >
                      Open-Meteo
                    </a>
                  )}
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-700">
                {weatherStatus === 'ready' ? tr('已更新', 'Updated', 'Actualisé') : '—'}
              </span>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative border-t border-paris-navy/8 bg-white/55 px-5 py-3 text-center text-[11px] text-paris-ink/45">
        {tr(
          '地图数据 © OpenStreetMap contributors · 路线结果请结合现场交通与道路状况判断',
          'Map data © OpenStreetMap contributors · Check routes against current street conditions',
          'Données cartographiques © contributeurs OpenStreetMap · Vérifiez les conditions sur place',
        )}
      </footer>
    </div>
  )
}
