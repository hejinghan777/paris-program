import { Bot, Home, MapPinned } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/chat', label: 'Trip Guide', icon: Bot },
  { to: '/map', label: 'Restaurants', icon: MapPinned },
]

export default function Header() {
  return (
    <header className="z-[1000] shrink-0 bg-paris-navy text-paris-cream shadow-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-3 py-3 sm:px-4">
        <NavLink to="/" className="shrink-0 text-base font-semibold tracking-wide sm:text-lg">
          Bonjour <span className="text-paris-gold">Paris</span>
        </NavLink>

        <nav aria-label="Primary navigation" className="flex min-w-0 gap-1">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              aria-label={label}
              className={({ isActive }) =>
                `flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm font-medium transition-colors sm:px-3 ${
                  isActive
                    ? 'bg-paris-gold text-paris-navy'
                    : 'text-paris-cream/80 hover:bg-white/10 hover:text-paris-cream'
                }`
              }
            >
              <Icon aria-hidden="true" size={16} />
              <span className="hidden min-[430px]:inline">{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
