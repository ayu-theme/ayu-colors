import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { parse, oklch } from 'culori'
import { parse as parseYaml } from 'yaml'
import * as colors from '../src/colors.ts'
import { Color } from '../src/color.ts'
import type { Scheme } from '../src/colors.ts'

// Load palette configs from YAML to get original hex values
interface PaletteConfig {
  range: string
  [colorName: string]: string
}

function loadPaletteConfig(themePath: string): PaletteConfig | null {
  const content = fs.readFileSync(themePath, 'utf-8')
  const data = parseYaml(content) as Record<string, unknown>
  return (data.palette as PaletteConfig) || null
}

// Get hue value from hex color (for sorting)
function getHue(hex: string): number {
  const parsed = parse(hex)
  if (!parsed) return 0
  const ok = oklch(parsed)
  return ok?.h ?? 0
}

// Load palette configs for all themes
const paletteConfigs = {
  light: loadPaletteConfig('themes/light.yaml'),
  mirage: loadPaletteConfig('themes/mirage.yaml'),
  dark: loadPaletteConfig('themes/dark.yaml'),
}

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

type SyntaxKey = keyof Scheme['syntax']
type Token = [string, SyntaxKey | 'fg' | null]
type VcsIndicator = 'added' | 'modified' | null

const themes: { name: string; scheme: Scheme }[] = [
  { name: 'Light', scheme: colors.light },
  { name: 'Mirage', scheme: colors.mirage },
  { name: 'Dark', scheme: colors.dark },
]

// VCS indicators per line: null, 'added', or 'modified'
const vcsIndicators: VcsIndicator[] = [null, 'added', null, null, 'modified', null, null, null]

// Rust code tokens: [text, colorKey] - Unix-style process handler
const codeLines: Token[][] = [
  [
    ['// ', 'comment'],
    ['Unix-style process handler', 'comment'],
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
    [' {', 'fg'],
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
    [')', 'fg'],
  ],
  [
    ['        ', null],
    ['.', 'fg'],
    ['env', 'func'],
    ['(', 'fg'],
    ['"PATH"', 'string'],
    [', ', 'fg'],
    ['"/usr/bin"', 'string'],
    [')', 'fg'],
  ],
  [
    ['        ', null],
    ['.', 'fg'],
    ['spawn', 'func'],
    ['()', 'fg'],
    ['?', 'operator'],
    [';', 'fg'],
  ],
  [
    ['    ', null],
    ['match', 'keyword'],
    [' ', null],
    ['child', 'entity'],
    ['.', 'fg'],
    ['wait', 'func'],
    ['()', 'fg'],
    [' {', 'fg'],
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
    [',', 'fg'],
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
    [',', 'fg'],
  ],
]

function getColor(scheme: Scheme, key: SyntaxKey | 'fg' | null): string {
  if (!key || key === 'fg') return scheme.editor.fg.hex()
  if (key === 'comment') return scheme.syntax.comment.hex()
  return scheme.syntax[key]?.hex() || scheme.editor.fg.hex()
}

function renderCodeLine(scheme: Scheme, tokens: Token[], x: number, y: number): string {
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

function renderPanel(scheme: Scheme, name: string, offsetY: number): string {
  const bg = scheme.editor.bg.hex()
  const uiBg = scheme.ui.bg.hex()
  const uiFg = scheme.ui.fg.hex()
  const gutterColor = scheme.editor.lineNumber.normal.hex()
  const lineColor = scheme.editor.line.hex()
  const accent = scheme.common.accent.tint.hex()
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
    const numColor = i === 1 ? scheme.editor.lineNumber.active.hex() : gutterColor
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

// Palette swatch dimensions (dynamic based on actual step count)
const PALETTE_SWATCH_SIZE = 40
const PALETTE_SWATCH_GAP = 3
const firstPalette = Object.values(colors.light.palette)[0] as Record<string, Color>
const PALETTE_STEP_COUNT = Object.keys(firstPalette).length
const PALETTE_ROW_WIDTH = PALETTE_STEP_COUNT * PALETTE_SWATCH_SIZE + (PALETTE_STEP_COUNT - 1) * PALETTE_SWATCH_GAP

const SWATCH_WIDTH = PALETTE_ROW_WIDTH // Column width matches palette row
const SWATCH_HEIGHT = 32
const SWATCH_GAP = 48
const ROW_HEIGHT = 48
const PALETTE_ROW_HEIGHT = PALETTE_SWATCH_SIZE + 20 // Swatches + step labels
const SECTION_GAP = 24
const P_PADDING = 24
const LABEL_WIDTH = 140
const PALETTE_WIDTH = P_PADDING + LABEL_WIDTH + 3 * (SWATCH_WIDTH + SWATCH_GAP) + P_PADDING

interface Category {
  name: string
  key: string
  colors: string[]
}

// Recursively extract color paths like "selection.active"
function extractColorPaths(obj: unknown, prefix = ''): string[] {
  const paths: string[] = []
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (value instanceof Color) {
      paths.push(path)
    } else if (typeof value === 'object' && value !== null) {
      paths.push(...extractColorPaths(value, path))
    }
  }
  return paths
}

// Extract categories dynamically from scheme structure
function extractCategories(scheme: Record<string, unknown>): Category[] {
  const categories: Category[] = []
  for (const [key, value] of Object.entries(scheme)) {
    // Skip palette - it's rendered separately as a grid
    if (key === 'palette') continue
    if (typeof value === 'object' && value !== null) {
      const colorPaths = extractColorPaths(value)
      if (colorPaths.length > 0) {
        categories.push({
          name: key.charAt(0).toUpperCase() + key.slice(1),
          key,
          colors: colorPaths,
        })
      }
    }
  }
  return categories
}

const categories = extractCategories(colors.light as unknown as Record<string, unknown>)

function getPaletteColor(scheme: Scheme, categoryKey: string, colorName: string): Color | null {
  const parts = colorName.split('.')
  let obj: unknown = (scheme as unknown as Record<string, unknown>)[categoryKey]
  for (const part of parts) {
    if (!obj || typeof obj !== 'object') return null
    obj = (obj as Record<string, unknown>)[part]
  }
  return obj instanceof Color ? obj : null
}

function contrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#000000' : '#ffffff'
}

// Render a palette color row (10 swatches within a column)
function renderPaletteRow(scheme: Scheme, paletteName: string, originalHex: string, x: number, y: number): string {
  let svg = ''
  const paletteColors = (scheme.palette as unknown as Record<string, Record<string, Color>>)[paletteName]
  if (!paletteColors) return ''

  const originalHexNorm = originalHex.toLowerCase()
  const steps = Object.keys(paletteColors).sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)))
  let swatchX = x

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]
    const color = paletteColors[step]
    const hex = color.hex()
    const isOriginal = hex.toLowerCase().slice(0, 7) === `#${originalHexNorm.slice(0, 6)}`

    // Swatch
    svg += `<rect x="${swatchX}" y="${y}" width="${PALETTE_SWATCH_SIZE}" height="${PALETTE_SWATCH_SIZE}" rx="3" fill="${hex}" />`

    // Dot indicator for original/source color
    if (isOriginal) {
      const dotX = swatchX + PALETTE_SWATCH_SIZE - 6
      const dotY = y + 6
      const dotColor = contrastColor(hex.slice(0, 7))
      svg += `<circle cx="${dotX}" cy="${dotY}" r="3" fill="${dotColor}" />`
    }

    // Label below swatch (L1, L2, L3, etc.)
    svg += `<text x="${swatchX + PALETTE_SWATCH_SIZE / 2}" y="${
      y + PALETTE_SWATCH_SIZE + 12
    }" font-size="8" fill="#8a9199" text-anchor="middle" font-family="IosevkaCustom, monospace">L${i + 1}</text>`

    swatchX += PALETTE_SWATCH_SIZE + PALETTE_SWATCH_GAP
  }

  return svg
}

function generatePalette(): { svg: string; height: number } {
  let svg = ''
  let y = P_PADDING

  // Column X positions
  const lx = P_PADDING + LABEL_WIDTH
  const mx = lx + SWATCH_WIDTH + SWATCH_GAP
  const dx = mx + SWATCH_WIDTH + SWATCH_GAP

  // Header row for color categories
  svg += `<text x="${P_PADDING}" y="${y + 16}" font-size="13" font-weight="600" fill="#5c6166">Color</text>`
  svg += `<text x="${lx + SWATCH_WIDTH / 2}" y="${
    y + 16
  }" font-size="12" font-weight="500" fill="#8a9199" text-anchor="middle">Light</text>`
  svg += `<text x="${mx + SWATCH_WIDTH / 2}" y="${
    y + 16
  }" font-size="12" font-weight="500" fill="#8a9199" text-anchor="middle">Mirage</text>`
  svg += `<text x="${dx + SWATCH_WIDTH / 2}" y="${
    y + 16
  }" font-size="12" font-weight="500" fill="#8a9199" text-anchor="middle">Dark</text>`
  y += 32

  // Palette section - render palette colors with 10 swatches per column
  // Sort palette colors by hue (using light theme as reference)
  const paletteNames = Object.keys(colors.light.palette).sort((a, b) => {
    const hexA = paletteConfigs.light?.[a] || ''
    const hexB = paletteConfigs.light?.[b] || ''
    return getHue(hexA) - getHue(hexB)
  })
  if (paletteNames.length > 0) {
    svg += `<text x="${P_PADDING}" y="${
      y + 20
    }" font-size="11" font-weight="600" fill="#6c7380" letter-spacing="0.5">PALETTE</text>`
    y += 32

    for (const paletteName of paletteNames) {
      // Color name
      svg += `<text x="${P_PADDING}" y="${
        y + PALETTE_SWATCH_SIZE / 2 + 4
      }" font-size="13" fill="#5c6166">${paletteName}</text>`

      // Get original hex values for each theme
      const lightHex = paletteConfigs.light?.[paletteName] || ''
      const mirageHex = paletteConfigs.mirage?.[paletteName] || ''
      const darkHex = paletteConfigs.dark?.[paletteName] || ''

      // Render palette row for each theme with original hex for marker
      svg += renderPaletteRow(colors.light, paletteName, lightHex, lx, y)
      svg += renderPaletteRow(colors.mirage, paletteName, mirageHex, mx, y)
      svg += renderPaletteRow(colors.dark, paletteName, darkHex, dx, y)

      y += PALETTE_ROW_HEIGHT
    }

    y += SECTION_GAP
  }

  // Regular color categories
  for (const category of categories) {
    // Category header
    svg += `<text x="${P_PADDING}" y="${
      y + 20
    }" font-size="11" font-weight="600" fill="#6c7380" letter-spacing="0.5">${category.name.toUpperCase()}</text>`
    y += 32

    for (const colorName of category.colors) {
      const lightColor = getPaletteColor(colors.light, category.key, colorName)
      const mirageColor = getPaletteColor(colors.mirage, category.key, colorName)
      const darkColor = getPaletteColor(colors.dark, category.key, colorName)

      if (!lightColor || !mirageColor || !darkColor) continue

      // Color name
      svg += `<text x="${P_PADDING}" y="${y + 22}" font-size="13" fill="#5c6166">${colorName}</text>`

      // Light swatch
      const lHex = lightColor.hex()
      svg += `<rect x="${lx}" y="${y}" width="${SWATCH_WIDTH}" height="${SWATCH_HEIGHT}" rx="4" fill="${lHex}" />`
      svg += `<text x="${lx + SWATCH_WIDTH / 2}" y="${y + 20}" font-size="10" fill="${contrastColor(
        lHex.slice(0, 7)
      )}" text-anchor="middle" font-family="IosevkaCustom, monospace">${lHex.toUpperCase()}</text>`

      // Mirage swatch
      const mHex = mirageColor.hex()
      svg += `<rect x="${mx}" y="${y}" width="${SWATCH_WIDTH}" height="${SWATCH_HEIGHT}" rx="4" fill="${mHex}" />`
      svg += `<text x="${mx + SWATCH_WIDTH / 2}" y="${y + 20}" font-size="10" fill="${contrastColor(
        mHex.slice(0, 7)
      )}" text-anchor="middle" font-family="IosevkaCustom, monospace">${mHex.toUpperCase()}</text>`

      // Dark swatch
      const dHex = darkColor.hex()
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

// Column positions - backgrounds touch (extend into gap)
const lightColX = P_PADDING + LABEL_WIDTH
const mirageColX = lightColX + SWATCH_WIDTH + SWATCH_GAP
const darkColX = mirageColX + SWATCH_WIDTH + SWATCH_GAP
const colWidth = SWATCH_WIDTH + SWATCH_GAP / 2
const lastColWidth = PALETTE_WIDTH - darkColX

const paletteSvg = `<svg width="100%" viewBox="0 0 ${PALETTE_WIDTH} ${
  palette.height
}" xmlns="http://www.w3.org/2000/svg" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
  ${fontStyle}
  <rect width="100%" height="100%" fill="#fafafa" />
  <rect x="${lightColX}" y="0" width="${colWidth}" height="${palette.height}" fill="${colors.light.ui.bg.hex()}" />
  <rect x="${mirageColX - SWATCH_GAP / 2}" y="0" width="${colWidth + SWATCH_GAP / 2}" height="${
  palette.height
}" fill="${colors.mirage.ui.bg.hex()}" />
  <rect x="${darkColX - SWATCH_GAP / 2}" y="0" width="${lastColWidth + SWATCH_GAP / 2}" height="${
  palette.height
}" fill="${colors.dark.ui.bg.hex()}" />
  ${palette.svg}
</svg>`

fs.writeFileSync('palette.svg', paletteSvg, 'utf-8')
console.log('Generated palette.svg')
