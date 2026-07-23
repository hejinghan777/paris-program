import assert from 'node:assert/strict'
import test from 'node:test'
import { buildGuideContext, detectGuideIntent, getLocalGuideAnswer } from '../src/services/guideEngine.js'

test('a greeting stays in conversation mode without recommendations', () => {
  const intent = detectGuideIntent('你好')
  const context = buildGuideContext('你好')
  const answer = getLocalGuideAnswer('你好', 'zh')

  assert.equal(intent.primary, 'conversation')
  assert.equal(intent.restaurantRequested, false)
  assert.deepEqual(context.relevantRestaurants, [])
  assert.deepEqual(context.relevantAttractions, [])
  assert.deepEqual(answer.recommendations, [])
})

test('restaurant data is retrieved only for an explicit dining request', () => {
  const context = buildGuideContext('每人 30 欧元，推荐意大利餐厅')
  const answer = getLocalGuideAnswer('每人 30 欧元，推荐意大利餐厅', 'zh')

  assert.equal(context.intent.primary, 'restaurant')
  assert.equal(context.intent.restaurantRequested, true)
  assert.ok(context.relevantRestaurants.length > 0)
  assert.deepEqual(context.relevantAttractions, [])
  assert.ok(answer.recommendations.every((item) => item.type === 'restaurant'))
})

test('an attraction request never receives restaurant data', () => {
  const context = buildGuideContext('推荐适合研学的科学类景点')
  const answer = getLocalGuideAnswer('推荐适合研学的科学类景点', 'zh')

  assert.equal(context.intent.primary, 'attraction')
  assert.equal(context.intent.restaurantRequested, false)
  assert.deepEqual(context.relevantRestaurants, [])
  assert.ok(context.relevantAttractions.length > 0)
  assert.ok(answer.recommendations.every((item) => item.type === 'attraction'))
})

test('transport questions do not preload restaurant or attraction data', () => {
  const context = buildGuideContext('巴黎地铁应该怎么买票？')

  assert.equal(context.intent.primary, 'transport')
  assert.deepEqual(context.relevantRestaurants, [])
  assert.deepEqual(context.relevantAttractions, [])
})
