import mapObject from 'map-obj'
import isObject from 'is-object'

import * as colors from '../src/colors.js'

const removeValues = (obj) => mapObject(obj, (key, value) => ([key, '']), { deep: true })

test('colors', () => {
	expect(colors).toMatchSnapshot()
})

test('keys equal', () => {
	const dark = removeValues(colors.dark)
	const light = removeValues(colors.light)
	const mirage = removeValues(colors.mirage)

	expect(dark).toEqual(light)
	expect(light).toEqual(mirage)
})
