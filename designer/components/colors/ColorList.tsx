'use client'

import { useState, useMemo, useCallback } from 'react'
import type { ThemeName } from '../../store'
import type { ThemeData, SelectedColor } from '../../types'
import { extractColorPaths } from '../../lib/object-utils'
import { CategoryGroup } from './CategoryGroup'
import { PaletteSection } from '../palette/PaletteSection'
import { Button, ThemeButton } from '../ui/Button'
import { parseRange } from '../../lib/object-utils'
import styles from './ColorList.module.css'

const THEMES: ThemeName[] = ['dark', 'mirage', 'light']

interface ColorListProps {
  theme: ThemeData
  activeTheme: ThemeName
  categories: string[]
  paletteColorNames: string[]
  selected: SelectedColor | null
  onSelect: (selection: SelectedColor) => void
  hoveredHex: string | null
  onHover: (hex: string) => void
  onHoverEnd: () => void
  onPaletteRangeChange: (min: number, max: number) => void
  onPaletteStepsChange: (steps: number) => void
  // Header controls
  isDirty: boolean
  saving: boolean
  onThemeChange: (theme: ThemeName) => void
  onRevert: () => void
  onSave: () => void
}

export function ColorList({
  theme,
  activeTheme,
  categories,
  paletteColorNames,
  selected,
  onSelect,
  hoveredHex,
  onHover,
  onHoverEnd,
  onPaletteRangeChange,
  onPaletteStepsChange,
  isDirty,
  saving,
  onThemeChange,
  onRevert,
  onSave,
}: ColorListProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(() => new Set(['palette', ...categories]))

  const categoryData = useMemo(() => {
    return categories.map(category => ({
      category,
      paths: extractColorPaths(theme.rawData[category]),
    }))
  }, [theme, categories])

  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }, [])

  return (
    <div className={styles.colorList}>
      <div className={styles.controls}>
        <div className={styles.themeButtons}>
          {THEMES.map(t => (
            <ThemeButton key={t} onClick={() => onThemeChange(t)} active={activeTheme === t}>
              {t}
            </ThemeButton>
          ))}
        </div>
        <div className={styles.actions}>
          <Button onClick={onRevert} disabled={!isDirty}>Revert</Button>
          <Button onClick={onSave} disabled={!isDirty || saving} variant="primary">
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
      <div className={styles.scrollArea}>
        <PaletteSection
          paletteColorNames={paletteColorNames}
          activeTheme={activeTheme}
          config={theme.rawPalette || null}
          parseRange={parseRange}
          selected={selected}
          onSelect={onSelect}
          onRangeChange={onPaletteRangeChange}
          onStepsChange={onPaletteStepsChange}
          hoveredHex={hoveredHex}
          onHover={onHover}
          onHoverEnd={onHoverEnd}
          expanded={expandedCategories.has('palette')}
          onToggle={() => toggleCategory('palette')}
        />
        {categoryData.map(({ category, paths }) => (
          <CategoryGroup
            key={category}
            category={category}
            colorPaths={paths}
            activeTheme={activeTheme}
            theme={theme}
            selected={selected}
            onSelect={onSelect}
            hoveredHex={hoveredHex}
            onHover={onHover}
            onHoverEnd={onHoverEnd}
            expanded={expandedCategories.has(category)}
            onToggle={() => toggleCategory(category)}
          />
        ))}
      </div>
    </div>
  )
}
