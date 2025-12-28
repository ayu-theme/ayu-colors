import { writeFileSync } from 'node:fs'
import { stringify } from 'yaml'
import { exec } from 'node:child_process'
import { join } from 'node:path'

export async function POST(req: Request) {
  const { theme, rawData } = await req.json()
  const themePath = join(process.cwd(), 'themes', `${theme}.yaml`)

  // Write YAML with no line wrapping - rawData preserves references like "$syntax.markup -L0.07"
  writeFileSync(themePath, stringify(rawData, { lineWidth: 0 }))

  // Rebuild types and dist
  await new Promise<void>((resolve, reject) => {
    exec('npm run build', (err) => {
      if (err) reject(err)
      else resolve()
    })
  })

  return Response.json({ ok: true })
}
