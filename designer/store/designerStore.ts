import { create } from 'zustand'
import type { ThemeData, SelectedColor, ColorValue, PaletteConfig, RangeModifier, Modifier } from '../types'
import type { DependencyMap } from '../lib/color-utils'
import { serializeColorValue, parsePaletteValue, formatPaletteValue } from '../lib/color-value'
import { generatePalettePreview, resolveColorReference, getByPath, buildDependencyMap } from '../lib/color-utils'
import { setNestedValue, parseRange } from '../lib/object-utils'

export type ThemeName = 'light' | 'mirage' | 'dark'
export type ModifierType = 'L' | 'C' | 'A'

interface DesignerState {
  // Core state
  activeTheme: ThemeName
  themesData: ThemeData[]
  original: ThemeData[]
  saving: boolean
  selected: SelectedColor | null
  hoveredHex: string | null

  // Dependency maps (computed from initial themes, updated when rawData changes)
  dependencyMaps: Record<string, DependencyMap>

  // Modifier memory (for remembering alpha, lightness, chroma values)
  previousModifierValues: Record<ModifierType, number>
}

interface DesignerActions {
  // Theme switching
  setActiveTheme: (theme: ThemeName) => void

  // Selection
  setSelected: (selected: SelectedColor | null) => void
  setHoveredHex: (hex: string | null) => void
  selectNext: () => void
  selectPrevious: () => void

  // Save/Revert
  handleSave: () => Promise<void>
  handleRevert: () => void

  // Color updates
  updateColor: (themeName: string, category: string, path: string, newHex: string) => void
  updatePaletteColor: (themeName: ThemeName, colorName: string, hex: string) => void
  updatePaletteRange: (themeName: ThemeName, min: number, max: number) => void
  updatePaletteSteps: (themeName: ThemeName, steps: number) => void
  updatePaletteColorRange: (themeName: ThemeName, colorName: string, range: RangeModifier | null) => void
  updateColorWithReference: (themeName: string, category: string, path: string, value: ColorValue) => void

  // Modifier memory
  savePreviousModifierValue: (type: ModifierType, value: number) => void
  getPreviousModifierValue: (type: ModifierType, defaultMax: number) => number

  // Initialization
  initialize: (themes: ThemeData[]) => void
}

export type DesignerStore = DesignerState & DesignerActions

// Hash function for dirty checking
function hashThemeData(themes: ThemeData[]): string {
  let hash = 0
  const str = themes.map(t => JSON.stringify(t.rawData) + JSON.stringify(t.rawPalette)).join('|')
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash.toString(36)
}

// Build dependency maps for all themes
function buildAllDependencyMaps(themes: ThemeData[]): Record<string, DependencyMap> {
  const maps: Record<string, DependencyMap> = {}
  for (const theme of themes) {
    maps[theme.name] = buildDependencyMap(theme.rawData)
  }
  return maps
}

export const useDesignerStore = create<DesignerStore>((set, get) => ({
  // Initial state
  activeTheme: 'dark',
  themesData: [],
  original: [],
  saving: false,
  selected: null,
  hoveredHex: null,
  dependencyMaps: {},
  previousModifierValues: { L: 0.5, C: 0.2, A: 0.55 },

  // Initialize store with theme data
  initialize: (themes) => {
    const dependencyMaps = buildAllDependencyMaps(themes)
    set({
      themesData: themes,
      original: themes,
      dependencyMaps,
      activeTheme: 'dark',
      selected: null,
    })
  },

  // Theme switching - clears selection to prevent stale state
  setActiveTheme: (theme) => {
    set({ activeTheme: theme, selected: null })
  },

  // Selection management
  setSelected: (selected) => set({ selected }),
  setHoveredHex: (hex) => set({ hoveredHex: hex }),

  selectNext: () => {
    const { selected, themesData, activeTheme } = get()
    const currentTheme = themesData.find(t => t.name === activeTheme)
    if (!currentTheme) return

    const selectableColors = getSelectableColors(currentTheme)
    if (selectableColors.length === 0) return

    const currentIndex = selected
      ? selectableColors.findIndex(c => c.path === selected.path && c.category === selected.category)
      : -1

    const nextIndex = currentIndex === -1 ? 0 : Math.min(currentIndex + 1, selectableColors.length - 1)
    const color = selectableColors[nextIndex]

    set({
      selected: {
        path: color.path,
        category: color.category,
        theme: activeTheme,
        hex: color.hex,
        originalHex: color.hex,
        position: { x: 0, y: 0 },
      }
    })
  },

  selectPrevious: () => {
    const { selected, themesData, activeTheme } = get()
    const currentTheme = themesData.find(t => t.name === activeTheme)
    if (!currentTheme) return

    const selectableColors = getSelectableColors(currentTheme)
    if (selectableColors.length === 0) return

    const currentIndex = selected
      ? selectableColors.findIndex(c => c.path === selected.path && c.category === selected.category)
      : -1

    const prevIndex = currentIndex === -1 ? selectableColors.length - 1 : Math.max(currentIndex - 1, 0)
    const color = selectableColors[prevIndex]

    set({
      selected: {
        path: color.path,
        category: color.category,
        theme: activeTheme,
        hex: color.hex,
        originalHex: color.hex,
        position: { x: 0, y: 0 },
      }
    })
  },

  // Save/Revert
  handleSave: async () => {
    set({ saving: true })
    const { themesData } = get()
    try {
      for (const theme of themesData) {
        const rawDataWithPalette = {
          ...theme.rawData,
          palette: theme.rawPalette
        }
        await fetch('/api/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ theme: theme.name, rawData: rawDataWithPalette }),
        })
      }
      set({ original: themesData })
    } catch (err) {
      console.error('Save failed:', err)
    }
    set({ saving: false })
  },

  handleRevert: () => {
    const { original } = get()
    const dependencyMaps = buildAllDependencyMaps(original)
    set({ themesData: original, dependencyMaps, selected: null })
  },

  // Color updates
  updateColor: (themeName, category, path, newHex) => {
    const { dependencyMaps } = get()
    set(state => ({
      themesData: state.themesData.map(theme => {
        if (theme.name !== themeName) return theme

        let newData = setNestedValue(theme.data as Record<string, unknown>, category, path, newHex)
        const rawHex = newHex.replace('#', '').toUpperCase()
        const newRawData = setNestedValue(theme.rawData as Record<string, unknown>, category, path, rawHex)

        // Cascade updates to dependent colors
        const fullPath = `${category}.${path}`
        const deps = dependencyMaps[theme.name]?.get(fullPath)
        if (deps) {
          for (const dep of deps) {
            const resolved = resolveColorReference(dep.rawValue, newData as Record<string, unknown>)
            if (resolved) {
              const [depCategory, ...depPathParts] = dep.fullPath.split('.')
              newData = setNestedValue(newData as Record<string, unknown>, depCategory, depPathParts.join('.'), resolved)
            }
          }
        }

        return { ...theme, data: newData, rawData: newRawData }
      })
    }))
  },

  updatePaletteColor: (themeName, colorName, hex) => {
    const { dependencyMaps } = get()
    set(state => ({
      themesData: state.themesData.map(theme => {
        if (theme.name !== themeName) return theme

        // Preserve existing range if present
        const existingRaw = theme.rawPalette?.[colorName]
        const { range: existingRange } = existingRaw ? parsePaletteValue(String(existingRaw)) : { range: undefined }
        const newValue = formatPaletteValue(hex, existingRange)

        const newRawPalette = { ...theme.rawPalette, [colorName]: newValue } as PaletteConfig
        const [globalMinL, globalMaxL] = parseRange(newRawPalette.range || '0.25:0.92')
        const steps = newRawPalette.steps ?? 5

        // Use per-color range if present
        const minL = existingRange?.min ?? globalMinL
        const maxL = existingRange?.max ?? globalMaxL

        const paletteSteps = generatePalettePreview(`#${hex}`, steps, minL, maxL)
        const newPaletteData = { ...(theme.data.palette as Record<string, Record<string, string>>) }
        const levelData: Record<string, string> = {}
        for (let i = 0; i < steps; i++) {
          levelData[`l${i + 1}`] = paletteSteps[i]
        }
        newPaletteData[colorName] = levelData

        let newData = { ...theme.data, palette: newPaletteData } as Record<string, unknown>

        // Cascade updates to colors depending on palette levels
        const deps = dependencyMaps[theme.name]
        if (deps) {
          for (let i = 1; i <= steps; i++) {
            const palettePath = `palette.${colorName}.l${i}`
            const levelDeps = deps.get(palettePath)
            if (levelDeps) {
              for (const dep of levelDeps) {
                const resolved = resolveColorReference(dep.rawValue, newData)
                if (resolved) {
                  const [depCategory, ...depPathParts] = dep.fullPath.split('.')
                  newData = setNestedValue(newData, depCategory, depPathParts.join('.'), resolved)
                }
              }
            }
          }
        }

        return { ...theme, data: newData, rawPalette: newRawPalette }
      })
    }))
  },

  updatePaletteRange: (themeName, min, max) => {
    set(state => ({
      themesData: state.themesData.map(theme => {
        if (theme.name !== themeName) return theme
        return { ...theme, rawPalette: { ...theme.rawPalette, range: `${min}:${max}` } as PaletteConfig }
      })
    }))
  },

  updatePaletteSteps: (themeName, steps) => {
    set(state => ({
      themesData: state.themesData.map(theme => {
        if (theme.name !== themeName) return theme
        return { ...theme, rawPalette: { ...theme.rawPalette, steps } as PaletteConfig }
      })
    }))
  },

  updatePaletteColorRange: (themeName, colorName, range) => {
    const { dependencyMaps } = get()
    set(state => ({
      themesData: state.themesData.map(theme => {
        if (theme.name !== themeName) return theme

        // Get existing hex
        const existingRaw = theme.rawPalette?.[colorName]
        const { hex } = existingRaw ? parsePaletteValue(String(existingRaw)) : { hex: '' }
        if (!hex) return theme

        // Format new value (with or without range)
        const newValue = range ? formatPaletteValue(hex, range) : hex

        const newRawPalette = { ...theme.rawPalette, [colorName]: newValue } as PaletteConfig
        const [globalMinL, globalMaxL] = parseRange(newRawPalette.range || '0.25:0.92')
        const steps = newRawPalette.steps ?? 5

        // Use new per-color range if provided
        const minL = range?.min ?? globalMinL
        const maxL = range?.max ?? globalMaxL

        // Regenerate palette with new range
        const paletteSteps = generatePalettePreview(`#${hex}`, steps, minL, maxL)
        const newPaletteData = { ...(theme.data.palette as Record<string, Record<string, string>>) }
        const levelData: Record<string, string> = {}
        for (let i = 0; i < steps; i++) {
          levelData[`l${i + 1}`] = paletteSteps[i]
        }
        newPaletteData[colorName] = levelData

        let newData = { ...theme.data, palette: newPaletteData } as Record<string, unknown>

        // Cascade updates to colors depending on palette levels
        const deps = dependencyMaps[theme.name]
        if (deps) {
          for (let i = 1; i <= steps; i++) {
            const palettePath = `palette.${colorName}.l${i}`
            const levelDeps = deps.get(palettePath)
            if (levelDeps) {
              for (const dep of levelDeps) {
                const resolved = resolveColorReference(dep.rawValue, newData)
                if (resolved) {
                  const [depCategory, ...depPathParts] = dep.fullPath.split('.')
                  newData = setNestedValue(newData, depCategory, depPathParts.join('.'), resolved)
                }
              }
            }
          }
        }

        return { ...theme, data: newData, rawPalette: newRawPalette }
      })
    }))
  },

  updateColorWithReference: (themeName, category, path, value) => {
    set(state => ({
      themesData: state.themesData.map(theme => {
        if (theme.name !== themeName) return theme
        const newData = setNestedValue(theme.data as Record<string, unknown>, category, path, value.hex)
        const rawValue = serializeColorValue(value)
        const newRawData = setNestedValue(theme.rawData as Record<string, unknown>, category, path, rawValue)
        return { ...theme, data: newData, rawData: newRawData }
      })
    }))
  },

  // Modifier memory
  savePreviousModifierValue: (type, value) => {
    set(state => ({
      previousModifierValues: {
        ...state.previousModifierValues,
        [type]: value
      }
    }))
  },

  getPreviousModifierValue: (type, defaultMax) => {
    const { previousModifierValues } = get()
    return previousModifierValues[type] ?? (defaultMax / 2)
  },
}))

// Helper to get selectable colors from a theme
function getSelectableColors(theme: ThemeData): { path: string; category: string; hex: string }[] {
  const colors: { path: string; category: string; hex: string }[] = []

  // Palette colors
  const paletteConfig = theme.rawPalette
  if (paletteConfig) {
    for (const name of Object.keys(paletteConfig)) {
      if (name === 'range' || name === 'steps') continue
      const hex = getByPath(theme.data, `palette.${name}.l3`)
      if (hex) {
        colors.push({ path: name, category: 'palette', hex })
      }
    }
  }

  // Category colors
  const categories = Object.keys(theme.rawData).filter(
    k => k !== 'palette' && typeof theme.rawData[k] === 'object'
  )

  for (const category of categories) {
    const extractPaths = (obj: unknown, prefix = ''): void => {
      if (typeof obj !== 'object' || obj === null) return
      for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
        const path = prefix ? `${prefix}.${key}` : key
        if (typeof value === 'string') {
          const hex = getByPath(theme.data, `${category}.${path}`)
          if (hex) {
            colors.push({ path, category, hex })
          }
        } else if (typeof value === 'object') {
          extractPaths(value, path)
        }
      }
    }
    extractPaths(theme.rawData[category])
  }

  return colors
}

// Selectors
export const selectCurrentTheme = (state: DesignerStore) =>
  state.themesData.find(t => t.name === state.activeTheme)

export const selectIsDirty = (state: DesignerStore) =>
  hashThemeData(state.themesData) !== hashThemeData(state.original)

export const selectCategories = (state: DesignerStore) => {
  const theme = state.themesData.find(t => t.name === state.activeTheme)
  if (!theme) return []
  return Object.keys(theme.rawData).filter(
    k => k !== 'palette' && typeof theme.rawData[k] === 'object'
  )
}

export const selectPaletteColorNames = (state: DesignerStore) => {
  const theme = state.themesData.find(t => t.name === state.activeTheme)
  const config = theme?.rawPalette
  if (!config) return []
  return Object.keys(config).filter(k => k !== 'range' && k !== 'steps')
}
