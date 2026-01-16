import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse as parseYaml } from 'yaml'
import { Color } from '../src/color.js'
import { parseColorsWithComments, type CommentsMap } from '../src/yaml-parser.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const themesDir = join(__dirname, '..', 'themes')
const outputDir = join(__dirname, '..', 'src', 'generated')

// Ensure output directory exists
mkdirSync(outputDir, { recursive: true })

// --- Code generation ---

function generateColorExpr(color: Color): string {
  const hex = color.hex()
  // Remove # prefix for Color constructor
  return `new Color('${hex.slice(1)}')`
}

function generateValue(value: unknown, indent: string, comments: CommentsMap, pathPrefix: string[]): string {
  if (value instanceof Color) {
    return generateColorExpr(value)
  }
  if (typeof value === 'object' && value !== null) {
    return generateObject(value as Record<string, unknown>, indent, comments, pathPrefix)
  }
  throw new Error(`Unexpected value type: ${typeof value}`)
}

function formatJsDocComment(comment: string, indent: string): string {
  const lines = comment.split('\n')
  if (lines.length === 1) {
    return `${indent}/** ${comment} */\n`
  }
  const formattedLines = lines.map(line => `${indent} * ${line}`).join('\n')
  return `${indent}/**\n${formattedLines}\n${indent} */\n`
}

function generateObject(obj: Record<string, unknown>, indent: string, comments: CommentsMap, pathPrefix: string[] = []): string {
  const entries = Object.entries(obj)
  const lines = entries.map(([key, value]) => {
    const fullPath = [...pathPrefix, key].join('.')
    const comment = comments.get(fullPath)
    const valueStr = generateValue(value, indent + '  ', comments, [...pathPrefix, key])
    const commentStr = comment ? formatJsDocComment(comment, indent + '  ') : ''
    return `${commentStr}${indent}  ${key}: ${valueStr},`
  })
  return `{\n${lines.join('\n')}\n${indent}}`
}

function generateTheme(name: string): void {
  const yamlPath = join(themesDir, `${name}.yaml`)
  const content = readFileSync(yamlPath, 'utf-8')
  const { colors: scheme, comments } = parseColorsWithComments<Record<string, unknown>>(content)

  const code = `// Auto-generated from themes/${name}.yaml - DO NOT EDIT
import { Color } from '../color.js'
import type { Scheme } from '../scheme.js'

export const ${name}: Scheme = ${generateObject(scheme, '', comments)}
`

  writeFileSync(join(outputDir, `${name}.ts`), code)
  console.log(`Generated ${name}.ts`)
}

// --- Icons generation ---

function generateIconsValue(value: unknown, indent: string): string {
  if (typeof value === 'string') {
    return `'${value.replace(/'/g, "\\'")}'`
  }
  if (typeof value === 'object' && value !== null) {
    const entries = Object.entries(value as Record<string, unknown>)
    const lines = entries.map(([key, v]) => {
      const keyStr = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `'${key}'`
      const valueStr = generateIconsValue(v, indent + '  ')
      return `${indent}  ${keyStr}: ${valueStr},`
    })
    return `{\n${lines.join('\n')}\n${indent}}`
  }
  throw new Error(`Unexpected icons value type: ${typeof value}`)
}

function generateIcons(): void {
  const yamlPath = join(themesDir, 'icons.yaml')
  const content = readFileSync(yamlPath, 'utf-8')
  const data = parseYaml(content) as Record<string, unknown>

  const code = `// Auto-generated from themes/icons.yaml - DO NOT EDIT

export const iconsData = ${generateIconsValue(data, '')} as const
`

  writeFileSync(join(outputDir, 'icons.ts'), code)
  console.log('Generated icons.ts')
}

// --- Main ---

for (const name of ['dark', 'light', 'mirage']) {
  generateTheme(name)
}

generateIcons()

console.log('Theme generation complete!')
