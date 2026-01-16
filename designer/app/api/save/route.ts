import { readFileSync, writeFileSync } from 'node:fs'
import { exec } from 'node:child_process'
import { join } from 'node:path'
import { parseDocument } from 'yaml'
import { applyChangesToDocument, stringifyDocument } from '../../../../src/yaml-parser.js'

export async function POST(req: Request) {
  const { theme, rawData } = await req.json()
  const themePath = join(process.cwd(), 'themes', `${theme}.yaml`)

  // Read original YAML and parse as Document (preserves comments)
  const originalContent = readFileSync(themePath, 'utf-8')
  const doc = parseDocument(originalContent)

  // Apply changes from rawData to the Document
  applyChangesToDocument(doc, rawData)

  // Stringify the Document (preserves comments)
  writeFileSync(themePath, stringifyDocument(doc))

  // Rebuild types and dist
  await new Promise<void>((resolve, reject) => {
    exec('npm run build', (err) => {
      if (err) reject(err)
      else resolve()
    })
  })

  return Response.json({ ok: true })
}
