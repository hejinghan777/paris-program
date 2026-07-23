import { attractions as baseAttractions } from '../data/guideKnowledge.js'
import { restaurants as baseRestaurants } from '../data/restaurants.js'

const guideApiUrl = import.meta.env.VITE_GUIDE_API_URL?.trim().replace(/\/+$/, '')
const sessionKey = 'paris-guide-admin-session'

function mergeLocalized(baseValue, overrideValue) {
  return {
    ...(baseValue || {}),
    ...(overrideValue || {}),
  }
}

function mergeHours(baseValue, overrideValue) {
  if (!overrideValue) return baseValue
  return {
    ...(baseValue || {}),
    ...overrideValue,
    summary: mergeLocalized(baseValue?.summary, overrideValue.summary),
    note: mergeLocalized(baseValue?.note, overrideValue.note),
  }
}

export function mergeManagedContent(payload = {}) {
  const restaurantOverrides = payload.restaurantOverrides || {}
  const attractionOverrides = payload.attractionOverrides || {}

  return {
    restaurants: baseRestaurants.map((restaurant) => {
      const override = restaurantOverrides[restaurant.id]
      if (!override) return restaurant
      return {
        ...restaurant,
        ...override,
        budgetEur: { ...restaurant.budgetEur, ...override.budgetEur },
        openingHours: mergeHours(restaurant.openingHours, override.openingHours),
      }
    }),
    attractions: baseAttractions.map((attraction) => {
      const override = attractionOverrides[attraction.id]
      if (!override) return attraction
      return {
        ...attraction,
        ...override,
        visitingHours: mergeHours(attraction.visitingHours, override.visitingHours),
      }
    }),
    updatedAt: payload.updatedAt || null,
  }
}

async function apiRequest(path, options = {}) {
  if (!guideApiUrl) throw new Error('CONTENT_API_NOT_CONFIGURED')
  const response = await fetch(`${guideApiUrl}${path}`, options)
  let payload = {}
  try {
    payload = await response.json()
  } catch {
    // A readable error is provided below.
  }
  if (!response.ok) {
    const error = new Error(payload.error || 'REQUEST_FAILED')
    error.status = response.status
    error.payload = payload
    throw error
  }
  return payload
}

export function hasManagedContentApi() {
  return Boolean(guideApiUrl)
}

export async function fetchManagedContent(signal) {
  return apiRequest('/content', { signal })
}

export function getAdminSession() {
  return window.sessionStorage.getItem(sessionKey) || ''
}

export function setAdminSession(token) {
  if (token) window.sessionStorage.setItem(sessionKey, token)
  else window.sessionStorage.removeItem(sessionKey)
}

export async function adminLogin(password) {
  const payload = await apiRequest('/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })
  setAdminSession(payload.token)
  return payload
}

function adminHeaders() {
  return {
    Authorization: `Bearer ${getAdminSession()}`,
    'Content-Type': 'application/json',
  }
}

export function fetchAdminContent() {
  return apiRequest('/admin/content', { headers: adminHeaders() })
}

export function saveAdminContent(content) {
  return apiRequest('/admin/content', {
    method: 'PUT',
    headers: adminHeaders(),
    body: JSON.stringify(content),
  })
}

export async function adminLogout() {
  try {
    await apiRequest('/admin/logout', {
      method: 'DELETE',
      headers: adminHeaders(),
    })
  } finally {
    setAdminSession('')
  }
}

