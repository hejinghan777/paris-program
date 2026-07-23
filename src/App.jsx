import { Navigate, Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import AdminPage from './pages/AdminPage'
import ChatPage from './pages/ChatPage'
import HomePage from './pages/HomePage'
import MapPage from './pages/MapPage'

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-paris-cream text-paris-ink">
      <Header />
      <main className="flex min-h-0 flex-1 flex-col">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
