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
    if (!message || !context) return jsonResponse({ error: 'Message and context are required' }, 400, cors)

    const responseLanguage = {
      zh: '只用简体中文回答。',
      en: 'Answer only in English.',
      fr: 'Répondez uniquement en français.',
    }[language]
    const systemInstruction = [
      '你是“法国研学第一组导游地图”的智能导游。',
      responseLanguage,
      '先读取 context.intent，再决定是否检索和推荐；不能因为资料库存在就主动输出推荐。',
      '只有 context.intent.restaurantRequested 为 true 时，才能讨论具体餐厅、菜系、餐饮预算或用餐推荐；为 false 时严禁输出具体餐厅名称和餐饮信息。',
      '只有 context.intent.attractionRequested 为 true 时，才能推荐具体景点；普通问候不得自动推荐景点。',
      'context.intent.primary 为 conversation 时，简短、自然地回答当前问题，不要列出景点、餐厅、预算或路线。',
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
          {
            role: 'user',
            content: `用户问题：${message}\n\n已检索的真实资料：\n${JSON.stringify(context)}`,
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

    return jsonResponse({ text, provider: `Llama 3.3 70B + 巴黎研学资料库` }, 200, cors)
  },
}
