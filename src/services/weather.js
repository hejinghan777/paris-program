const PARIS_COORDINATES = {
  latitude: 48.8566,
  longitude: 2.3522,
}

const WEATHER_LABELS = {
  clear: {
    zh: '晴朗',
    en: 'Clear',
    fr: 'Dégagé',
  },
  partlyCloudy: {
    zh: '少云',
    en: 'Partly cloudy',
    fr: 'Partiellement nuageux',
  },
  cloudy: {
    zh: '多云',
    en: 'Cloudy',
    fr: 'Nuageux',
  },
  fog: {
    zh: '有雾',
    en: 'Foggy',
    fr: 'Brouillard',
  },
  drizzle: {
    zh: '小雨',
    en: 'Drizzle',
    fr: 'Bruine',
  },
  rain: {
    zh: '有雨',
    en: 'Rain',
    fr: 'Pluie',
  },
  snow: {
    zh: '有雪',
    en: 'Snow',
    fr: 'Neige',
  },
  showers: {
    zh: '阵雨',
    en: 'Showers',
    fr: 'Averses',
  },
  thunderstorm: {
    zh: '雷雨',
    en: 'Thunderstorm',
    fr: 'Orage',
  },
}

function weatherKind(code) {
  if (code === 0) return 'clear'
  if ([1, 2].includes(code)) return 'partlyCloudy'
  if (code === 3) return 'cloudy'
  if ([45, 48].includes(code)) return 'fog'
  if ([51, 53, 55, 56, 57].includes(code)) return 'drizzle'
  if ([61, 63, 65, 66, 67].includes(code)) return 'rain'
  if ([71, 73, 75, 77].includes(code)) return 'snow'
  if ([80, 81, 82, 85, 86].includes(code)) return 'showers'
  if ([95, 96, 99].includes(code)) return 'thunderstorm'
  return 'cloudy'
}

export function getWeatherPresentation(code, language = 'zh') {
  const kind = weatherKind(code)
  return {
    kind,
    label: WEATHER_LABELS[kind][language] || WEATHER_LABELS[kind].zh,
  }
}

export async function fetchParisWeather(signal) {
  const params = new URLSearchParams({
    latitude: String(PARIS_COORDINATES.latitude),
    longitude: String(PARIS_COORDINATES.longitude),
    current: 'temperature_2m,apparent_temperature,weather_code,wind_speed_10m',
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    timezone: 'Europe/Paris',
    forecast_days: '1',
  })
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal })
  if (!response.ok) throw new Error('Weather service unavailable')
  const payload = await response.json()
  if (!payload.current || !payload.daily?.time?.length) {
    throw new Error('Weather data unavailable')
  }

  return {
    temperature: Math.round(payload.current.temperature_2m),
    apparentTemperature: Math.round(payload.current.apparent_temperature),
    weatherCode: payload.current.weather_code,
    windSpeed: Math.round(payload.current.wind_speed_10m),
    maximumTemperature: Math.round(payload.daily.temperature_2m_max[0]),
    minimumTemperature: Math.round(payload.daily.temperature_2m_min[0]),
    precipitationProbability: Math.round(payload.daily.precipitation_probability_max[0] || 0),
    observedAt: payload.current.time,
  }
}
