function corsHeaders(origin, allowedOrigin) {
  return {
    'Access-Control-Allow-Origin': origin === allowedOrigin ? origin : allowedOrigin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  }
}

function jsonResponse(payload, status, cors) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8' },
  })
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || ''
    const allowedOrigin = env.ALLOWED_ORIGIN
    const cors = corsHeaders(origin, allowedOrigin)

    if (request.method === 'OPTIONS') {
      if (origin !== allowedOrigin) return jsonResponse({ error: 'Origin not allowed' }, 403, cors)
      return new Response(null, { status: 204, headers: cors })
    }

    if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, cors)
    if (origin !== allowedOrigin) return jsonResponse({ error: 'Origin not allowed' }, 403, cors)
    if (!env.GEMINI_API_KEY) return jsonResponse({ error: 'Model secret is not configured' }, 503, cors)

    let payload
    try {
      payload = await request.json()
    } catch {
      return jsonResponse({ error: 'Invalid JSON request' }, 400, cors)
    }

    const message = String(payload.message || '').trim().slice(0, 1200)
    const language = ['zh', 'en', 'fr'].includes(payload.language) ? payload.language : 'zh'
    const context = payload.context
    if (!message || !context) return jsonResponse({ error: 'Message and context are required' }, 400, cors)

    const responseLanguage = {
      zh: '只用简体中文回答。',
      en: 'Answer only in English.',
      fr: 'Répondez uniquement en français.',
    }[language]
    const systemInstruction = [
      '你是“法国研学第一组导游地图”的智能导游。',
      responseLanguage,
      '只能根据请求中提供的结构化 context 推荐景点和餐厅。',
      '回答要简洁、具体，说明推荐理由和合理的研学顺序。',
      '不得虚构实时票价、开放时间、营业状态、评分、交通中断或拥挤程度。',
      '遇到可能变化的信息，提醒用户点击网站提供的官方来源核对。',
    ].join('\n')

    const model = env.GEMINI_MODEL || 'gemini-3.5-flash-lite'
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemInstruction }],
          },
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `用户问题：${message}\n\n已检索的真实资料：\n${JSON.stringify(context)}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.25,
            maxOutputTokens: 700,
          },
        }),
      },
    )

    if (!response.ok) {
      return jsonResponse({ error: 'Upstream model request failed' }, 502, cors)
    }

    const result = await response.json()
    const text = result.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || '')
      .join('')
      .trim()
    if (!text) return jsonResponse({ error: 'The model returned no text' }, 502, cors)

    return jsonResponse({ text, provider: `Gemini ${model} + 巴黎研学资料库` }, 200, cors)
  },
}
