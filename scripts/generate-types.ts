import { parse as parseYaml, parseDocument, isMap, type Scalar, type Pair } from 'yaml'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PALETTE_STEPS, type CommentsMap } from '../src/yaml-parser.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Extract comments from YAML document (duplicate of yaml-parser logic but needed here for types generation)
function extractCommentsFromDoc(content: string): CommentsMap {
  const comments: CommentsMap = new Map()

  function extractFromMap(map: unknown, pathPrefix: string[] = []): void {
    if (!isMap(map)) return

    const items = map.items
    for (let i = 0; i < items.length; i++) {
      const pair = items[i] as Pair
      const keyNode = pair.key as Scalar
      const key = String(keyNode.value)
      const fullPath = [...pathPrefix, key].join('.')

      let comment = keyNode.commentBefore?.trim()

      if (i === 0 && !comment) {
        const mapComment = (map as { commentBefore?: string }).commentBefore
        if (mapComment) {
          comment = mapComment.trim()
        }
      }

      if (comment) {
        comments.set(fullPath, comment)
      }

      if (isMap(pair.value)) {
        extractFromMap(pair.value, [...pathPrefix, key])
      }
    }
  }

  const doc = parseDocument(content)
  if (isMap(doc.contents)) {
    extractFromMap(doc.contents)
  }

  return comments
}

function generateInterface(
  obj: Record<string, unknown>,
  comments: CommentsMap,
  indent = '',
  pathPrefix: string[] = []
): string {
  const lines: string[] = []

  for (const key of Object.keys(obj)) {
    // Skip palette section - it's handled separately with dynamic types
    if (key === 'palette') continue

    const value = obj[key]
    const fullPath = [...pathPrefix, key].join('.')
    const comment = comments.get(fullPath)

    // Add JSDoc comment if available
    if (comment) {
      // Handle multi-line comments
      const commentLines = comment.split('\n')
      if (commentLines.length === 1) {
        lines.push(`${indent}/** ${comment} */`)
      } else {
        lines.push(`${indent}/**`)
        for (const line of commentLines) {
          lines.push(`${indent} * ${line}`)
        }
        lines.push(`${indent} */`)
      }
    }

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      lines.push(`${indent}${key}: {`)
      lines.push(generateInterface(value as Record<string, unknown>, comments, indent + '  ', [...pathPrefix, key]))
      lines.push(`${indent}}`)
    } else {
      lines.push(`${indent}${key}: Color`)
    }
  }

  return lines.join('\n')
}

function generatePaletteInterface(palette: Record<string, unknown>): string {
  const steps = Array.from({ length: PALETTE_STEPS }, (_, i) => `l${i + 1}: Color`).join('; ')
  const lines: string[] = []
  for (const key of Object.keys(palette)) {
    if (key === 'range' || key === 'steps') continue
    lines.push(`  ${key}: { ${steps} }`)
  }
  return lines.join('\n')
}

export function generateTypes(yamlPath: string, outputPath: string): void {
  const content = readFileSync(yamlPath, 'utf-8')
  const data = parseYaml(content) as Record<string, unknown>
  const comments = extractCommentsFromDoc(content)

  const interfaceBody = generateInterface(data, comments, '  ')
  const palette = data.palette as Record<string, unknown> | undefined
  const paletteBody = palette ? generatePaletteInterface(palette) : ''

  const output = `import type { Color } from './color.js'

export interface Palette {
${paletteBody}
}

export interface Scheme {
  palette: Palette
${interfaceBody}
}
`

  writeFileSync(outputPath, output)
}

// CLI entry point
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const themesDir = join(__dirname, '..', 'themes')
  // Use light.yaml for types since it has JSDoc comments
  const lightYaml = join(themesDir, 'light.yaml')
  const outputPath = join(__dirname, '..', 'src', 'scheme.d.ts')

  generateTypes(lightYaml, outputPath)
  console.log(`Generated types at ${outputPath}`)
}
