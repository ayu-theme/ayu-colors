import { parse, oklch, formatHex, clampChroma } from 'culori'
import type { Oklch } from 'culori'
import { APCAcontrast, sRGBtoY } from 'apca-w3'
import type { Modifier, RangeModifier } from '../types'

export function parseHexToOklch(hex: string): Oklch | null {
  const parsed = parse(hex)
  if (!parsed) return null
  return oklch(parsed) as Oklch
}

export function formatOklch(ok: Oklch): string {
  return `${(ok.l * 100).toFixed(0)}% ${((ok.c || 0) * 100).toFixed(0)}% ${(ok.h || 0).toFixed(0)}°`
}

export function parseHexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return [r, g, b]
}

export function getAlpha(hex: string): number {
  return hex.length === 9 ? parseInt(hex.slice(7, 9), 16) / 255 : 1
}

export function getAPCAContrast(fg: string, bg: string): number {
  const [fgR, fgG, fgB] = parseHexToRgb(fg)
  const [bgR, bgG, bgB] = parseHexToRgb(bg)
  const textY = sRGBtoY([fgR, fgG, fgB])
  const bgY = sRGBtoY([bgR, bgG, bgB])
  return APCAcontrast(textY, bgY) as number
}

export function maxChromaAt(l: number, h: number | undefined): number {
  const clamped = clampChroma({ mode: 'oklch', l, c: 0.5, h }, 'oklch')
  const ok = oklch(clamped) as Oklch
  return ok?.c ?? 0
}

export function generatePalettePreview(hex: string, steps: number, minL: number, maxL: number): string[] {
  const parsed = parse(hex)
  if (!parsed) return []
  const orig = oklch(parsed) as Oklch
  if (!orig) return []

  const origMaxC = maxChromaAt(orig.l, orig.h)
  const ratio = origMaxC > 0 ? (orig.c ?? 0) / origMaxC : 0

  const colors: string[] = []
  for (let i = 0; i < steps; i++) {
    const l = minL + (maxL - minL) * (i / (steps - 1))
    const maxC = maxChromaAt(l, orig.h)
    const c = maxC * ratio
    const clamped = clampChroma({ mode: 'oklch', l, c, h: orig.h }, 'oklch')
    colors.push(formatHex(clamped) ?? '#000000')
  }
  return colors
}

export function formatHexWithAlpha(hex: string, alpha: number): string {
  const base = hex.slice(0, 7)
  if (alpha >= 1) return base
  const alphaHex = Math.round(alpha * 255).toString(16).padStart(2, '0')
  return base + alphaHex
}

const MODIFIER_PATTERN = /^([+-]?)([ALC])(\d*\.?\d+)$/

export function parseModifiers(tokens: string[]): Modifier[] {
  return tokens.map(token => {
    const match = token.match(MODIFIER_PATTERN)
    if (!match) return null
    return {
      op: (match[1] || '') as '' | '+' | '-',
      type: match[2] as 'A' | 'L' | 'C',
      value: parseFloat(match[3]),
    }
  }).filter((m): m is Modifier => m !== null)
}

const RANGE_PATTERN = /^R(\d*\.?\d+):(\d*\.?\d+)$/

export function parseRangeModifier(tokens: string[]): RangeModifier | undefined {
  for (const token of tokens) {
    const match = token.match(RANGE_PATTERN)
    if (match) {
      return { min: parseFloat(match[1]), max: parseFloat(match[2]) }
    }
  }
  return undefined
}

export function formatRangeModifier(range: RangeModifier): string {
  return `R${range.min}:${range.max}`
}

export function applyModifiers(hex: string, modifiers: Modifier[]): string {
  const ok = parseHexToOklch(hex)
  if (!ok) return hex

  let l = ok.l
  let c = ok.c ?? 0
  let h = ok.h
  let alpha = getAlpha(hex)

  for (const { op, type, value } of modifiers) {
    if (type === 'A') {
      if (op === '') alpha = value
      else if (op === '+') alpha = Math.min(1, alpha + value)
      else alpha = Math.max(0, alpha - value)
    } else if (type === 'L') {
      if (op === '') l = value
      else if (op === '+') l = Math.min(1, l + value)
      else l = Math.max(0, l - value)
    } else {
      if (op === '') c = value
      else if (op === '+') c = c + value
      else c = Math.max(0, c - value)
    }
  }

  const clamped = clampChroma({ mode: 'oklch', l, c, h }, 'oklch')
  const result = formatHex(clamped) ?? '#000000'
  return formatHexWithAlpha(result, alpha)
}

// Get nested value from object by dot path
export function getByPath(obj: unknown, path: string): string | undefined {
  let current = obj
  for (const part of path.split('.')) {
    if (!current || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[part]
  }
  return typeof current === 'string' ? current : undefined
}

// Parse reference string and extract base path
export function parseReference(rawValue: string): { basePath: string; modifiers: Modifier[] } | null {
  const str = String(rawValue).trim()
  const tokens = str.split(/\s+/)
  const base = tokens[0]

  if (!base.startsWith('$')) return null

  return {
    basePath: base.slice(1), // Remove $
    modifiers: parseModifiers(tokens.slice(1)),
  }
}

// Resolve a color reference to hex
export function resolveColorReference(rawValue: string, themeData: Record<string, unknown>): string | null {
  const ref = parseReference(rawValue)
  if (!ref) return null

  const baseHex = getByPath(themeData, ref.basePath)
  if (!baseHex) return null

  // Normalize hex format
  const hex = baseHex.startsWith('#') ? baseHex : `#${baseHex}`

  if (ref.modifiers.length === 0) return hex
  return applyModifiers(hex, ref.modifiers)
}


// Dependency map: basePath -> Set of { fullPath, rawValue }
export type DependencyMap = Map<string, Set<{ fullPath: string; rawValue: string }>>

// Build dependency map from rawData
export function buildDependencyMap(rawData: Record<string, unknown>, prefix = ''): DependencyMap {
  const deps: DependencyMap = new Map()

  function traverse(obj: unknown, currentPath: string[]) {
    if (!obj || typeof obj !== 'object') return

    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const fullPath = [...currentPath, key].join('.')

      if (typeof value === 'string') {
        const ref = parseReference(value)
        if (ref) {
          if (!deps.has(ref.basePath)) {
            deps.set(ref.basePath, new Set())
          }
          deps.get(ref.basePath)!.add({ fullPath, rawValue: value })
        }
      } else if (typeof value === 'object' && value !== null) {
        traverse(value, [...currentPath, key])
      }
    }
  }

  traverse(rawData, prefix ? [prefix] : [])
  return deps
}

export { clampChroma, formatHex, oklch }
