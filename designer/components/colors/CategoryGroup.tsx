'use client'

import type { ThemeName } from '../../store'
import type { ThemeData, SelectedColor } from '../../types'
import { useThemeColors } from '../../hooks/useColors'
import { Collapsible } from '../ui/Collapsible'
import { ColorRow } from './ColorRow'
import styles from './CategoryGroup.module.css'

interface CategoryGroupProps {
  category: string
  colorPaths: string[]
  activeTheme: ThemeName
  theme: ThemeData
  selected: SelectedColor | null
  onSelect: (selection: SelectedColor) => void
  hoveredHex: string | null
  onHover: (hex: string) => void
  onHoverEnd: () => void
  expanded: boolean
  onToggle: () => void
  searchTerm?: string
}

export function CategoryGroup({
  category,
  colorPaths,
  activeTheme,
  theme,
  selected,
  onSelect,
  hoveredHex,
  onHover,
  onHoverEnd,
  expanded,
  onToggle,
  searchTerm,
}: CategoryGroupProps) {
  const themeColors = useThemeColors()

  // Editor and syntax categories use editor background, others use UI background
  const bg = (category === 'editor' || category === 'syntax') ? themeColors['editor.bg'] : themeColors['ui.bg']

  if (colorPaths.length === 0) return null

  return (
    <div style={{ background: bg }}>
      <Collapsible
        title={category}
        badge={colorPaths.length}
        open={expanded}
        onToggle={onToggle}
      >
        <div className={styles.colorGrid}>
          {colorPaths.map(path => (
            <ColorRow
              key={path}
              path={path}
              category={category}
              activeTheme={activeTheme}
              theme={theme}
              selected={selected}
              onSelect={onSelect}
              bg={bg}
              hoveredHex={hoveredHex}
              onHover={onHover}
              onHoverEnd={onHoverEnd}
            />
          ))}
        </div>
      </Collapsible>
    </div>
  )
}
