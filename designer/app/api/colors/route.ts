import { readFileSync } from 'node:fs'
import { parse } from 'yaml'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

// Serialize Color instances to hex strings (with alpha when needed)
function serializeColors(obj: unknown, ColorClass: unknown): unknown {
  if (obj && typeof obj === 'object' && obj.constructor.name === 'Color') {
    return (obj as { hex(): string }).hex()
  }
  if (Array.isArray(obj)) {
    return obj.map(v => serializeColors(v, ColorClass))
  }
  if (obj !== null && typeof obj === 'object') {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj)) {
      result[key] = serializeColors(value, ColorClass)
    }
    return result
  }
  return obj
}

export async function GET() {
  // Dynamic import from absolute path (yaml-parser is compiled to dist/)
  const distPath = join(process.cwd(), 'dist')
  const yamlParserUrl = pathToFileURL(join(distPath, 'yaml-parser.js')).href
  const { parseColors } = await import(/* webpackIgnore: true */ yamlParserUrl)

  const themesDir = join(process.cwd(), 'themes')

  const themes = ['light', 'mirage', 'dark'].map(name => {
    const content = readFileSync(join(themesDir, `${name}.yaml`), 'utf-8')
    // Parse with full color processing (handles references, modifiers, alpha)
    const parsed = parseColors(content)
    // Also include raw YAML values for editing (preserves references like "$syntax.markup -L0.07")
    const raw = parse(content) as Record<string, unknown>
    return {
      name,
      data: serializeColors(parsed, null),
      rawData: raw,
      rawPalette: raw.palette
    }
  })

  return Response.json(themes)
}
