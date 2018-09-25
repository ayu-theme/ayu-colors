import * as assert from 'assert'
import * as chroma from 'chroma-js'
import * as colors from './colors'

const removeValues = (object: object) => {
  for (const key of Object.keys(object)) {
    if (object[key]._rgb) object[key] = ''
    else object[key] = removeValues(object[key])
  }
  return object
}

const dark = removeValues(colors.dark)
const light = removeValues(colors.light)
const mirage = removeValues(colors.mirage)

assert.deepEqual(light, mirage, 'Light and Mirage schemes have different properties')
assert.deepEqual(light, dark, 'Light and Dark schemes have different properties')
assert.deepEqual(mirage, dark, 'Mirage and Dark schemes have different properties')
