import { buildGuideContext, getLocalGuideAnswer } from './guideEngine.js'

const guideApiUrl = import.meta.env.VITE_GUIDE_API_URL?.trim()

export function hasRemoteGuide() {
  return Boolean(guideApiUrl)
}

export async function askGuide(message, language = 'zh') {
  const localAnswer = getLocalGuideAnswer(message, language)
  if (!guideApiUrl) return localAnswer

  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 20000)

  try {
    const response = await fetch(guideApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        language,
        context: buildGuideContext(message),
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
    }
  } catch {
    return {
      ...localAnswer,
      provider: `${localAnswer.provider}（AI 服务暂时不可用，已自动回退）`,
    }
  } finally {
    window.clearTimeout(timeout)
  }
}
