import { parse as parseYaml } from 'yaml'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PALETTE_STEPS } from './yaml-parser.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

function generateInterface(obj: Record<string, unknown>, indent = ''): string {
  const lines: string[] = []

  for (const key of Object.keys(obj)) {
    // Skip palette section - it's handled separately with dynamic types
    if (key === 'palette') continue

    const value = obj[key]

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      lines.push(`${indent}${key}: {`)
      lines.push(generateInterface(value as Record<string, unknown>, indent + '  '))
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

  const interfaceBody = generateInterface(data, '  ')
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
  const darkYaml = join(themesDir, 'dark.yaml')
  const outputPath = join(__dirname, '..', 'src', 'scheme.d.ts')

  generateTypes(darkYaml, outputPath)
  console.log(`Generated types at ${outputPath}`)
}
