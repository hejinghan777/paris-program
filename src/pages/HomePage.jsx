import { Bot, MapPinned } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-10 px-4 py-12 text-center sm:py-16">
      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-paris-gold">
          Curated for curious travellers
        </p>
        <h1 className="text-4xl font-bold text-paris-navy sm:text-5xl">
          Your AI guide to <span className="text-paris-gold">Paris</span>
        </h1>
        <p className="mx-auto max-w-xl leading-7 text-paris-navy/70">
          Chat with a trip guide for attractions, itineraries and current travel tips — then explore a
          transparent, source-labelled restaurant snapshot on an interactive map.
        </p>
      </div>

      <div className="grid w-full gap-6 sm:grid-cols-2">
        <Link
          to="/chat"
          className="group flex flex-col items-center gap-3 rounded-2xl border border-paris-navy/10 bg-white p-8 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-paris-gold"
        >
          <Bot aria-hidden="true" className="text-paris-gold" size={36} />
          <span className="text-lg font-semibold text-paris-navy">Ask the Trip Guide</span>
          <span className="text-sm text-paris-navy/60">Attractions, itineraries, budget and verified transport links</span>
        </Link>

        <Link
          to="/map"
          className="group flex flex-col items-center gap-3 rounded-2xl border border-paris-navy/10 bg-white p-8 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-paris-gold"
        >
          <MapPinned aria-hidden="true" className="text-paris-gold" size={36} />
          <span className="text-lg font-semibold text-paris-navy">Find a Restaurant</span>
          <span className="text-sm text-paris-navy/60">Explore the recovered collection by specialty</span>
        </Link>
      </div>
    </div>
  )
}
