import { spawn } from 'child_process'
import { resolve } from 'path'
import fs from 'fs'

import rimraf from 'rimraf'
import yaml from 'js-yaml'
import camelCase from 'lodash.camelcase'
import mapObject from 'map-obj'
import isObject from 'is-object'

const camelCaseKeys = (obj) => mapObject(obj, (key, value) => {
	return [
		camelCase(key),
		isObject(value) ? camelCaseKeys(value) : value
	]
})

const template = (colors) => `export default ${JSON.stringify(camelCaseKeys(colors), null, '\t')}`

const clone = spawn('git', ['clone', 'https://github.com/dempfi/ayu'])

clone.stdout.on('data', (data) => {
	console.log(`stdout: ${data}`)
})

clone.stderr.on('data', (data) => {
	console.log(`stderr: ${data}`)
})

clone.on('close', (code) => {
	if (code !== 0) {
		console.log('error')
		return false
	}

	const darkYAML = fs.readFileSync(resolve('ayu/src/themes/dark.yml'), 'utf8')
	const lightYAML = fs.readFileSync(resolve('ayu/src/themes/light.yml'), 'utf8')
	const mirageYAML = fs.readFileSync(resolve('ayu/src/themes/mirage.yml'), 'utf8')

	const dark = yaml.safeLoad(darkYAML)
	const light = yaml.safeLoad(lightYAML)
	const mirage = yaml.safeLoad(mirageYAML)

	const darkJS = template(dark)
	const lightJS = template(light)
	const mirageJS = template(mirage)

	fs.writeFileSync(resolve('src/dark.js'), darkJS)
	fs.writeFileSync(resolve('src/light.js'), lightJS)
	fs.writeFileSync(resolve('src/mirage.js'), mirageJS)
})
