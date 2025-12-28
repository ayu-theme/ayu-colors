export interface Modifier {
  op: '' | '+' | '-'
  type: 'A' | 'L' | 'C'
  value: number
}

export interface RangeModifier {
  min: number
  max: number
}

export interface ColorValue {
  type: 'hex' | 'reference'
  hex: string                    // Resolved value for display
  baseHex?: string               // Base hex before modifiers (for hex type)
  reference?: string             // e.g., "$syntax.markup"
  modifiers?: Modifier[]
}

export interface ThemeData {
  name: string
  data: Record<string, unknown>      // Resolved hex (for display)
  rawData: Record<string, unknown>   // Raw YAML (preserves references)
  rawPalette: PaletteConfig | null
}

export interface PaletteConfig {
  range: string
  steps?: number
  [colorName: string]: string | number | undefined
}

export interface SelectedColor {
  path: string
  category: string
  theme: string
  hex: string
  originalHex: string
  position: { x: number; y: number }
}

