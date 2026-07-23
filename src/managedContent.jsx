import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { attractions as baseAttractions } from './data/guideKnowledge.js'
import { restaurants as baseRestaurants } from './data/restaurants.js'
import { fetchManagedContent, mergeManagedContent } from './services/managedContent.js'

const ManagedContentContext = createContext(null)

export function ManagedContentProvider({ children }) {
  const [content, setContent] = useState({
    restaurants: baseRestaurants,
    attractions: baseAttractions,
    updatedAt: null,
  })
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    const controller = new AbortController()
    fetchManagedContent(controller.signal)
      .then((payload) => {
        setContent(mergeManagedContent(payload))
        setStatus('ready')
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setStatus('fallback')
      })
    return () => controller.abort()
  }, [])

  const value = useMemo(() => ({ ...content, status }), [content, status])
  return <ManagedContentContext.Provider value={value}>{children}</ManagedContentContext.Provider>
}

export function useManagedContent() {
  const context = useContext(ManagedContentContext)
  if (!context) throw new Error('useManagedContent must be used inside ManagedContentProvider')
  return context
}

