import type { ThemeName } from '../../store'
import type { PaletteConfig, SelectedColor } from '../../types'
import { useThemeColors } from '../../hooks/useColors'
import { generatePalettePreview, parseHexToOklch, formatOklch, getAPCAContrast } from '../../lib/color-utils'
import { parsePaletteValue } from '../../lib/color-value'
import { Tooltip, ColorTooltipContent } from '../ui/Tooltip'
import styles from './PaletteRow.module.css'

interface PaletteRowProps {
  colorName: string
  activeTheme: ThemeName
  config: PaletteConfig | null
  parseRange: (range: string) => [number, number]
  selected: SelectedColor | null
  onSelect: (selection: SelectedColor) => void
  isFirst: boolean
  isLast: boolean
  hoveredHex: string | null
  onHover: (hex: string) => void
  onHoverEnd: () => void
  steps: number
}

export function PaletteRow({ colorName, activeTheme, config, parseRange, selected, onSelect, isFirst, isLast, hoveredHex, onHover, onHoverEnd, steps }: PaletteRowProps) {
  const themeColors = useThemeColors()
  const [globalMinL, globalMaxL] = config ? parseRange(config.range) : [0.25, 0.92]

  // Parse raw value to extract hex and optional per-color range
  const rawValue = config?.[colorName] || ''
  const { hex: baseHex, range: colorRange } = parsePaletteValue(String(rawValue))

  // Use per-color range if present, else fall back to global range
  const minL = colorRange?.min ?? globalMinL
  const maxL = colorRange?.max ?? globalMaxL

  const hex = `#${baseHex}`
  const previewColors = generatePalettePreview(hex, steps, minL, maxL)

  const baseOklch = parseHexToOklch(hex)
  const baseL = baseOklch?.l ?? 0.5
  let sourceIndex = 0
  let minDist = Infinity
  for (let i = 0; i < steps; i++) {
    const stepL = minL + (maxL - minL) * (i / (steps - 1))
    const dist = Math.abs(stepL - baseL)
    if (dist < minDist) { minDist = dist; sourceIndex = i }
  }

  const isSelected = selected?.path === colorName && selected?.category === 'palette' && selected?.theme === activeTheme

  const getColorInfo = (colorHex: string) => {
    const oklch = parseHexToOklch(colorHex)
    const oklchStr = oklch ? formatOklch(oklch) : ''
    const apca = Math.abs(getAPCAContrast(colorHex, themeColors['editor.bg'])).toFixed(1)
    return { oklchStr, apca }
  }

  const getCornerRadius = (i: number) => {
    const radius: Record<string, number> = {}
    if (isFirst && i === 0) radius.borderTopLeftRadius = 12
    if (isFirst && i === steps - 1) radius.borderTopRightRadius = 12
    if (isLast && i === 0) radius.borderBottomLeftRadius = 12
    if (isLast && i === steps - 1) radius.borderBottomRightRadius = 12
    return radius
  }

  return (
    <div className={styles.row}>
      <div className={styles.swatches}>
        {previewColors.map((color, i) => {
          const isSource = i === sourceIndex
          const displayColor = isSource ? hex : color
          const { oklchStr, apca } = getColorInfo(displayColor)
          const colorHex7 = displayColor.slice(0, 7)
          const isThisHighlighted = hoveredHex && hoveredHex.toLowerCase() === colorHex7.toLowerCase()
          return (
            <div
              key={i}
              className={styles.swatchWrapper}
              onMouseEnter={() => onHover(colorHex7)}
              onMouseLeave={() => onHoverEnd()}
            >
              <Tooltip content={<ColorTooltipContent oklchStr={oklchStr} apca={apca} />}>
                <div
                  className={`${styles.swatch} ${isSource ? styles.swatchSource : ''}`}
                  onClick={e => {
                    if (isSource) {
                      const rect = e.currentTarget.getBoundingClientRect()
                      onSelect({ path: colorName, category: 'palette', theme: activeTheme, hex, originalHex: hex, position: { x: rect.right, y: rect.top } })
                    }
                  }}
                  style={{
                    background: displayColor,
                    cursor: isSource ? 'pointer' : 'default',
                    outline: isSource && isSelected ? `2px solid ${themeColors['common.accent.tint']}` : isThisHighlighted ? `2px solid ${themeColors['common.accent.tint']}80` : 'none',
                    outlineOffset: 2,
                    position: 'relative',
                    zIndex: (isSource && isSelected) || isThisHighlighted ? 1 : 0,
                    ...getCornerRadius(i),
                  }}
                />
              </Tooltip>
              {isSource && <div className={styles.sourceIndicator} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
