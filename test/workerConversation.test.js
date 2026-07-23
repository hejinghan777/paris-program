import assert from 'node:assert/strict'
import test from 'node:test'
import worker from '../worker/src/index.js'

const endpoint = 'https://paris-study-guide.example'
const allowedOrigin = 'https://hejinghan777.github.io'

function createRequest(body) {
  return new Request(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: allowedOrigin,
    },
    body: JSON.stringify(body),
  })
}

function createEnv(capture) {
  return {
    ALLOWED_ORIGIN: allowedOrigin,
    WORKERS_AI_MODEL: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
    AI: {
      async run(model, input) {
        capture.model = model
        capture.messages = input.messages
        return { response: '模型已直接回答当前问题。' }
      },
    },
  }
}

test('the Worker sends general questions to the model without a fixed draft', async () => {
  const capture = {}
  const response = await worker.fetch(
    createRequest({
      message: '今天过得如何？',
      language: 'zh',
      history: [{ role: 'user', text: '你好' }, { role: 'assistant', text: '你好！' }],
      context: {
        intent: {
          primary: 'conversation',
          restaurantRequested: false,
          attractionRequested: false,
          weatherRequested: false,
        },
        relevantRestaurants: [],
        relevantAttractions: [],
      },
    }),
    createEnv(capture),
  )
  const payload = await response.json()

  assert.equal(response.status, 200)
  assert.equal(payload.provider, 'Llama 3.3 70B')
  assert.equal(capture.messages[1].role, 'user')
  assert.equal(capture.messages[2].role, 'assistant')
  assert.match(capture.messages.at(-1).content, /今天过得如何/)
  assert.doesNotMatch(capture.messages.at(-1).content, /verifiedDraft/)
})

test('the Worker identifies live weather as a model data source', async () => {
  const capture = {}
  const response = await worker.fetch(
    createRequest({
      message: '今天巴黎天气怎么样？',
      language: 'zh',
      context: {
        intent: {
          primary: 'weather',
          restaurantRequested: false,
          attractionRequested: false,
          weatherRequested: true,
        },
        relevantRestaurants: [],
        relevantAttractions: [],
        liveWeather: {
          location: 'Paris, France',
          temperature: 20,
          apparentTemperature: 19,
          condition: '少云',
        },
      },
    }),
    createEnv(capture),
  )
  const payload = await response.json()

  assert.equal(response.status, 200)
  assert.equal(payload.provider, 'Llama 3.3 70B + Open-Meteo 实时天气')
  assert.match(capture.messages.at(-1).content, /"temperature":20/)
})
