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
    if (!env.AI) return jsonResponse({ error: 'Workers AI binding is not configured' }, 503, cors)

    let payload
    try {
      payload = await request.json()
    } catch {
      return jsonResponse({ error: 'Invalid JSON request' }, 400, cors)
    }

    const message = String(payload.message || '').trim().slice(0, 1200)
    const language = ['zh', 'en', 'fr'].includes(payload.language) ? payload.language : 'zh'
    const context = payload.context
    const history = Array.isArray(payload.history)
      ? payload.history
          .slice(-6)
          .filter((item) => ['user', 'assistant'].includes(item?.role))
          .map((item) => ({
            role: item.role,
            content: String(item.text || '').trim().slice(0, 700),
          }))
          .filter((item) => item.content)
      : []
    if (!message || !context) return jsonResponse({ error: 'Message and context are required' }, 400, cors)

    const responseLanguage = {
      zh: '只用简体中文回答。',
      en: 'Answer only in English.',
      fr: 'Répondez uniquement en français.',
    }[language]
    const systemInstruction = [
      '你是“法国研学第一组导游地图”中的通用对话型智能导游。',
      responseLanguage,
      '直接回答用户当前提出的问题，不要把一般问题改写成景点或餐厅推荐，也不要重复自我介绍，除非用户正在问候或询问你的身份。',
      '普通对话和稳定的常识问题可以使用语言模型知识自然回答；对实时、近期或容易变化的信息，只能使用 context 中提供的实时资料，无法确认时要明确说明。',
      '先读取 context.intent，再决定是否检索和推荐；不能因为资料库存在就主动输出推荐。',
      '只有 context.intent.restaurantRequested 为 true 时，才能讨论具体餐厅、菜系、餐饮预算或用餐推荐；为 false 时严禁输出具体餐厅名称和餐饮信息。',
      '只有 context.intent.attractionRequested 为 true 时，才能推荐具体景点；普通问候不得自动推荐景点。',
      'context.intent.weatherRequested 为 true 时，只能根据 context.liveWeather 回答巴黎当前天气；如果 liveWeatherUnavailable 为 true，要诚实说明实时天气暂时无法获取。',
      'context.intent.primary 为 conversation 时，像正常语言模型一样理解并回答当前问题，不要套用固定欢迎模板。',
      '只能根据请求中提供的结构化 context 推荐景点和餐厅，不得使用模型记忆补充未检索的地点。',
      '必须直接回答用户实际提出的菜系、每人预算、日期时段、景点主题或行程要求。',
      '如果 context.verifiedDraft 存在，它是规则引擎生成的已核对答案；必须保留其中的名称、数字、预算范围、限制和不确定性提示，只能改善表达和组织。',
      '回答要简洁、自然、具体，不要重复句子，不要添加没有出现在 context 中的地点。',
      '不得虚构实时票价、开放时间、营业状态、评分、交通中断或拥挤程度。',
      '遇到可能变化的信息，提醒用户点击网站提供的官方来源核对。',
    ].join('\n')

    const model = env.WORKERS_AI_MODEL || '@cf/meta/llama-3.3-70b-instruct-fp8-fast'
    let result
    try {
      result = await env.AI.run(model, {
        messages: [
          { role: 'system', content: systemInstruction },
          ...history,
          {
            role: 'user',
            content: `当前用户问题：${message}\n\n与当前问题相关的检索资料（可能为空）：\n${JSON.stringify(context)}`,
          },
        ],
        temperature: 0.25,
        max_tokens: 500,
      })
    } catch {
      return jsonResponse({ error: 'Upstream model request failed' }, 502, cors)
    }

    const text =
      (typeof result === 'string' ? result : result?.response || result?.result?.response || '').trim()
    if (!text) return jsonResponse({ error: 'The model returned no text' }, 502, cors)

    const providerParts = ['Llama 3.3 70B']
    if (context.liveWeather) providerParts.push('Open-Meteo 实时天气')
    if (context.relevantAttractions?.length || context.relevantRestaurants?.length) {
      providerParts.push('巴黎研学资料库')
    }

    return jsonResponse({ text, provider: providerParts.join(' + ') }, 200, cors)
  },
}
