// Set a nested value in an object immutably
export function setNestedValue(
  obj: Record<string, unknown>,
  category: string,
  path: string,
  value: string
): Record<string, unknown> {
  const newObj = { ...obj }
  const parts = path.split('.')
  let current: Record<string, unknown> = { ...(newObj[category] as Record<string, unknown>) }
  newObj[category] = current
  for (let i = 0; i < parts.length - 1; i++) {
    current[parts[i]] = { ...(current[parts[i]] as Record<string, unknown>) }
    current = current[parts[i]] as Record<string, unknown>
  }
  current[parts[parts.length - 1]] = value
  return newObj
}

// Extract all color paths from a nested object
export function extractColorPaths(obj: unknown, prefix = ''): string[] {
  const paths: string[] = []
  if (typeof obj !== 'object' || obj === null) return paths
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'string') paths.push(path)
    else if (typeof value === 'object') paths.push(...extractColorPaths(value, path))
  }
  return paths
}

// Parse a range string like "0.25:0.92" into [min, max]
export function parseRange(range: string): [number, number] {
  const [min, max] = range.split(':').map(Number)
  return [min || 0.25, max || 0.92]
}
