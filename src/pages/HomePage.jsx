import { ArrowRight, Bot, Database, LocateFixed, MapPinned, Sparkles, Utensils } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n'

export default function HomePage() {
  const { tr } = useLanguage()

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
                  <h2 className="mt-2 text-2xl font-bold">
                    {tr('从当前位置出发', 'Start from your location', 'Partez de votre position')}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-white/60">
                    {tr(
                      '选择地点后，路线和餐厅信息会直接显示在网站内。',
                      'Choose a place to see its details and route without leaving the site.',
                      'Choisissez un lieu pour afficher les détails et l’itinéraire sans quitter le site.',
                    )}
                  </p>
                </div>
                <div className="rounded-2xl bg-paris-red p-3 shadow-lg">
                  <LocateFixed size={24} aria-hidden="true" />
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  {
                    icon: Utensils,
                    title: tr('餐厅资料库', 'Restaurant database', 'Base de restaurants'),
                    text: tr(
                      '按菜系、价格和距离筛选',
                      'Filter by cuisine, price and distance',
                      'Filtres par cuisine, prix et distance',
                    ),
                  },
                  {
                    icon: Database,
                    title: tr('可信地点资料', 'Trusted place data', 'Données fiables'),
                    text: tr(
                      '推荐附带官方信息来源',
                      'Recommendations include official sources',
                      'Recommandations avec sources officielles',
                    ),
                  },
                ].map(({ icon: Icon, title, text }) => (
                  <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <Icon size={19} className="text-[#8db7ff]" aria-hidden="true" />
                    <p className="mt-3 text-sm font-bold">{title}</p>
                    <p className="mt-1 text-xs leading-5 text-white/55">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-3 py-4 sm:px-5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_5px_rgba(16,185,129,0.12)]" />
              <div>
                <p className="text-sm font-bold text-paris-navy">
                  {tr('核心功能已可用', 'Core features are ready', 'Fonctions principales disponibles')}
                </p>
                <p className="text-xs text-paris-ink/50">
                  {tr(
                    '定位、路线、餐厅和数据库推荐',
                    'Location, routes, restaurants and database picks',
                    'Position, itinéraires, restaurants et recommandations',
                  )}
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-700">Ready</span>
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
