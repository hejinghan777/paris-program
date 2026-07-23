const MAX_JSON_BYTES = 96 * 1024
const SESSION_TTL_MS = 12 * 60 * 60 * 1000
const LOGIN_WINDOW_MS = 10 * 60 * 1000
const LOGIN_BLOCK_MS = 15 * 60 * 1000
const MAX_LOGIN_ATTEMPTS = 5

function corsHeaders(origin, allowedOrigin) {
  return {
    'Access-Control-Allow-Origin': origin === allowedOrigin ? origin : allowedOrigin,
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    Vary: 'Origin',
  }
}

function jsonResponse(payload, status, cors, extraHeaders = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...cors,
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...extraHeaders,
    },
  })
}

async function readJson(request) {
  const declaredSize = Number(request.headers.get('Content-Length') || 0)
  if (declaredSize > MAX_JSON_BYTES) throw new Error('PAYLOAD_TOO_LARGE')
  const text = await request.text()
  if (new TextEncoder().encode(text).byteLength > MAX_JSON_BYTES) {
    throw new Error('PAYLOAD_TOO_LARGE')
  }
  return JSON.parse(text)
}

function toBase64Url(bytes) {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

async function sha256(value) {
  const bytes = new TextEncoder().encode(String(value))
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))
  return Array.from(digest, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function passwordsMatch(candidate, expected) {
  const [candidateHash, expectedHash] = await Promise.all([sha256(candidate), sha256(expected)])
  let difference = candidateHash.length ^ expectedHash.length
  const length = Math.max(candidateHash.length, expectedHash.length)
  for (let index = 0; index < length; index += 1) {
    difference |= (candidateHash.charCodeAt(index) || 0) ^ (expectedHash.charCodeAt(index) || 0)
  }
  return difference === 0
}

function cleanString(value, maxLength, fallback = '') {
  if (typeof value !== 'string') return fallback
  return value.trim().slice(0, maxLength)
}

function cleanLocalized(value, maxLength) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined
  return {
    zh: cleanString(value.zh, maxLength),
    en: cleanString(value.en, maxLength),
    fr: cleanString(value.fr, maxLength),
  }
}

function cleanRestaurantOverrides(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('INVALID_CONTENT')
  }

  const result = {}
  for (const [rawId, item] of Object.entries(value)) {
    const id = Number(rawId)
    if (!Number.isInteger(id) || id < 1 || id > 26 || !item || typeof item !== 'object') continue

    const min = Number(item.budgetEur?.min)
    const max = Number(item.budgetEur?.max)
    if (!Number.isFinite(min) || !Number.isFinite(max) || min < 0 || max < min || max > 1000) {
      throw new Error('INVALID_BUDGET')
    }

    const openingHours = item.openingHours && typeof item.openingHours === 'object'
      ? {
          summary: cleanLocalized(item.openingHours.summary, 180),
          note: cleanLocalized(item.openingHours.note, 360),
          certainty: item.openingHours.certainty === 'confirmed' ? 'confirmed' : 'variable',
          checkedOn: cleanString(item.openingHours.checkedOn, 10),
        }
      : undefined

    result[id] = {
      name: cleanString(item.name, 100),
      specialty: cleanString(item.specialty, 60),
      blurb: cleanString(item.blurb, 500),
      budgetEur: { min: Math.round(min), max: Math.round(max) },
      ...(openingHours ? { openingHours } : {}),
    }
  }
  return result
}

function cleanAttractionOverrides(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('INVALID_CONTENT')
  }

  const result = {}
  for (const [rawId, item] of Object.entries(value)) {
    const id = cleanString(rawId, 80)
    if (!id || !item || typeof item !== 'object') continue
    const visitingHours = item.visitingHours && typeof item.visitingHours === 'object'
      ? {
          summary: cleanLocalized(item.visitingHours.summary, 180),
          note: cleanLocalized(item.visitingHours.note, 360),
          certainty: item.visitingHours.certainty === 'confirmed' ? 'confirmed' : 'variable',
          checkedOn: cleanString(item.visitingHours.checkedOn, 10),
        }
      : undefined

    result[id] = {
      name: cleanString(item.name, 100),
      englishName: cleanString(item.englishName, 120),
      address: cleanString(item.address, 220),
      ...(visitingHours ? { visitingHours } : {}),
    }
  }
  return result
}

async function getManagedContent(env) {
  const row = await env.DB.prepare(
    'SELECT restaurant_overrides, attraction_overrides, updated_at FROM managed_content WHERE id = 1',
  ).first()

  return {
    restaurantOverrides: JSON.parse(row?.restaurant_overrides || '{}'),
    attractionOverrides: JSON.parse(row?.attraction_overrides || '{}'),
    updatedAt: row?.updated_at || null,
  }
}

async function verifySession(request, env) {
  const authorization = request.headers.get('Authorization') || ''
  if (!authorization.startsWith('Bearer ')) return false
  const token = authorization.slice(7).trim()
  if (!token) return false

  const tokenHash = await sha256(token)
  const now = Date.now()
  const session = await env.DB.prepare(
    'SELECT expires_at FROM admin_sessions WHERE token_hash = ? AND expires_at > ?',
  )
    .bind(tokenHash, now)
    .first()
  return Boolean(session)
}

async function handleAdminLogin(request, env, cors) {
  if (!env.ADMIN_PASSWORD) {
    return jsonResponse({ error: 'Administrator password is not configured' }, 503, cors)
  }

  let payload
  try {
    payload = await readJson(request)
  } catch (error) {
    const status = error.message === 'PAYLOAD_TOO_LARGE' ? 413 : 400
    return jsonResponse({ error: 'Invalid login request' }, status, cors)
  }

  const password = String(payload.password || '').slice(0, 256)
  const ipHash = await sha256(request.headers.get('CF-Connecting-IP') || 'unknown')
  const now = Date.now()
  const record = await env.DB.prepare(
    'SELECT attempts, window_started_at, blocked_until FROM admin_login_attempts WHERE ip_hash = ?',
  )
    .bind(ipHash)
    .first()

  if (record?.blocked_until > now) {
    return jsonResponse(
      { error: 'Too many attempts. Please try again later.', retryAfter: record.blocked_until },
      429,
      cors,
    )
  }

  const isCorrect = await passwordsMatch(password, env.ADMIN_PASSWORD)
  if (!isCorrect) {
    const inCurrentWindow = record && now - record.window_started_at < LOGIN_WINDOW_MS
    const attempts = inCurrentWindow ? record.attempts + 1 : 1
    const windowStartedAt = inCurrentWindow ? record.window_started_at : now
    const blockedUntil = attempts >= MAX_LOGIN_ATTEMPTS ? now + LOGIN_BLOCK_MS : 0

    await env.DB.prepare(
      `INSERT INTO admin_login_attempts (ip_hash, attempts, window_started_at, blocked_until)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(ip_hash) DO UPDATE SET
         attempts = excluded.attempts,
         window_started_at = excluded.window_started_at,
         blocked_until = excluded.blocked_until`,
    )
      .bind(ipHash, attempts, windowStartedAt, blockedUntil)
      .run()

    return jsonResponse(
      {
        error: blockedUntil
          ? 'Too many attempts. Please try again later.'
          : 'Incorrect administrator password',
        attemptsRemaining: Math.max(0, MAX_LOGIN_ATTEMPTS - attempts),
      },
      blockedUntil ? 429 : 401,
      cors,
    )
  }

  const tokenBytes = new Uint8Array(32)
  crypto.getRandomValues(tokenBytes)
  const token = toBase64Url(tokenBytes)
  const tokenHash = await sha256(token)
  const expiresAt = now + SESSION_TTL_MS

  await env.DB.batch([
    env.DB.prepare('DELETE FROM admin_login_attempts WHERE ip_hash = ?').bind(ipHash),
    env.DB.prepare('DELETE FROM admin_sessions WHERE expires_at <= ?').bind(now),
    env.DB.prepare(
      'INSERT INTO admin_sessions (token_hash, created_at, expires_at) VALUES (?, ?, ?)',
    ).bind(tokenHash, now, expiresAt),
  ])

  return jsonResponse({ token, expiresAt }, 200, cors)
}

async function handleAdminSave(request, env, cors) {
  if (!(await verifySession(request, env))) {
    return jsonResponse({ error: 'Administrator session expired' }, 401, cors)
  }

  let payload
  try {
    payload = await readJson(request)
    const restaurantOverrides = cleanRestaurantOverrides(payload.restaurantOverrides)
    const attractionOverrides = cleanAttractionOverrides(payload.attractionOverrides)
    const updatedAt = new Date().toISOString()

    await env.DB.prepare(
      `INSERT INTO managed_content (id, restaurant_overrides, attraction_overrides, updated_at)
       VALUES (1, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         restaurant_overrides = excluded.restaurant_overrides,
         attraction_overrides = excluded.attraction_overrides,
         updated_at = excluded.updated_at`,
    )
      .bind(JSON.stringify(restaurantOverrides), JSON.stringify(attractionOverrides), updatedAt)
      .run()

    return jsonResponse({ restaurantOverrides, attractionOverrides, updatedAt }, 200, cors)
  } catch (error) {
    const status = error.message === 'PAYLOAD_TOO_LARGE' ? 413 : 400
    return jsonResponse({ error: 'Invalid managed content' }, status, cors)
  }
}

async function handleAdminLogout(request, env, cors) {
  const authorization = request.headers.get('Authorization') || ''
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : ''
  if (token) {
    await env.DB.prepare('DELETE FROM admin_sessions WHERE token_hash = ?')
      .bind(await sha256(token))
      .run()
  }
  return jsonResponse({ ok: true }, 200, cors)
}

async function handleGuide(request, env, cors) {
  if (!env.AI) return jsonResponse({ error: 'Workers AI binding is not configured' }, 503, cors)

  let payload
  try {
    payload = await readJson(request)
  } catch (error) {
    const status = error.message === 'PAYLOAD_TOO_LARGE' ? 413 : 400
    return jsonResponse({ error: 'Invalid JSON request' }, status, cors)
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
  if (!message || !context) {
    return jsonResponse({ error: 'Message and context are required' }, 400, cors)
  }

  const responseLanguage = {
    zh: '只用简体中文回答。',
    en: 'Answer only in English.',
    fr: 'Répondez uniquement en français.',
  }[language]
  const systemInstruction = [
    '你是“法国研学第一组导游地图”中的通用对话型智能导游。',
    responseLanguage,
    '直接回答用户当前提出的问题，不要把一般问题改写成景点或餐厅推荐，也不要重复自我介绍。',
    '普通对话和稳定的常识问题可以使用语言模型知识；实时、近期或容易变化的信息只能使用 context 中提供的实时资料。',
    '先读取 context.intent，再决定是否使用检索资料。',
    '只有 context.intent.restaurantRequested 为 true 时，才能讨论具体餐厅、菜系、餐饮预算或用餐推荐。',
    '只有 context.intent.attractionRequested 为 true 时，才能推荐具体景点。',
    'context.intent.weatherRequested 为 true 时，只能根据 context.liveWeather 回答巴黎当前天气。',
    'context.intent.primary 为 conversation 时，像正常语言模型一样理解并回答当前问题。',
    '具体地点和餐厅只能来自当前 context，不得使用模型记忆补充未检索地点。',
    '如果 context.verifiedDraft 存在，必须保留其中的名称、数字、预算范围、限制和不确定性提示。',
    '不得虚构实时票价、开放时间、营业状态、评分、交通中断或拥挤程度。',
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
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || ''
    const cors = corsHeaders(origin, env.ALLOWED_ORIGIN)

    if (request.method === 'OPTIONS') {
      if (origin !== env.ALLOWED_ORIGIN) {
        return jsonResponse({ error: 'Origin not allowed' }, 403, cors)
      }
      return new Response(null, { status: 204, headers: cors })
    }
    if (origin && origin !== env.ALLOWED_ORIGIN) {
      return jsonResponse({ error: 'Origin not allowed' }, 403, cors)
    }
    const path = new URL(request.url).pathname.replace(/\/+$/, '') || '/'

    try {
      if (path === '/content' && request.method === 'GET') {
        if (!env.DB) return jsonResponse({ error: 'Database binding is not configured' }, 503, cors)
        return jsonResponse(await getManagedContent(env), 200, cors)
      }
      if (path === '/admin/login' && request.method === 'POST') {
        if (!env.DB) return jsonResponse({ error: 'Database binding is not configured' }, 503, cors)
        return handleAdminLogin(request, env, cors)
      }
      if (path === '/admin/content' && request.method === 'GET') {
        if (!env.DB) return jsonResponse({ error: 'Database binding is not configured' }, 503, cors)
        if (!(await verifySession(request, env))) {
          return jsonResponse({ error: 'Administrator session expired' }, 401, cors)
        }
        return jsonResponse(await getManagedContent(env), 200, cors)
      }
      if (path === '/admin/content' && request.method === 'PUT') {
        if (!env.DB) return jsonResponse({ error: 'Database binding is not configured' }, 503, cors)
        return handleAdminSave(request, env, cors)
      }
      if (path === '/admin/logout' && request.method === 'DELETE') {
        if (!env.DB) return jsonResponse({ error: 'Database binding is not configured' }, 503, cors)
        return handleAdminLogout(request, env, cors)
      }
      if ((path === '/' || path === '/guide') && request.method === 'POST') {
        return handleGuide(request, env, cors)
      }
      return jsonResponse({ error: 'Not found' }, 404, cors)
    } catch {
      return jsonResponse({ error: 'Service temporarily unavailable' }, 500, cors)
    }
  },
}
