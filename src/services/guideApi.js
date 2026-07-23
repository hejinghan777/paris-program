import { buildGuideContext, getLocalGuideAnswer } from './guideEngine.js'
import { fetchParisWeather, getWeatherPresentation } from './weather.js'

const guideApiUrl = import.meta.env.VITE_GUIDE_API_URL?.trim()
const weatherSourceUrl = 'https://open-meteo.com/en/docs'

export function hasRemoteGuide() {
  return Boolean(guideApiUrl)
}

function localizedWeatherSource(language) {
  return {
    url: weatherSourceUrl,
    label:
      language === 'en'
        ? 'Open-Meteo live Paris weather'
        : language === 'fr'
          ? 'Météo en direct à Paris — Open-Meteo'
          : 'Open-Meteo 巴黎实时天气',
  }
}

function weatherFallback(weather, language) {
  const condition = getWeatherPresentation(weather.weatherCode, language).label
  if (language === 'en') {
    return `Paris is currently ${condition.toLowerCase()} at ${weather.temperature}°C (feels like ${weather.apparentTemperature}°C). Today’s forecast is ${weather.minimumTemperature}–${weather.maximumTemperature}°C, with a maximum ${weather.precipitationProbability}% chance of precipitation and winds around ${weather.windSpeed} km/h.`
  }
  if (language === 'fr') {
    return `À Paris, le temps est actuellement ${condition.toLowerCase()}, avec ${weather.temperature} °C (ressenti ${weather.apparentTemperature} °C). Les températures prévues aujourd’hui vont de ${weather.minimumTemperature} à ${weather.maximumTemperature} °C, avec un risque maximal de précipitations de ${weather.precipitationProbability} % et un vent d’environ ${weather.windSpeed} km/h.`
  }
  return `巴黎当前${condition}，${weather.temperature}°C，体感 ${weather.apparentTemperature}°C。今天预计 ${weather.minimumTemperature}–${weather.maximumTemperature}°C，最高降水概率 ${weather.precipitationProbability}%，风速约 ${weather.windSpeed} km/h。`
}

export async function askGuide(message, language = 'zh', history = [], managedData = {}) {
  const localAnswer = getLocalGuideAnswer(message, language, managedData)
  if (!guideApiUrl) return localAnswer

  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 20000)

  try {
    const context = buildGuideContext(message, managedData)
    let liveWeather = null
    if (context.intent.weatherRequested) {
      try {
        const weather = await fetchParisWeather(controller.signal)
        liveWeather = {
          ...weather,
          condition: getWeatherPresentation(weather.weatherCode, language).label,
          location: 'Paris, France',
          timezone: 'Europe/Paris',
          source: 'Open-Meteo',
        }
        context.liveWeather = liveWeather
      } catch {
        context.liveWeatherUnavailable = true
      }
    }

    if (context.intent.primary !== 'conversation' && context.intent.primary !== 'weather') {
      context.verifiedDraft = localAnswer.text
    }

    const response = await fetch(guideApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        language,
        history: history.slice(-6).map(({ role, text }) => ({
          role,
          text: String(text || '').slice(0, 700),
        })),
        context,
      }),
      signal: controller.signal,
    })
    if (!response.ok) throw new Error('模型服务暂时不可用')
    const payload = await response.json()
    if (!payload.text) throw new Error('模型没有返回有效内容')
    return {
      ...localAnswer,
      text: payload.text,
      provider: payload.provider || '安全 AI 模型',
      sources: liveWeather
        ? [...(localAnswer.sources || []), localizedWeatherSource(language)]
        : localAnswer.sources,
    }
  } catch {
    const context = buildGuideContext(message, managedData)
    if (context.intent.weatherRequested) {
      try {
        const weather = await fetchParisWeather()
        return {
          ...localAnswer,
          text: weatherFallback(weather, language),
          provider: 'Open-Meteo 实时天气（AI 服务暂时不可用）',
          sources: [...(localAnswer.sources || []), localizedWeatherSource(language)],
        }
      } catch {
        // Keep the normal local fallback below.
      }
    }
    return {
      ...localAnswer,
      provider: `${localAnswer.provider}（AI 服务暂时不可用，已自动回退）`,
    }
  } finally {
    window.clearTimeout(timeout)
  }
}
