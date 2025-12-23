import { test } from 'node:test'
import assert from 'node:assert'
import * as colors from './colors.js'
import { Color } from './color.js'

const removeValues = (object: Record<string, unknown>): Record<string, unknown> => {
  const result: Record<string, unknown> = {}
  for (const key of Object.keys(object)) {
    const value = object[key]
    if (value instanceof Color) {
      result[key] = ''
    } else if (typeof value === 'object' && value !== null) {
      result[key] = removeValues(value as Record<string, unknown>)
    }
  }
  return result
}

test('color schemes have matching structure', async (t) => {
  const dark = removeValues(colors.dark as unknown as Record<string, unknown>)
  const light = removeValues(colors.light as unknown as Record<string, unknown>)
  const mirage = removeValues(colors.mirage as unknown as Record<string, unknown>)

  await t.test('Light and Mirage schemes have same properties', () => {
    assert.deepStrictEqual(light, mirage)
  })

  await t.test('Light and Dark schemes have same properties', () => {
    assert.deepStrictEqual(light, dark)
  })

  await t.test('Mirage and Dark schemes have same properties', () => {
    assert.deepStrictEqual(mirage, dark)
  })
})
