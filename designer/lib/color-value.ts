import type { ColorValue, Modifier, RangeModifier } from '../types'
import { parseModifiers, parseRangeModifier, formatRangeModifier } from './color-utils'

/**
 * Parse a raw YAML color value into a ColorValue object
 * Examples:
 *   "FF0000" -> { type: 'hex', hex: '#FF0000' }
 *   "FF0000 A0.55" -> { type: 'hex', hex: '#FF0000', modifiers: [{ op: '', type: 'A', value: 0.55 }] }
 *   "$syntax.markup" -> { type: 'reference', hex: resolvedHex, reference: '$syntax.markup' }
 *   "$syntax.markup -L0.07" -> { type: 'reference', hex: resolvedHex, reference: '$syntax.markup', modifiers: [...] }
 */
export function parseRawValue(rawValue: string, resolvedHex: string): ColorValue {
  const trimmed = String(rawValue).trim()
  const tokens = trimmed.split(/\s+/)
  const base = tokens[0]
  const modifiers = parseModifiers(tokens.slice(1))

  if (base.startsWith('$')) {
    return {
      type: 'reference',
      hex: resolvedHex,
      reference: base,
      modifiers: modifiers.length > 0 ? modifiers : undefined
    }
  } else {
    // Normalize base hex (add # if needed)
    const baseHex = base.startsWith('#') ? base : '#' + base
    return {
      type: 'hex',
      hex: resolvedHex,
      baseHex: baseHex.toUpperCase(),
      modifiers: modifiers.length > 0 ? modifiers : undefined
    }
  }
}

/**
 * Serialize a ColorValue back to YAML string format
 * Examples:
 *   { type: 'hex', hex: '#FF0000' } -> "FF0000"
 *   { type: 'reference', reference: '$syntax.markup', modifiers: [...] } -> "$syntax.markup -L0.07"
 */
export function serializeColorValue(value: ColorValue): string {
  const formatModifier = (m: Modifier): string => `${m.op}${m.type}${m.value}`

  if (value.type === 'hex') {
    // Return hex without # prefix (YAML format)
    let hex = value.hex.replace('#', '').toUpperCase()
    // Only take first 6 chars (no alpha in base hex)
    if (hex.length > 6) hex = hex.slice(0, 6)
    if (value.modifiers && value.modifiers.length > 0) {
      hex += ' ' + value.modifiers.map(formatModifier).join(' ')
    }
    return hex
  } else {
    // Reference format
    let ref = value.reference!
    if (value.modifiers && value.modifiers.length > 0) {
      ref += ' ' + value.modifiers.map(formatModifier).join(' ')
    }
    return ref
  }
}


/**
 * Check if a raw value is a reference (starts with $)
 */
export function isReference(rawValue: string | undefined): boolean {
  if (!rawValue) return false
  return String(rawValue).trim().startsWith('$')
}

/**
 * Parse a palette color value (hex with optional R modifier)
 * Examples:
 *   "BFBDB6" -> { hex: "BFBDB6" }
 *   "BFBDB6 R0.4:0.6" -> { hex: "BFBDB6", range: { min: 0.4, max: 0.6 } }
 */
export function parsePaletteValue(rawValue: string): { hex: string; range?: RangeModifier } {
  const tokens = String(rawValue).trim().split(/\s+/)
  const hex = tokens[0]
  const range = parseRangeModifier(tokens.slice(1))
  return { hex, range }
}

/**
 * Format a palette color value back to string
 * Examples:
 *   { hex: "BFBDB6" } -> "BFBDB6"
 *   { hex: "BFBDB6", range: { min: 0.4, max: 0.6 } } -> "BFBDB6 R0.4:0.6"
 */
export function formatPaletteValue(hex: string, range?: RangeModifier): string {
  if (range) {
    return `${hex} ${formatRangeModifier(range)}`
  }
  return hex
}
