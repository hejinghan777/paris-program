const ROUTING_ENDPOINT = 'https://routing.openstreetmap.de/routed-foot/route/v1/foot'

export function distanceBetween(first, second) {
  if (!first || !second) return Number.POSITIVE_INFINITY
  const radius = 6371e3
  const lat1 = (first.lat * Math.PI) / 180
  const lat2 = (second.lat * Math.PI) / 180
  const latDelta = ((second.lat - first.lat) * Math.PI) / 180
  const lngDelta = ((second.lng - first.lng) * Math.PI) / 180
  const value =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(lngDelta / 2) ** 2
  return radius * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value))
}

export function formatDistance(meters, language = 'zh') {
  if (!Number.isFinite(meters)) {
    return language === 'fr' ? 'distance inconnue' : language === 'en' ? 'distance unknown' : '距离未知'
  }
  if (meters < 1000) {
    const value = Math.max(10, Math.round(meters / 10) * 10)
    return language === 'zh' ? `${value} 米` : `${value} m`
  }
  const value = (meters / 1000).toFixed(1)
  return language === 'zh' ? `${value} 公里` : `${value} km`
}

function formatInstruction(step, language) {
  const { maneuver, name } = step
  if (language === 'en') {
    const street = name ? ` onto ${name}` : ''
    if (maneuver.type === 'depart') return `Start${street}`
    if (maneuver.type === 'arrive') return 'Arrive at your destination'
    if (maneuver.type === 'roundabout' || maneuver.type === 'rotary') return `Take the roundabout${street}`
    if (maneuver.modifier) return `Turn ${maneuver.modifier}${street}`
    return `Continue${street}`
  }
  if (language === 'fr') {
    const street = name ? ` vers ${name}` : ''
    if (maneuver.type === 'depart') return `Partez${street}`
    if (maneuver.type === 'arrive') return 'Vous êtes arrivé à destination'
    if (maneuver.type === 'roundabout' || maneuver.type === 'rotary') return `Prenez le rond-point${street}`
    const turns = {
      left: 'Tournez à gauche',
      right: 'Tournez à droite',
      straight: 'Continuez tout droit',
      'slight left': 'Obliquez légèrement à gauche',
      'slight right': 'Obliquez légèrement à droite',
      'sharp left': 'Tournez franchement à gauche',
      'sharp right': 'Tournez franchement à droite',
      uturn: 'Faites demi-tour',
    }
    return `${turns[maneuver.modifier] || 'Continuez'}${street}`
  }

  const road = name ? `进入 ${name}` : ''
  if (maneuver.type === 'depart') return road ? `出发并${road}` : '从当前位置出发'
  if (maneuver.type === 'arrive') return '到达目的地'
  if (maneuver.type === 'roundabout' || maneuver.type === 'rotary') {
    return road ? `进入环岛后${road}` : '进入环岛并按路线前进'
  }
  const modifierLabels = {
    left: '左转',
    right: '右转',
    straight: '直行',
    'slight left': '稍向左转',
    'slight right': '稍向右转',
    'sharp left': '向左急转',
    'sharp right': '向右急转',
    uturn: '掉头',
  }
  const turn = modifierLabels[maneuver.modifier]
  if (turn) return road ? `${turn}，${road}` : turn
  return road ? `继续前行，${road}` : '继续沿路线前行'
}

export function getCurrentPosition(language = 'zh') {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(
        new Error(
          language === 'fr'
            ? 'Votre navigateur ne prend pas en charge la géolocalisation'
            : language === 'en'
              ? 'Your browser does not support geolocation'
              : '当前浏览器不支持定位功能',
        ),
      )
      return
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords, timestamp }) =>
        resolve({
          lat: coords.latitude,
          lng: coords.longitude,
          accuracy: coords.accuracy,
          timestamp,
        }),
      (error) => {
        const messages = {
          zh: {
            1: '定位权限被拒绝，请在浏览器设置中允许位置访问',
            2: '暂时无法确定你的位置，请到开阔区域后重试',
            3: '定位请求超时，请重试',
            fallback: '无法获取当前位置',
          },
          en: {
            1: 'Location access was denied. Please allow it in your browser settings.',
            2: 'Your location is unavailable. Move to an open area and try again.',
            3: 'The location request timed out. Please try again.',
            fallback: 'Unable to get your location',
          },
          fr: {
            1: 'La géolocalisation a été refusée. Autorisez-la dans votre navigateur.',
            2: 'Votre position est indisponible. Réessayez dans un endroit dégagé.',
            3: 'La demande de géolocalisation a expiré. Réessayez.',
            fallback: 'Impossible d’obtenir votre position',
          },
        }
        const selectedMessages = messages[language] || messages.zh
        reject(new Error(selectedMessages[error.code] || selectedMessages.fallback))
      },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 15000 },
    )
  })
}

export async function fetchWalkingRoute(origin, destination, signal, language = 'zh') {
  const url = `${ROUTING_ENDPOINT}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&steps=true`
  const response = await fetch(url, { signal })
  if (!response.ok) {
    throw new Error(
      language === 'fr'
        ? 'Le service d’itinéraire est indisponible. Réessayez plus tard'
        : language === 'en'
          ? 'The in-app routing service is unavailable. Please try again later'
          : '站内路线服务暂时不可用，请稍后重试',
    )
  }

  const payload = await response.json()
  if (payload.code !== 'Ok' || !payload.routes?.length) {
    throw new Error(
      language === 'fr'
        ? 'Aucun itinéraire à pied trouvé'
        : language === 'en'
          ? 'No walking route was found'
          : '未找到适合步行的路线',
    )
  }

  const firstRoute = payload.routes[0]
  return {
    coordinates: firstRoute.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
    distanceMeters: firstRoute.distance,
    durationSeconds: firstRoute.duration,
    steps: firstRoute.legs[0].steps
      .filter((step) => step.distance > 0 || step.maneuver.type === 'arrive')
      .map((step) => ({
        instruction: formatInstruction(step, language),
        distanceMeters: step.distance,
      })),
  }
}

export async function fetchWaypointRoute(points, signal, language = 'zh') {
  if (!Array.isArray(points) || points.length < 2) return null
  const coordinates = points.map((point) => `${point.lng},${point.lat}`).join(';')
  const url = `${ROUTING_ENDPOINT}/${coordinates}?overview=full&geometries=geojson&steps=false`
  const response = await fetch(url, { signal })

  if (!response.ok) {
    throw new Error(
      language === 'fr'
        ? 'Le parcours recommandé est temporairement indisponible'
        : language === 'en'
          ? 'The recommended route is temporarily unavailable'
          : '推荐路线暂时无法生成',
    )
  }

  const payload = await response.json()
  if (payload.code !== 'Ok' || !payload.routes?.length) {
    throw new Error(
      language === 'fr'
        ? 'Aucun parcours à pied trouvé entre ces lieux'
        : language === 'en'
          ? 'No walking route was found between these places'
          : '这些地点之间暂未找到步行路线',
    )
  }

  const route = payload.routes[0]
  return {
    coordinates: route.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
    distanceMeters: route.distance,
    durationSeconds: route.duration,
  }
}
