import fs from 'fs'
import isObject from 'is-object'
import fontColorContrast from 'font-color-contrast';

import * as colors from '../src/colors.js'

/**
 * https://gist.github.com/penguinboy/762197
 */
function flattenObject(obj) {
	var toReturn = {}

	for (var i in obj) {
		if (obj.hasOwnProperty(i)) {
			if (isObject(obj[i])) {
				var flatObject = flattenObject(obj[i])
				for (var x in flatObject) {
					if (flatObject.hasOwnProperty(x)) {
						toReturn[i + '.' + x] = flatObject[x]
					}
				}
			} else {
				toReturn[i] = obj[i]
			}
		}
	}
	return toReturn
}

const dark = flattenObject(colors.dark)
const light = flattenObject(colors.light)
const mirage = flattenObject(colors.mirage)

let colorSVG = ''

let index = 2
for (let key in light) {
	if (light.hasOwnProperty(key) && typeof light[key] === 'string' && light[key].length === 6) {
		const lightColor = light[key]
		const mirageColor = mirage[key]
		const darkColor = dark[key]

		colorSVG += `
			<g>
				<rect height="1.8em" width="20%" x="27.5%" y="${(index * 3) - 1.2}em" rx="5" ry="5" fill="#${lightColor}" />
				<rect height="1.8em" width="20%" x="52.5%" y="${(index * 3) - 1.2}em" rx="5" ry="5" fill="#${mirageColor}" />
				<rect height="1.8em" width="20%" x="77.5%" y="${(index * 3) - 1.2}em" rx="5" ry="5" fill="#${darkColor}" />
			</g>

			<g>
				<text y="${index * 3}em" x="12.5%">${key}</text>
				<text y="${index * 3}em" x="37.5%" fill="${fontColorContrast(`#${lightColor}`)}">${lightColor}</text>
				<text y="${index * 3}em" x="62.5%" fill="${fontColorContrast(`#${mirageColor}`)}">${mirageColor}</text>
				<text y="${index * 3}em" x="87.5%" fill="${fontColorContrast(`#${darkColor}`)}">${darkColor}</text>
			</g>
		`

		index++
	}
}

colorSVG = `<?xml version="1.0" standalone="no" ?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN"
	"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg width="100%" height="${index * 3}em" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" font-family="monospace" text-anchor="middle">
	<g>
		<rect height="${index * 3}em" width="25%" x="25%" fill="#FAFAFA" />
		<rect height="${index * 3}em" width="25%" x="50%" fill="#212733" />
		<rect height="${index * 3}em" width="25%" x="75%" fill="#0F1419" />
	</g>
	<g font-weight="bold">
		<text y="3em" x="12.5%">Path</text>
		<text y="3em" x="37.5%" fill="#${colors.light.common.fg}">Light</text>
		<text y="3em" x="62.5%" fill="#${colors.mirage.common.fg}">Mirage</text>
		<text y="3em" x="87.5%" fill="#${colors.dark.common.fg}">Dark</text>
	</g>

	${colorSVG}

</svg>
`

fs.writeFileSync('colors.svg', colorSVG, 'utf-8')
