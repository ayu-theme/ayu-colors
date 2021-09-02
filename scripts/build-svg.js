const fs = require('fs')
const isObject = require('is-object')
const fontColorContrast = require('font-color-contrast')

const colors = require('../dist/colors')
const { Color } = require('../dist/color')

/**
 * https://gist.github.com/penguinboy/762197
 */
function flattenObject(object) {
  const toReturn = {}
  Object.keys(object).forEach(key => {
    const element = object[key]
    if (element instanceof Color) {
      toReturn[key] = element
    } else {
      const flattened = flattenObject(element)
      Object.keys(flattened).forEach(nestKey => {
        toReturn[`${key}.${nestKey}`] = flattened[nestKey]
      })
    }
  })

  return toReturn
}

const dark = flattenObject(colors.dark)
const light = flattenObject(colors.light)
const mirage = flattenObject(colors.mirage)

let colorSVG = ''

let index = 2
for (let key in light) {
  if (light.hasOwnProperty(key) && light[key] instanceof Color) {
    const lightColor = light[key]
    const mirageColor = mirage[key]
    const darkColor = dark[key]

    colorSVG += `
			<g>
				<rect height="1.8em" width="20%" x="27.5%" y="${(index * 3) - 1.2}em" rx="2" ry="2" fill="${lightColor.hex()}" />
				<rect height="1.8em" width="20%" x="52.5%" y="${(index * 3) - 1.2}em" rx="2" ry="2" fill="${mirageColor.hex()}" />
				<rect height="1.8em" width="20%" x="77.5%" y="${(index * 3) - 1.2}em" rx="2" ry="2" fill="${darkColor.hex()}" />
			</g>

			<g font-family="sans-serif" font-size="12">
				<text y="${index * 3.25}em" x="12.5%" fill="333333">${key}</text>
				<text y="${index * 3.25}em" x="37.5%" fill="${fontColorContrast(`${lightColor.hex()}`)}">${lightColor.hex().toUpperCase()}</text>
				<text y="${index * 3.25}em" x="62.5%" fill="${fontColorContrast(`${mirageColor.hex()}`)}">${mirageColor.hex().toUpperCase()}</text>
				<text y="${index * 3.25}em" x="87.5%" fill="${fontColorContrast(`${darkColor.hex()}`)}">${darkColor.hex().toUpperCase()}</text>
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
      <rect height="${index * 3}em" width="25%" x="25%" fill="${colors.light.ui.bg.hex()}" />
      <rect height="${index * 3}em" width="25%" x="50%" fill="${colors.mirage.ui.bg.hex()}" />
      <rect height="${index * 3}em" width="25%" x="75%" fill="${colors.dark.ui.bg.hex()}" />
    </g>
    <g font-weight="bold">
      <text font-family="sans-serif" font-size="13" y="3em" x="12.5%" fill="#333333">Path</text>
      <text font-family="sans-serif" font-size="13" y="3em" x="37.5%" fill="${colors.light.ui.fg.hex()}">Light</text>
      <text font-family="sans-serif" font-size="13" y="3em" x="62.5%" fill="${colors.mirage.ui.fg.hex()}">Mirage</text>
      <text font-family="sans-serif" font-size="13" y="3em" x="87.5%" fill="${colors.dark.ui.fg.hex()}">Dark</text>
    </g>

    ${colorSVG}

</svg>
`

fs.writeFileSync('colors.svg', colorSVG, 'utf-8')
