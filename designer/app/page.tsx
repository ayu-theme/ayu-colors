'use client'

import { useState, useEffect } from 'react'
import type { ThemeData } from '../types'
import {
  useDesignerStore,
  useCurrentTheme,
  useIsDirty,
  useCategories,
  usePaletteColorNames,
  useThemeColors,
  useSyntaxColors,
  useAvailableColors,
  useResolveReference,
  useGetInitialMode,
  useGetInitialReferenceValue,
  useGetPaletteColorRange,
  useGetGlobalPaletteRange,
  type ThemeName,
} from '../store'
import { ThemeColorsProvider } from '../hooks/useColors'
import { ColorList } from '../components/colors/ColorList'
import { ColorEditor } from '../components/color/ColorEditor'
import { EmptyState } from '../components/color/EmptyState'
import { EditorWindow } from '../components/preview/EditorWindow'
import styles from './page.module.css'

function DesignerContent() {
  // Store state
  const activeTheme = useDesignerStore(state => state.activeTheme)
  const setActiveTheme = useDesignerStore(state => state.setActiveTheme)
  const selected = useDesignerStore(state => state.selected)
  const setSelected = useDesignerStore(state => state.setSelected)
  const saving = useDesignerStore(state => state.saving)
  const hoveredHex = useDesignerStore(state => state.hoveredHex)
  const setHoveredHex = useDesignerStore(state => state.setHoveredHex)
  const handleSave = useDesignerStore(state => state.handleSave)
  const handleRevert = useDesignerStore(state => state.handleRevert)
  const updateColor = useDesignerStore(state => state.updateColor)
  const updatePaletteColor = useDesignerStore(state => state.updatePaletteColor)
  const updatePaletteRange = useDesignerStore(state => state.updatePaletteRange)
  const updatePaletteSteps = useDesignerStore(state => state.updatePaletteSteps)
  const updatePaletteColorRange = useDesignerStore(state => state.updatePaletteColorRange)
  const updateColorWithReference = useDesignerStore(state => state.updateColorWithReference)
  const selectNext = useDesignerStore(state => state.selectNext)
  const selectPrevious = useDesignerStore(state => state.selectPrevious)

  // Selectors
  const currentTheme = useCurrentTheme()
  const isDirty = useIsDirty()
  const categories = useCategories()
  const paletteColorNames = usePaletteColorNames()
  const themeColors = useThemeColors()
  const syntax = useSyntaxColors()
  const availableColors = useAvailableColors()
  const resolveReference = useResolveReference()
  const getInitialMode = useGetInitialMode()
  const getInitialReferenceValue = useGetInitialReferenceValue()
  const getPaletteColorRange = useGetPaletteColorRange()
  const getGlobalPaletteRange = useGetGlobalPaletteRange()

  // Set CSS variables for theme colors
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--ayu-ui-bg', themeColors['ui.bg'])
    root.style.setProperty('--ayu-ui-fg', themeColors['ui.fg'])
    root.style.setProperty('--ayu-ui-line', themeColors['ui.line'])
    root.style.setProperty('--ayu-ui-panel-bg', themeColors['ui.panel.bg'])
    root.style.setProperty('--ayu-editor-bg', themeColors['editor.bg'])
    root.style.setProperty('--ayu-editor-fg', themeColors['editor.fg'])
    root.style.setProperty('--ayu-accent', themeColors['common.accent.tint'])
  }, [themeColors])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 's' && isDirty) {
        e.preventDefault()
        handleSave()
      }
      if (e.key === 'Escape') {
        setSelected(null)
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        selectNext()
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        selectPrevious()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isDirty, handleSave, setSelected, selectNext, selectPrevious])

  if (!currentTheme) return null

  return (
    <ThemeColorsProvider value={themeColors}>
      <div className={styles.container}>
        <div className={styles.main}>
          {/* Left Panel - Color List */}
          <div className={styles.colorPanel}>
            <ColorList
              theme={currentTheme}
              activeTheme={activeTheme}
              categories={categories}
              paletteColorNames={paletteColorNames}
              selected={selected}
              onSelect={setSelected}
              hoveredHex={hoveredHex}
              onHover={setHoveredHex}
              onHoverEnd={() => setHoveredHex(null)}
              onPaletteRangeChange={(min, max) => updatePaletteRange(activeTheme, min, max)}
              onPaletteStepsChange={steps => updatePaletteSteps(activeTheme, steps)}
              isDirty={isDirty}
              saving={saving}
              onThemeChange={setActiveTheme}
              onRevert={handleRevert}
              onSave={handleSave}
            />
          </div>

          {/* Middle Panel - Color Editor */}
          <div className={styles.editorPanel}>
            {selected ? (
              <ColorEditor
                selected={selected}
                onClose={() => setSelected(null)}
                onChange={hex => {
                  if (selected.category === 'palette') {
                    updatePaletteColor(selected.theme as ThemeName, selected.path, hex.replace('#', ''))
                  } else {
                    updateColor(selected.theme, selected.category, selected.path, hex)
                  }
                }}
                onReferenceChange={value => {
                  updateColorWithReference(selected.theme, selected.category, selected.path, value)
                }}
                availableColors={availableColors}
                paletteColors={paletteColorNames}
                initialMode={getInitialMode()}
                initialReferenceValue={getInitialReferenceValue()}
                resolveReference={resolveReference}
                paletteColorRange={getPaletteColorRange()}
                globalPaletteRange={getGlobalPaletteRange()}
                onPaletteRangeChange={range => {
                  if (selected.category === 'palette') {
                    updatePaletteColorRange(selected.theme as ThemeName, selected.path, range)
                  }
                }}
              />
            ) : (
              <EmptyState />
            )}
          </div>

          {/* Right Panel - Preview */}
          <div className={styles.previewPanel}>
            <EditorWindow syntaxColors={syntax} themeColors={themeColors} />
          </div>
        </div>
      </div>
    </ThemeColorsProvider>
  )
}

export default function Designer() {
  const [loading, setLoading] = useState(true)
  const initialize = useDesignerStore(state => state.initialize)
  const themesData = useDesignerStore(state => state.themesData)

  useEffect(() => {
    fetch('/api/colors')
      .then(res => res.json())
      .then((data: ThemeData[]) => {
        initialize(data)
        setLoading(false)
      })
  }, [initialize])

  if (loading || themesData.length === 0) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
        <span>Loading...</span>
      </div>
    )
  }

  return <DesignerContent />
}
