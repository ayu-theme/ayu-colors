import { test } from 'node:test'
import assert from 'node:assert'
import * as colors from '../src/colors.js'
import { Color } from '../src/color.js'
import { parseColors } from '../src/yaml-parser.js'

const removeValues = (
  object: Record<string, unknown>,
  isPaletteColor = false
): Record<string, unknown> => {
  const result: Record<string, unknown> = {}
  for (const key of Object.keys(object)) {
    const value = object[key]
    if (value instanceof Color) {
      // For palette color steps, just mark as present (step keys vary by theme)
      if (isPaletteColor) {
        result['step'] = ''
      } else {
        result[key] = ''
      }
    } else if (typeof value === 'object' && value !== null) {
      // Check if this is a palette color (parent is 'palette')
      const isColorInPalette = key !== 'palette' && Object.keys(value as Record<string, unknown>).every(
        k => (value as Record<string, unknown>)[k] instanceof Color
      )
      result[key] = removeValues(value as Record<string, unknown>, isColorInPalette)
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

test('YAML parsing', async (t) => {
  await t.test('parses hex colors', () => {
    const scheme = parseColors<{ color: Color }>(`
color: FF0000
`)
    assert.strictEqual(scheme.color.hex(), '#ff0000')
  })

  await t.test('parses hex colors with alpha modifier', () => {
    const scheme = parseColors<{ color: Color }>(`
color: "FF0000 A0.5"
`)
    assert.strictEqual(scheme.color.hex(), '#ff000080')
  })

  await t.test('parses nested objects', () => {
    const scheme = parseColors<{ syntax: { tag: Color } }>(`
syntax:
  tag: 39BAE6
`)
    assert.strictEqual(scheme.syntax.tag.hex(), '#39bae6')
  })

  await t.test('resolves references', () => {
    const scheme = parseColors<{ base: Color; ref: Color }>(`
base: FF0000
ref: $base
`)
    assert.strictEqual(scheme.ref.hex(), scheme.base.hex())
  })

  await t.test('resolves nested references', () => {
    const scheme = parseColors<{ syntax: { tag: Color }; ansi: { blue: Color } }>(`
syntax:
  tag: 39BAE6
ansi:
  blue: $syntax.tag
`)
    assert.strictEqual(scheme.ansi.blue.hex(), scheme.syntax.tag.hex())
  })

  await t.test('applies modifiers to references', () => {
    const scheme = parseColors<{ base: Color; faded: Color }>(`
base: FF0000
faded: "$base A0.5"
`)
    assert.strictEqual(scheme.faded.hex(), '#ff000080')
  })

  await t.test('chains multiple modifiers', () => {
    const scheme = parseColors<{ base: Color; modified: Color }>(`
base: FF0000
modified: "$base -L0.1 A0.5"
`)
    assert(scheme.modified.hex().endsWith('80'))
  })

  await t.test('references inherit deferred modifiers', () => {
    const scheme = parseColors<{ comment: Color; absolute: Color; relative: Color }>(`
comment: "99ADBF A0.5"
absolute: "$comment A0.3"
relative: "$comment +A0.2"
`)
    // absolute: A0.3 replaces the inherited A0.5
    assert.strictEqual(scheme.absolute.rgba()[3], 0.3)
    // relative: +A0.2 adds to inherited 0.5 = 0.7
    assert.strictEqual(scheme.relative.rgba()[3], 0.7)
  })

  await t.test('detects circular references', () => {
    assert.throws(
      () => parseColors(`
a: $b
b: $a
`),
      /Circular color reference/
    )
  })

  await t.test('throws on invalid reference path', () => {
    assert.throws(
      () => parseColors(`
ref: $nonexistent
`),
      /does not resolve to a Color/
    )
  })

  await t.test('sets absolute lightness with L modifier', () => {
    const scheme = parseColors<{ gray: Color }>(`
gray: "FF0000 L0.5"
`)
    // Red with L=0.5 should change the color
    assert.notStrictEqual(scheme.gray.hex(), '#ff0000')
  })

  await t.test('+A increases alpha relatively', () => {
    const scheme = parseColors<{ faded: Color }>(`
faded: "FF0000 A0.5 +A0.1"
`)
    assert.strictEqual(scheme.faded.rgba()[3], 0.6)
  })

  await t.test('+L increases lightness relatively', () => {
    const scheme = parseColors<{ bright: Color; dim: Color }>(`
bright: "808080 +L0.1"
dim: "808080 -L0.1"
`)
    // Bright should be lighter, dim should be darker
    assert(scheme.bright.hex() > scheme.dim.hex())
  })

  await t.test('palette generates color steps', () => {
    const scheme = parseColors<{ palette: { blue: Record<string, Color> } }>(`
palette:
  range: "0.5:0.8"
  blue: "39BAE6"
`)
    // Should have palette with blue color
    assert(scheme.palette)
    assert(scheme.palette.blue)
    // Should have multiple steps (5)
    const steps = Object.keys(scheme.palette.blue)
    assert.strictEqual(steps.length, 5)
    // Steps should be l1-l5 format
    assert(steps.every((s) => /^l\d+$/.test(s)))
    // All values should be Color instances
    assert(steps.every((s) => scheme.palette.blue[s] instanceof Color))
  })

  await t.test('palette colors can be referenced', () => {
    const scheme = parseColors<{
      palette: { blue: Record<string, Color> }
      myColor: Color
    }>(`
palette:
  range: "0.5:0.8"
  blue: "39BAE6"
myColor: $palette.blue.l3
`)
    // myColor should reference the l3 step from palette
    assert(scheme.myColor instanceof Color)
    assert.strictEqual(scheme.myColor.hex(), scheme.palette.blue['l3'].hex())
  })
})
