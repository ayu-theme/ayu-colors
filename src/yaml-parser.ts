import { parseDocument, isMap, isScalar, type Document, type Scalar, type Pair } from 'yaml'
import { readFileSync } from 'node:fs'
import { Color } from './color.js'

// Preprocess YAML content to quote hex color values that YAML would misinterpret
// Values like 555E73 get parsed as scientific notation (5.55e+75)
function preprocessYaml(content: string): string {
  // Match unquoted 6-8 char hex values (colors) at the end of lines
  // This quotes values like: 555E73, 39BAE6, FF0000, etc.
  return content.replace(/: ([0-9A-Fa-f]{6,8})(\s*)$/gm, ': "$1"$2')
}

// Comments map: path -> comment string
export type CommentsMap = Map<string, string>

export const PALETTE_STEPS = 5

interface PaletteConfig {
  range: string
  colors: Record<string, string>
}

interface Modifier {
  op: '' | '+' | '-'
  type: 'A' | 'L' | 'C'
  value: number
}

interface ParsedRef {
  type: 'ref'
  path: string[]
  modifiers: Modifier[]
}

interface ParsedHex {
  type: 'hex'
  value: string
  modifiers: Modifier[]
}

type ParsedValue = ParsedHex | ParsedRef

const MODIFIER_PATTERN = /^([+-]?)([ALC])(\d*\.?\d+)$/
const RANGE_PATTERN = /^R(\d*\.?\d+):(\d*\.?\d+)$/

interface PaletteColorValue {
  hex: string
  range?: { min: number; max: number }
}

// Parse palette color value: "4d565e" or "4d565e R0.35:0.55"
function parsePaletteColorValue(value: string): PaletteColorValue {
  const tokens = String(value).trim().split(/\s+/)
  const hex = tokens[0]

  for (const token of tokens.slice(1)) {
    const match = token.match(RANGE_PATTERN)
    if (match) {
      return { hex, range: { min: parseFloat(match[1]), max: parseFloat(match[2]) } }
    }
  }

  return { hex }
}

// Parse space-separated modifiers: A0.55 -L0.1 +L0.2
function parseModifiers(tokens: string[]): Modifier[] {
  return tokens.map(token => {
    const match = token.match(MODIFIER_PATTERN)
    if (!match) {
      throw new Error(`Invalid modifier: ${token}`)
    }
    return {
      op: (match[1] || '') as '' | '+' | '-',
      type: match[2] as 'A' | 'L' | 'C',
      value: parseFloat(match[3]),
    }
  })
}

// Parse a single color value string
function parseColorValue(value: string): ParsedValue {
  const str = String(value).trim()
  const tokens = str.split(/\s+/)
  const base = tokens[0]
  const modifierTokens = tokens.slice(1)

  if (base.startsWith('$')) {
    return {
      type: 'ref',
      path: base.slice(1).split('.'),
      modifiers: parseModifiers(modifierTokens),
    }
  } else {
    return {
      type: 'hex',
      value: base,
      modifiers: parseModifiers(modifierTokens),
    }
  }
}

// Apply modifiers to a Color instance
function applyModifiers(color: Color, modifiers: Modifier[]): Color {
  let result = color
  for (const { op, type, value } of modifiers) {
    if (type === 'A') {
      if (op === '') {
        result = result.alpha(value)
      } else if (op === '+') {
        result = result.alpha(result.getAlpha() + value)
      } else {
        result = result.alpha(result.getAlpha() - value)
      }
    } else if (type === 'L') {
      if (op === '') {
        result = result.setL(value)
      } else if (op === '+') {
        result = result.deltaL(value)
      } else {
        result = result.deltaL(-value)
      }
    } else {
      if (op === '') {
        result = result.setC(value)
      } else if (op === '+') {
        result = result.deltaC(value)
      } else {
        result = result.deltaC(-value)
      }
    }
  }
  return result
}

// Recursively process YAML object
function processObject(
  obj: Record<string, unknown>,
  result: Record<string, unknown>,
  pendingRefs: Map<string, { target: Record<string, unknown>; key: string; parsed: ParsedRef }>,
  pathPrefix: string[] = []
): void {
  for (const key of Object.keys(obj)) {
    const value = obj[key]
    const fullPath = [...pathPrefix, key].join('.')

    if (typeof value === 'string' || typeof value === 'number') {
      const parsed = parseColorValue(String(value))

      if (parsed.type === 'hex') {
        const baseColor = new Color(parsed.value)
        result[key] = applyModifiers(baseColor, parsed.modifiers)
      } else {
        pendingRefs.set(fullPath, { target: result, key, parsed })
      }
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      result[key] = {}
      processObject(value as Record<string, unknown>, result[key] as Record<string, unknown>, pendingRefs, [
        ...pathPrefix,
        key,
      ])
    }
  }
}

// Resolve a reference path against the result object
function resolveRef(
  parsed: ParsedRef,
  root: Record<string, unknown>,
  resolving: Set<string>,
  pendingRefs: Map<string, { target: Record<string, unknown>; key: string; parsed: ParsedRef }>
): Color {
  const pathKey = parsed.path.join('.')

  if (resolving.has(pathKey)) {
    throw new Error(`Circular color reference: ${pathKey}`)
  }

  resolving.add(pathKey)

  // If the target is a pending ref, resolve it first
  if (pendingRefs.has(pathKey)) {
    const pending = pendingRefs.get(pathKey)!
    if (!pending.target[pending.key]) {
      pending.target[pending.key] = resolveRef(pending.parsed, root, resolving, pendingRefs)
    }
  }

  // Navigate to the referenced color in result tree
  let current: unknown = root
  for (const segment of parsed.path) {
    if (typeof current !== 'object' || current === null) {
      throw new Error(`Invalid path segment '${segment}' in reference: ${pathKey}`)
    }
    current = (current as Record<string, unknown>)[segment]
  }

  if (!(current instanceof Color)) {
    throw new Error(`Reference '${pathKey}' does not resolve to a Color (got ${typeof current})`)
  }

  resolving.delete(pathKey)

  // Apply this reference's modifiers to the referenced color (preserving its deferred state)
  return applyModifiers(current, parsed.modifiers)
}

// Extract palette config from data and remove it
function extractPaletteConfig(data: Record<string, unknown>): PaletteConfig | null {
  const paletteData = data.palette
  if (!paletteData || typeof paletteData !== 'object') {
    return null
  }

  const palette = paletteData as Record<string, unknown>
  const rangeValue = palette.range
  if (rangeValue === undefined) {
    return null
  }

  // Handle range as string (quoted in YAML) or convert from other types
  const range = String(rangeValue)

  const colors: Record<string, string> = {}
  for (const key of Object.keys(palette)) {
    if (key !== 'range' && key !== 'steps') {
      colors[key] = String(palette[key])
    }
  }

  return { range, colors }
}

// Parse range string like "0.5:0.8" into [minL, maxL]
function parseRange(range: string): [number, number] {
  const parts = range.split(':')
  if (parts.length !== 2) {
    throw new Error(`Invalid palette range: ${range}. Expected format "minL:maxL"`)
  }
  return [parseFloat(parts[0]), parseFloat(parts[1])]
}

// Generate palette colors and add to result object
function processPalette(config: PaletteConfig, result: Record<string, unknown>): void {
  const [globalMinL, globalMaxL] = parseRange(config.range)
  const paletteResult: Record<string, Record<string, Color>> = {}

  for (const [name, rawValue] of Object.entries(config.colors)) {
    const { hex, range } = parsePaletteColorValue(rawValue)
    const minL = range?.min ?? globalMinL
    const maxL = range?.max ?? globalMaxL

    const paletteMap = Color.generatePalette(hex, PALETTE_STEPS, minL, maxL)
    const colorSteps: Record<string, Color> = {}
    const sortedSteps = [...paletteMap.keys()].sort((a, b) => a - b)
    for (let i = 0; i < sortedSteps.length; i++) {
      colorSteps[`l${i + 1}`] = paletteMap.get(sortedSteps[i])!
    }
    paletteResult[name] = colorSteps
  }

  result.palette = paletteResult
}

// Extract comments from YAML map node
function extractCommentsFromMap(
  map: unknown,
  comments: CommentsMap,
  pathPrefix: string[] = []
): void {
  if (!isMap(map)) return

  const items = map.items
  for (let i = 0; i < items.length; i++) {
    const pair = items[i] as Pair
    const keyNode = pair.key as Scalar
    const key = String(keyNode.value)
    const fullPath = [...pathPrefix, key].join('.')

    // Get comment from the key node (commentBefore is the line(s) above)
    let comment = keyNode.commentBefore?.trim()

    // For the first item in a map, the comment might be attached to the map itself
    // (YAML parser attaches comments before first item to the map's commentBefore)
    if (i === 0 && !comment) {
      const mapComment = (map as { commentBefore?: string }).commentBefore
      if (mapComment) {
        comment = mapComment.trim()
      }
    }

    if (comment) {
      comments.set(fullPath, comment)
    }

    // Recurse into nested maps
    if (isMap(pair.value)) {
      extractCommentsFromMap(pair.value, comments, [...pathPrefix, key])
    }
  }
}

function extractComments(doc: ReturnType<typeof parseDocument>, comments: CommentsMap): void {
  const contents = doc.contents
  if (!isMap(contents)) return
  extractCommentsFromMap(contents, comments)
}

// Parse YAML content and return Color objects
export function parseColors<T>(yamlContent: string): T {
  const doc = parseDocument(preprocessYaml(yamlContent))
  const data = doc.toJS() as Record<string, unknown>
  const result: Record<string, unknown> = {}
  const pendingRefs = new Map<string, { target: Record<string, unknown>; key: string; parsed: ParsedRef }>()

  // Extract and process palette section first (so it's available for references)
  const paletteConfig = extractPaletteConfig(data)
  if (paletteConfig) {
    processPalette(paletteConfig, result)
    delete data.palette // Remove from data so it's not processed again
  }

  // First pass: process hex values
  processObject(data, result, pendingRefs)

  // Second pass: resolve references
  const resolving = new Set<string>()
  for (const [, { target, key, parsed }] of pendingRefs) {
    if (!target[key]) {
      target[key] = resolveRef(parsed, result, resolving, pendingRefs)
    }
  }

  return result as T
}

// Parse YAML content and return Color objects along with comments
export function parseColorsWithComments<T>(yamlContent: string): { colors: T; comments: CommentsMap } {
  const doc = parseDocument(preprocessYaml(yamlContent))
  const data = doc.toJS() as Record<string, unknown>
  const result: Record<string, unknown> = {}
  const pendingRefs = new Map<string, { target: Record<string, unknown>; key: string; parsed: ParsedRef }>()
  const comments: CommentsMap = new Map()

  // Extract comments from the document
  extractComments(doc, comments)

  // Extract and process palette section first (so it's available for references)
  const paletteConfig = extractPaletteConfig(data)
  if (paletteConfig) {
    processPalette(paletteConfig, result)
    delete data.palette // Remove from data so it's not processed again
  }

  // First pass: process hex values
  processObject(data, result, pendingRefs)

  // Second pass: resolve references
  const resolving = new Set<string>()
  for (const [, { target, key, parsed }] of pendingRefs) {
    if (!target[key]) {
      target[key] = resolveRef(parsed, result, resolving, pendingRefs)
    }
  }

  return { colors: result as T, comments }
}

// Load and parse a YAML file
export function loadColors<T>(filePath: string): T {
  const content = readFileSync(filePath, 'utf-8')
  return parseColors<T>(content)
}

// Update a value in a YAML document at the given path
export function updateDocumentValue(doc: Document, path: string[], newValue: string): void {
  if (!isMap(doc.contents)) return

  let current: unknown = doc.contents
  for (let i = 0; i < path.length - 1; i++) {
    if (!isMap(current)) return
    const items = (current as { items: Pair[] }).items
    const pair = items.find(p => {
      const keyNode = p.key as Scalar
      return String(keyNode.value) === path[i]
    })
    if (!pair) return
    current = pair.value
  }

  if (!isMap(current)) return
  const items = (current as { items: Pair[] }).items
  const lastKey = path[path.length - 1]
  const pair = items.find(p => {
    const keyNode = p.key as Scalar
    return String(keyNode.value) === lastKey
  })

  if (pair && isScalar(pair.value)) {
    pair.value.value = newValue
  }
}

// Stringify a YAML document (preserves comments)
export function stringifyDocument(doc: Document): string {
  return doc.toString({ lineWidth: 0 })
}

// Parse YAML content and return both the Document (for editing) and JS data
export function parseYamlDocument(yamlContent: string): { doc: Document; data: Record<string, unknown> } {
  const doc = parseDocument(preprocessYaml(yamlContent))
  const data = doc.toJS() as Record<string, unknown>
  return { doc, data }
}

// Apply changes from rawData to a YAML document, preserving comments
export function applyChangesToDocument(
  doc: Document,
  rawData: Record<string, unknown>,
  pathPrefix: string[] = []
): void {
  if (!isMap(doc.contents) && pathPrefix.length === 0) return

  const targetMap = pathPrefix.length === 0 ? doc.contents : getMapAtPath(doc, pathPrefix)
  if (!isMap(targetMap)) return

  applyChangesToMap(targetMap, rawData, pathPrefix)
}

// Helper: get the map node at a given path
function getMapAtPath(doc: Document, path: string[]): unknown {
  let current: unknown = doc.contents
  for (const key of path) {
    if (!isMap(current)) return null
    const items = (current as { items: Pair[] }).items
    const pair = items.find(p => {
      const keyNode = p.key as Scalar
      return String(keyNode.value) === key
    })
    if (!pair) return null
    current = pair.value
  }
  return current
}

// Helper: recursively apply changes to a map
function applyChangesToMap(
  map: unknown,
  data: Record<string, unknown>,
  pathPrefix: string[]
): void {
  if (!isMap(map)) return

  const items = (map as { items: Pair[] }).items
  for (const pair of items) {
    const keyNode = pair.key as Scalar
    const key = String(keyNode.value)
    const newValue = data[key]

    if (newValue === undefined) continue

    if (typeof newValue === 'object' && newValue !== null && !Array.isArray(newValue)) {
      // Recurse into nested objects
      applyChangesToMap(pair.value, newValue as Record<string, unknown>, [...pathPrefix, key])
    } else if (isScalar(pair.value)) {
      // Update scalar value
      pair.value.value = String(newValue)
    }
  }
}
