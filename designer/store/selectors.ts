import { useMemo, useCallback } from 'react'
import { useDesignerStore } from './designerStore'
import type { ColorPath } from '../components/color/ReferencePicker'
import type { ColorValue, Modifier, RangeModifier } from '../types'
import { getByPath, applyModifiers } from '../lib/color-utils'
import { extractColorPaths, parseRange } from '../lib/object-utils'
import { isReference, parseRawValue, parsePaletteValue } from '../lib/color-value'

export interface ThemeColors {
  'ui.bg': string
  'ui.fg': string
  'ui.line': string
  'ui.panel.bg': string
  'editor.bg': string
  'editor.fg': string
  'common.accent.tint': string
}

// Current theme data
export function useCurrentTheme() {
  const themesData = useDesignerStore(state => state.themesData)
  const activeTheme = useDesignerStore(state => state.activeTheme)
  return useMemo(
    () => themesData.find(t => t.name === activeTheme),
    [themesData, activeTheme]
  )
}

// Dirty state - use hash comparison with memoization
export function useIsDirty() {
  const themesData = useDesignerStore(state => state.themesData)
  const original = useDesignerStore(state => state.original)

  return useMemo(() => {
    const hashThemeData = (themes: typeof themesData): string => {
      let hash = 0
      const str = themes.map(t => JSON.stringify(t.rawData) + JSON.stringify(t.rawPalette)).join('|')
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash
      }
      return hash.toString(36)
    }
    return hashThemeData(themesData) !== hashThemeData(original)
  }, [themesData, original])
}

// Categories (syntax, vcs, editor, ui, common)
export function useCategories() {
  const currentTheme = useCurrentTheme()
  return useMemo(() => {
    if (!currentTheme) return []
    return Object.keys(currentTheme.rawData).filter(
      k => k !== 'palette' && typeof currentTheme.rawData[k] === 'object'
    )
  }, [currentTheme])
}

// Palette color names
export function usePaletteColorNames() {
  const currentTheme = useCurrentTheme()
  return useMemo(() => {
    const config = currentTheme?.rawPalette
    if (!config) return []
    return Object.keys(config).filter(k => k !== 'range' && k !== 'steps')
  }, [currentTheme])
}

// Theme colors for UI styling
export function useThemeColors(): ThemeColors {
  const currentTheme = useCurrentTheme()
  return useMemo(() => ({
    'ui.bg': getByPath(currentTheme?.data, 'ui.bg') ,
    'ui.fg': getByPath(currentTheme?.data, 'ui.fg') ,
    'ui.line': getByPath(currentTheme?.data, 'ui.line') ,
    'ui.panel.bg': getByPath(currentTheme?.data, 'ui.panel.bg') ,
    'editor.bg': getByPath(currentTheme?.data, 'editor.bg') ,
    'editor.fg': getByPath(currentTheme?.data, 'editor.fg') ,
    'common.accent.tint': getByPath(currentTheme?.data, 'common.accent.tint') ,
    'editor.lineNumber.normal': getByPath(currentTheme?.data, 'editor.lineNumber.normal') ,
  }), [currentTheme])
}

// Syntax colors for preview
export function useSyntaxColors(): Record<string, string> {
  const currentTheme = useCurrentTheme()
  return useMemo(() => {
    return (currentTheme?.data?.syntax as Record<string, string>) || {}
  }, [currentTheme])
}

// Available colors for reference picker
export function useAvailableColors(): ColorPath[] {
  const currentTheme = useCurrentTheme()
  const categories = useCategories()

  return useMemo(() => {
    if (!currentTheme) return []

    const colors: ColorPath[] = []

    // Palette colors
    if (currentTheme.rawPalette) {
      const steps = currentTheme.rawPalette.steps ?? 5
      for (const name of Object.keys(currentTheme.rawPalette)) {
        if (name === 'range' || name === 'steps') continue
        for (let i = 1; i <= steps; i++) {
          const levelHex = getByPath(currentTheme.data, `palette.${name}.l${i}`)
          if (levelHex) {
            colors.push({ path: `${name}.l${i}`, category: 'palette', hex: levelHex })
          }
        }
      }
    }

    // Category colors
    for (const category of categories) {
      const paths = extractColorPaths(currentTheme.data[category])
      for (const path of paths) {
        const hex = getByPath(currentTheme.data, `${category}.${path}`)
        if (hex) colors.push({ path, category, hex })
      }
    }

    return colors
  }, [currentTheme, categories])
}

// Resolve a reference to a hex color
export function useResolveReference() {
  const currentTheme = useCurrentTheme()

  return useCallback((ref: string, modifiers: Modifier[]): string => {
    if (!ref.startsWith('$')) return '#888888'
    const refPath = ref.slice(1)
    const parts = refPath.split('.')
    const category = parts[0]
    const path = parts.slice(1).join('.')

    let hex: string | undefined
    if (category === 'palette' && currentTheme) {
      hex = getByPath(currentTheme.data, `palette.${path}`)
    } else if (currentTheme) {
      hex = getByPath(currentTheme.data, refPath)
    }

    if (!hex) return '#888888'
    if (modifiers.length === 0) return hex
    return applyModifiers(hex, modifiers)
  }, [currentTheme])
}

// Get initial mode for color editor (hex or reference)
export function useGetInitialMode() {
  const currentTheme = useCurrentTheme()
  const selected = useDesignerStore(state => state.selected)

  return useCallback((): 'hex' | 'reference' => {
    if (!selected || !currentTheme) return 'hex'
    if (selected.category === 'palette') return 'hex'

    let rawObj: unknown = currentTheme.rawData?.[selected.category]
    for (const part of selected.path.split('.')) {
      if (!rawObj || typeof rawObj !== 'object') return 'hex'
      rawObj = (rawObj as Record<string, unknown>)[part]
    }
    return typeof rawObj === 'string' && isReference(rawObj) ? 'reference' : 'hex'
  }, [selected, currentTheme])
}

// Get initial color value for color editor
export function useGetInitialReferenceValue() {
  const currentTheme = useCurrentTheme()
  const selected = useDesignerStore(state => state.selected)

  return useCallback((): ColorValue | null => {
    if (!selected || !currentTheme) return null
    if (selected.category === 'palette') return null

    let rawObj: unknown = currentTheme.rawData?.[selected.category]
    for (const part of selected.path.split('.')) {
      if (!rawObj || typeof rawObj !== 'object') return null
      rawObj = (rawObj as Record<string, unknown>)[part]
    }

    if (typeof rawObj === 'string') {
      const parsed = parseRawValue(rawObj, selected.hex)
      // Return if it's a reference OR has modifiers
      if (isReference(rawObj) || parsed.modifiers?.length) {
        return parsed
      }
    }
    return null
  }, [selected, currentTheme])
}

// Get palette color range for currently selected palette color
export function useGetPaletteColorRange() {
  const currentTheme = useCurrentTheme()
  const selected = useDesignerStore(state => state.selected)

  return useCallback((): RangeModifier | undefined => {
    if (!selected || !currentTheme || selected.category !== 'palette') return undefined
    const rawValue = currentTheme.rawPalette?.[selected.path]
    if (!rawValue) return undefined
    const { range } = parsePaletteValue(String(rawValue))
    return range
  }, [selected, currentTheme])
}

// Get global palette range
export function useGetGlobalPaletteRange() {
  const currentTheme = useCurrentTheme()

  return useCallback((): [number, number] => {
    const rangeStr = currentTheme?.rawPalette?.range || '0.25:0.92'
    return parseRange(rangeStr)
  }, [currentTheme])
}
