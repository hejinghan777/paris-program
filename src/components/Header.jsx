import { useRef } from 'react'
import { Bot, Check, ChevronDown, Home, Languages, LockKeyhole, MapPinned } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useLanguage } from '../i18n'

export default function Header() {
  const { language, setLanguage, tr, languageMeta } = useLanguage()
  const languageMenuRef = useRef(null)
  const links = [
    { to: '/', label: tr('首页', 'Home', 'Accueil'), icon: Home, end: true },
    { to: '/chat', label: tr('智能导游', 'Smart guide', 'Guide intelligent'), icon: Bot },
    { to: '/map', label: tr('地图导航', 'Map', 'Carte'), icon: MapPinned },
    { to: '/admin', label: tr('管理', 'Admin', 'Admin'), icon: LockKeyhole },
  ]

  function chooseLanguage(nextLanguage) {
    setLanguage(nextLanguage)
    if (languageMenuRef.current) languageMenuRef.current.open = false
  }

  return (
    <header className="z-[1000] shrink-0 border-b border-white/10 bg-paris-navy text-white shadow-[0_8px_30px_rgba(12,29,57,0.16)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-3 sm:px-6">
        <NavLink to="/" className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-sm font-black text-paris-blue shadow-sm">
            FR
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold tracking-wide sm:text-base">
              {tr(
                '法国研学第一组导游地图',
                'France Study Tour · Group 1',
                'Voyage d’étude en France · Groupe 1',
              )}
            </span>
            <span className="hidden text-[10px] uppercase tracking-[0.22em] text-white/55 sm:block">
              {tr('Paris Study Tour · Group 1', 'Guide map for Paris', 'Carte-guide de Paris')}
            </span>
          </span>
        </NavLink>

        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
          <nav
            aria-label={tr('主导航', 'Primary navigation', 'Navigation principale')}
            className="flex min-w-0 gap-1 rounded-full border border-white/10 bg-white/5 p-1"
          >
            {links.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                aria-label={label}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold transition sm:px-3 sm:text-sm ${
                    isActive
                      ? 'bg-white text-paris-navy shadow-sm'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon aria-hidden="true" size={16} />
                <span className="hidden min-[560px]:inline">{label}</span>
              </NavLink>
            ))}
          </nav>

          <details ref={languageMenuRef} className="group relative">
            <summary
              className="flex cursor-pointer list-none items-center gap-1 rounded-full border border-white/15 bg-white/8 px-2.5 py-2 text-xs font-bold text-white transition hover:bg-white/15 [&::-webkit-details-marker]:hidden"
              aria-label={tr('切换语言', 'Change language', 'Changer de langue')}
            >
              <Languages size={15} aria-hidden="true" />
              <span>{languageMeta[language].short}</span>
              <ChevronDown size={12} className="transition group-open:rotate-180" aria-hidden="true" />
            </summary>
            <div className="absolute right-0 top-[calc(100%+0.6rem)] z-[1200] w-40 overflow-hidden rounded-2xl border border-paris-navy/10 bg-white p-1.5 text-paris-navy shadow-[0_18px_50px_rgba(12,29,57,0.24)]">
              {Object.entries(languageMeta).map(([code, meta]) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => chooseLanguage(code)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                    language === code ? 'bg-paris-blue/8 text-paris-blue' : 'hover:bg-paris-navy/[0.05]'
                  }`}
                >
                  <span>{meta.label}</span>
                  {language === code && <Check size={14} aria-hidden="true" />}
                </button>
              ))}
            </div>
          </details>
        </div>
      </div>
    </header>
  )
}
