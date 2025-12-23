import fs from 'node:fs'
import * as colors from '../dist/colors.js'
import { Color } from '../dist/color.js'
import os from 'node:os'
import path from 'node:path'

// Load and embed custom font (compressed Latin subset)
const fontPath = path.join(os.homedir(), 'Developer/site/public/fonts/IosevkaCustom-Regular.woff2')
const fontBase64 = fs.readFileSync(fontPath).toString('base64')
const fontStyle = `
  <style>
    @font-face {
      font-family: 'IosevkaCustom';
      src: url('data:font/woff2;base64,${fontBase64}') format('woff2');
    }
  </style>`

const PANEL_WIDTH = 520
const PANEL_HEIGHT = 230
const GAP = 8
const TITLE_HEIGHT = 32
const LINE_HEIGHT = 22
const CHAR_WIDTH = 7.5
const PADDING = 16
const GUTTER_WIDTH = 32

const themes = [
  { name: 'Light', scheme: colors.light },
  { name: 'Mirage', scheme: colors.mirage },
  { name: 'Dark', scheme: colors.dark }
]

// VCS indicators per line: null, 'added', or 'modified'
const vcsIndicators = [null, 'added', null, null, 'modified', null, null, null]

// Rust code tokens: [text, colorKey] - Unix-style process handler
const codeLines = [
  [
    ['// ', 'comment'],
    ['Unix-style process handler', 'comment']
  ],
  [
    ['pub', 'keyword'],
    [' ', null],
    ['fn', 'keyword'],
    [' ', null],
    ['spawn', 'func'],
    ['(', 'fg'],
    ['cmd', 'entity'],
    [':', 'fg'],
    [' &', 'operator'],
    ['str', 'tag'],
    [')', 'fg'],
    [' -> ', 'operator'],
    ['Result', 'tag'],
    ['<', 'fg'],
    ['i32', 'tag'],
    ['>', 'fg'],
    [' {', 'fg']
  ],
  [
    ['    ', null],
    ['let', 'keyword'],
    [' ', null],
    ['child', 'entity'],
    [' = ', 'operator'],
    ['Command', 'tag'],
    ['::', 'fg'],
    ['new', 'func'],
    ['(', 'fg'],
    ['cmd', 'entity'],
    [')', 'fg']
  ],
  [
    ['        ', null],
    ['.', 'fg'],
    ['env', 'func'],
    ['(', 'fg'],
    ['"PATH"', 'string'],
    [', ', 'fg'],
    ['"/usr/bin"', 'string'],
    [')', 'fg']
  ],
  [
    ['        ', null],
    ['.', 'fg'],
    ['spawn', 'func'],
    ['()', 'fg'],
    ['?', 'operator'],
    [';', 'fg']
  ],
  [
    ['    ', null],
    ['match', 'keyword'],
    [' ', null],
    ['child', 'entity'],
    ['.', 'fg'],
    ['wait', 'func'],
    ['()', 'fg'],
    [' {', 'fg']
  ],
  [
    ['        ', null],
    ['Ok', 'tag'],
    ['(', 'fg'],
    ['s', 'entity'],
    [')', 'fg'],
    [' => ', 'operator'],
    ['Ok', 'tag'],
    ['(', 'fg'],
    ['s', 'entity'],
    ['.', 'fg'],
    ['code', 'func'],
    ['())', 'fg'],
    [',', 'fg']
  ],
  [
    ['        ', null],
    ['Err', 'markup'],
    ['(', 'fg'],
    ['e', 'entity'],
    [')', 'fg'],
    [' => ', 'operator'],
    ['Err', 'markup'],
    ['(', 'fg'],
    ['e', 'entity'],
    ['.', 'fg'],
    ['into', 'func'],
    ['())', 'fg'],
    [',', 'fg']
  ]
]

function getColor(scheme, key) {
  if (!key || key === 'fg') return scheme.editor.fg.hex()
  if (key === 'comment') return scheme.syntax.comment.hex()
  return scheme.syntax[key]?.hex() || scheme.editor.fg.hex()
}

function renderCodeLine(scheme, tokens, x, y) {
  let currentX = x
  let tspans = ''

  for (const [text, colorKey] of tokens) {
    const color = getColor(scheme, colorKey)
    const escapedText = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    tspans += `<tspan x="${currentX}" fill="${color}">${escapedText}</tspan>`
    currentX += text.length * CHAR_WIDTH
  }

  return `<text y="${y}" font-family="IosevkaCustom, monospace" font-size="14">${tspans}</text>`
}

function renderPanel(scheme, name, offsetY) {
  const bg = scheme.editor.bg.hex()
  const uiBg = scheme.ui.bg.hex()
  const uiFg = scheme.ui.fg.hex()
  const gutterColor = scheme.editor.gutter.normal.hex()
  const lineColor = scheme.editor.line.hex()
  const accent = scheme.common.accent.hex()
  const vcsAdded = scheme.vcs.added.hex()
  const vcsModified = scheme.vcs.modified.hex()
  const panelBorder = scheme.ui.line.hex()

  let svg = ''

  // Panel background with rounded corners
  svg += `<rect x="0" y="${offsetY}" width="${PANEL_WIDTH}" height="${PANEL_HEIGHT}" rx="8" ry="8" fill="${uiBg}" />`

  // Title bar
  svg += `<rect x="0" y="${offsetY}" width="${PANEL_WIDTH}" height="${TITLE_HEIGHT}" rx="8" ry="8" fill="${uiBg}" />`
  svg += `<rect x="0" y="${offsetY + 16}" width="${PANEL_WIDTH}" height="16" fill="${uiBg}" />`

  // Traffic lights
  const dotY = offsetY + TITLE_HEIGHT / 2
  svg += `<circle cx="16" cy="${dotY}" r="5" fill="#ff5f57" />`
  svg += `<circle cx="32" cy="${dotY}" r="5" fill="#febc2e" />`
  svg += `<circle cx="48" cy="${dotY}" r="5" fill="#28c840" />`

  // Title
  svg += `<text x="${PANEL_WIDTH / 2}" y="${
    dotY + 4
  }" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" fill="${uiFg}">${name}</text>`

  // Editor area (rounded bottom corners only)
  const editorY = offsetY + TITLE_HEIGHT
  const editorH = PANEL_HEIGHT - TITLE_HEIGHT
  const r = 8
  svg += `<path d="M0 ${editorY} h${PANEL_WIDTH} v${editorH - r} q0 ${r} -${r} ${r} h-${
    PANEL_WIDTH - 2 * r
  } q-${r} 0 -${r} -${r} Z" fill="${bg}" />`

  // Gutter background (rounded bottom-left corner only)
  svg += `<path d="M0 ${editorY} h${GUTTER_WIDTH} v${editorH - r} h0 v${r} h-${
    GUTTER_WIDTH - r
  } q-${r} 0 -${r} -${r} Z" fill="${uiBg}" opacity="0.5" />`

  // Current line highlight (line 2)
  svg += `<rect x="${GUTTER_WIDTH}" y="${editorY + LINE_HEIGHT + 4}" width="${
    PANEL_WIDTH - GUTTER_WIDTH
  }" height="${LINE_HEIGHT}" fill="${lineColor}" />`

  // Line numbers, VCS indicators, and code
  const codeStartX = GUTTER_WIDTH + PADDING
  const codeStartY = editorY + LINE_HEIGHT

  for (let i = 0; i < codeLines.length; i++) {
    const y = codeStartY + i * LINE_HEIGHT
    const lineNum = i + 1
    const vcs = vcsIndicators[i]

    // VCS indicator
    if (vcs === 'added') {
      svg += `<rect x="2" y="${y - 14}" width="3" height="16" rx="1" fill="${vcsAdded}" />`
    } else if (vcs === 'modified') {
      svg += `<rect x="2" y="${y - 14}" width="3" height="16" rx="1" fill="${vcsModified}" />`
    }

    // Line number
    const numColor = i === 1 ? scheme.editor.gutter.active.hex() : gutterColor
    svg += `<text x="${
      GUTTER_WIDTH - 8
    }" y="${y}" text-anchor="end" font-family="IosevkaCustom, monospace" font-size="12" fill="${numColor}">${lineNum}</text>`

    // Code
    svg += renderCodeLine(scheme, codeLines[i], codeStartX, y)
  }

  // Cursor on line 2
  const cursorX = codeStartX + 6 * CHAR_WIDTH
  const cursorY = editorY + LINE_HEIGHT + 4
  svg += `<rect x="${cursorX}" y="${cursorY}" width="2" height="${LINE_HEIGHT}" fill="${accent}" />`

  // Panel border (drawn last, on top)
  svg += `<rect x="0.5" y="${offsetY + 0.5}" width="${PANEL_WIDTH - 1}" height="${
    PANEL_HEIGHT - 1
  }" rx="8" ry="8" fill="none" stroke="${panelBorder}" stroke-width="1" />`

  return svg
}

const totalHeight = PANEL_HEIGHT * 3 + GAP * 2
const svgContent = `<svg width="100%" viewBox="0 0 ${PANEL_WIDTH} ${totalHeight}" xmlns="http://www.w3.org/2000/svg">
  ${fontStyle}
  <g>
    ${themes.map((t, i) => renderPanel(t.scheme, t.name, i * (PANEL_HEIGHT + GAP))).join('\n    ')}
  </g>
</svg>`

fs.writeFileSync('colors.svg', svgContent, 'utf-8')
console.log('Generated colors.svg')

// ============================================
// Palette SVG - Debug reference with all colors
// ============================================

const PALETTE_WIDTH = 720
const SWATCH_WIDTH = 100
const SWATCH_HEIGHT = 32
const SWATCH_GAP = 12
const ROW_HEIGHT = 48
const SECTION_GAP = 24
const P_PADDING = 24
const LABEL_WIDTH = 140

const categories = [
  {
    name: 'Syntax',
    colors: [
      'tag',
      'func',
      'entity',
      'string',
      'regexp',
      'markup',
      'keyword',
      'special',
      'comment',
      'constant',
      'operator'
    ]
  },
  {
    name: 'VCS',
    colors: ['added', 'modified', 'removed']
  },
  {
    name: 'Editor',
    colors: [
      'fg',
      'bg',
      'line',
      'selection.active',
      'selection.inactive',
      'findMatch.active',
      'findMatch.inactive',
      'gutter.active',
      'gutter.normal',
      'indentGuide.active',
      'indentGuide.normal'
    ]
  },
  {
    name: 'UI',
    colors: ['fg', 'bg', 'line', 'selection.active', 'selection.normal', 'panel.bg', 'panel.shadow']
  },
  {
    name: 'Common',
    colors: ['accent', 'error']
  }
]

function getPaletteColor(scheme, category, colorName) {
  const cat = category.toLowerCase()
  const parts = colorName.split('.')
  let obj = scheme[cat]
  for (const part of parts) {
    if (!obj) return null
    obj = obj[part]
  }
  return obj instanceof Color ? obj : null
}

function contrastColor(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#000000' : '#ffffff'
}

function generatePalette() {
  let svg = ''
  let y = P_PADDING

  // Header row
  svg += `<text x="${P_PADDING}" y="${y + 16}" font-size="13" font-weight="600" fill="#5c6166">Color</text>`
  svg += `<text x="${P_PADDING + LABEL_WIDTH + SWATCH_WIDTH / 2}" y="${
    y + 16
  }" font-size="12" font-weight="500" fill="#8a9199" text-anchor="middle">Light</text>`
  svg += `<text x="${P_PADDING + LABEL_WIDTH + SWATCH_WIDTH + SWATCH_GAP + SWATCH_WIDTH / 2}" y="${
    y + 16
  }" font-size="12" font-weight="500" fill="#8a9199" text-anchor="middle">Mirage</text>`
  svg += `<text x="${P_PADDING + LABEL_WIDTH + (SWATCH_WIDTH + SWATCH_GAP) * 2 + SWATCH_WIDTH / 2}" y="${
    y + 16
  }" font-size="12" font-weight="500" fill="#8a9199" text-anchor="middle">Dark</text>`
  y += 32

  for (const category of categories) {
    // Category header
    svg += `<text x="${P_PADDING}" y="${
      y + 20
    }" font-size="11" font-weight="600" fill="#6c7380" letter-spacing="0.5">${category.name.toUpperCase()}</text>`
    y += 32

    for (const colorName of category.colors) {
      const lightColor = getPaletteColor(colors.light, category.name, colorName)
      const mirageColor = getPaletteColor(colors.mirage, category.name, colorName)
      const darkColor = getPaletteColor(colors.dark, category.name, colorName)

      if (!lightColor || !mirageColor || !darkColor) continue

      // Color name
      svg += `<text x="${P_PADDING}" y="${y + 22}" font-size="13" fill="#5c6166">${colorName}</text>`

      // Light swatch
      const lHex = lightColor.hex()
      const lx = P_PADDING + LABEL_WIDTH
      svg += `<rect x="${lx}" y="${y}" width="${SWATCH_WIDTH}" height="${SWATCH_HEIGHT}" rx="4" fill="${lHex}" />`
      svg += `<text x="${lx + SWATCH_WIDTH / 2}" y="${y + 20}" font-size="10" fill="${contrastColor(
        lHex.slice(0, 7)
      )}" text-anchor="middle" font-family="IosevkaCustom, monospace">${lHex.toUpperCase()}</text>`

      // Mirage swatch
      const mHex = mirageColor.hex()
      const mx = lx + SWATCH_WIDTH + SWATCH_GAP
      svg += `<rect x="${mx}" y="${y}" width="${SWATCH_WIDTH}" height="${SWATCH_HEIGHT}" rx="4" fill="${mHex}" />`
      svg += `<text x="${mx + SWATCH_WIDTH / 2}" y="${y + 20}" font-size="10" fill="${contrastColor(
        mHex.slice(0, 7)
      )}" text-anchor="middle" font-family="IosevkaCustom, monospace">${mHex.toUpperCase()}</text>`

      // Dark swatch
      const dHex = darkColor.hex()
      const dx = mx + SWATCH_WIDTH + SWATCH_GAP
      svg += `<rect x="${dx}" y="${y}" width="${SWATCH_WIDTH}" height="${SWATCH_HEIGHT}" rx="4" fill="${dHex}" />`
      svg += `<text x="${dx + SWATCH_WIDTH / 2}" y="${y + 20}" font-size="10" fill="${contrastColor(
        dHex.slice(0, 7)
      )}" text-anchor="middle" font-family="IosevkaCustom, monospace">${dHex.toUpperCase()}</text>`

      y += ROW_HEIGHT
    }

    y += SECTION_GAP
  }

  return { svg, height: y + P_PADDING }
}

const palette = generatePalette()
const paletteSvg = `<svg width="100%" viewBox="0 0 ${PALETTE_WIDTH} ${palette.height}" xmlns="http://www.w3.org/2000/svg" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
  ${fontStyle}
  <rect width="100%" height="100%" fill="#fafafa" />
  ${palette.svg}
</svg>`

fs.writeFileSync('palette.svg', paletteSvg, 'utf-8')
console.log('Generated palette.svg')
