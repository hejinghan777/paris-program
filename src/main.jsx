import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import 'leaflet/dist/leaflet.css'
import './styles.css'
import App from './App'
import { LanguageProvider } from './i18n'
import { ManagedContentProvider } from './managedContent'

const Router = import.meta.env.VITE_DEPLOY_TARGET === 'github-pages' ? HashRouter : BrowserRouter

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <ManagedContentProvider>
        <Router>
          <App />
        </Router>
      </ManagedContentProvider>
    </LanguageProvider>
  </React.StrictMode>,
)
