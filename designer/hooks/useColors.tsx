'use client'

import { createContext, useContext } from 'react'

export interface ThemeColors {
  'ui.bg': string
  'ui.fg': string
  'ui.line': string
  'ui.panel.bg': string
  'editor.bg': string
  'editor.fg': string
  'common.accent.tint': string
  'editor.lineNumber.normal': string
}

const ThemeColorsContext = createContext<ThemeColors | null>(null)

export function ThemeColorsProvider({ value, children }: { value: ThemeColors; children: React.ReactNode }) {
  return <ThemeColorsContext.Provider value={value}>{children}</ThemeColorsContext.Provider>
}

export function useThemeColors(): ThemeColors {
  const colors = useContext(ThemeColorsContext)
  if (!colors) throw new Error('useThemeColors must be used within ThemeColorsProvider')
  return colors
}
