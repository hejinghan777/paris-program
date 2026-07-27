import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import HomePage from './pages/HomePage'

const AdminPage = lazy(() => import('./pages/AdminPage'))
const ChatPage = lazy(() => import('./pages/ChatPage'))
const MapPage = lazy(() => import('./pages/MapPage'))

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-[#17446c] text-paris-ink">
      <a
        href="#main-content"
        className="fixed left-3 top-3 z-[2000] -translate-y-24 rounded-xl bg-white px-4 py-2 text-sm font-bold text-paris-navy shadow-card transition focus:translate-y-0"
      >
        Skip to content
      </a>
      <Header />
      <main id="main-content" className="site-tech-canvas flex min-h-0 flex-1 flex-col">
        <Suspense
          fallback={
            <div
              role="status"
              className="flex flex-1 items-center justify-center gap-3 text-sm font-bold text-white/70"
            >
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-paris-blue" />
              Loading page…
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  )
}
