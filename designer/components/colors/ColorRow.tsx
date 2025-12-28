import type { ThemeName } from '../../store'
import type { ThemeData, SelectedColor } from '../../types'
import { useThemeColors } from '../../hooks/useColors'
import { parseHexToOklch, formatOklch, getAPCAContrast } from '../../lib/color-utils'
import { parseRawValue, isReference } from '../../lib/color-value'
import { Tooltip, ColorTooltipContent } from '../ui/Tooltip'
import styles from './ColorRow.module.css'

interface ColorRowProps {
  path: string
  category: string
  activeTheme: ThemeName
  theme: ThemeData
  selected: SelectedColor | null
  onSelect: (selection: SelectedColor) => void
  bg: string  // Allow override for editor vs ui bg
  hoveredHex: string | null
  onHover: (hex: string) => void
  onHoverEnd: () => void
}

function getColor(theme: ThemeData, category: string, path: string): string | null {
  let obj: unknown = theme.data[category]
  for (const part of path.split('.')) {
    if (!obj || typeof obj !== 'object') return null
    obj = (obj as Record<string, unknown>)[part]
  }
  return typeof obj === 'string' && obj.startsWith('#') ? obj : null
}

function getRawValue(theme: ThemeData, category: string, path: string): string | null {
  let obj: unknown = theme.rawData?.[category]
  for (const part of path.split('.')) {
    if (!obj || typeof obj !== 'object') return null
    obj = (obj as Record<string, unknown>)[part]
  }
  return typeof obj === 'string' ? obj : null
}

export function ColorRow({ path, category, activeTheme, theme, selected, onSelect, bg, hoveredHex, onHover, onHoverEnd }: ColorRowProps) {
  const themeColors = useThemeColors()
  const hex = getColor(theme, category, path)
  const rawValue = getRawValue(theme, category, path)
  const isRef = rawValue ? isReference(rawValue) : false
  const colorValue = rawValue && hex ? parseRawValue(rawValue, hex) : null
  const isSelected = selected?.path === path && selected?.theme === activeTheme && selected?.category === category
  const isHighlighted = hoveredHex && hex && hoveredHex.toLowerCase() === hex.slice(0, 7).toLowerCase()

  if (!hex) return null

  const oklch = parseHexToOklch(hex)
  const oklchStr = oklch ? formatOklch(oklch) : ''
  const apca = Math.abs(getAPCAContrast(hex, bg)).toFixed(1)

  // Get display text: reference path or hex
  const displayValue = isRef && colorValue?.reference
    ? colorValue.reference
    : hex.slice(0, 7).toUpperCase()

  return (
    <div className={styles.row}>
      <div
        className={styles.swatchWrapper}
        onMouseEnter={() => onHover(hex.slice(0, 7))}
        onMouseLeave={() => onHoverEnd()}
      >
        {isRef && <div className={styles.refIndicator} style={{ background: themeColors['editor.fg'] }} title="References another color" />}
        <Tooltip content={<ColorTooltipContent oklchStr={oklchStr} apca={apca} />}>
          <div
            className={styles.swatch}
            onClick={e => {
              const rect = e.currentTarget.getBoundingClientRect()
              onSelect({ path, category, theme: activeTheme, hex, originalHex: hex, position: { x: rect.right, y: rect.top } })
            }}
            style={{
              background: hex,
              outline: isSelected ? `2px solid ${themeColors['common.accent.tint']}` : isHighlighted ? `2px solid ${themeColors['common.accent.tint']}80` : 'none',
              outlineOffset: 2,
            }}
          />
        </Tooltip>
      </div>
      <span className={styles.path} style={{ color: themeColors['ui.fg'] }}>{path}</span>
      {oklch && (
        <span className={styles.oklch} style={{ color: themeColors['ui.fg'] }}>
          L:{oklch.l.toFixed(2)} C:{(oklch.c || 0).toFixed(2)} H:{(oklch.h || 0).toFixed(0)}
        </span>
      )}
      {colorValue?.modifiers && colorValue.modifiers.length > 0 && (
        <div className={styles.modifiers}>
          {colorValue.modifiers.map((m, i) => (
            <span key={i} className={styles.modifier} style={{ background: themeColors['ui.line'], color: themeColors['editor.fg'] }}>
              {m.op}{m.type}{m.value}
            </span>
          ))}
        </div>
      )}
      <span className={styles.hex} style={{ color: isRef ? themeColors['editor.fg'] : themeColors['ui.fg'] }}>{displayValue}</span>
    </div>
  )
}
