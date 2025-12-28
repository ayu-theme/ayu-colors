import type { ThemeName } from '../../store'
import type { PaletteConfig, SelectedColor } from '../../types'
import { useThemeColors } from '../../hooks/useColors'
import { Collapsible } from '../ui/Collapsible'
import { PaletteRow } from './PaletteRow'
import { RangeControls } from './RangeControls'
import styles from './PaletteSection.module.css'

interface PaletteSectionProps {
  paletteColorNames: string[]
  activeTheme: ThemeName
  config: PaletteConfig | null
  parseRange: (range: string) => [number, number]
  selected: SelectedColor | null
  onSelect: (selection: SelectedColor) => void
  onRangeChange: (min: number, max: number) => void
  onStepsChange: (steps: number) => void
  hoveredHex: string | null
  onHover: (hex: string) => void
  onHoverEnd: () => void
  expanded: boolean
  onToggle: () => void
}

export function PaletteSection({ paletteColorNames, activeTheme, config, parseRange, selected, onSelect, onRangeChange, onStepsChange, hoveredHex, onHover, onHoverEnd, expanded, onToggle }: PaletteSectionProps) {
  const themeColors = useThemeColors()

  if (paletteColorNames.length === 0) return null

  const [minL, maxL] = config ? parseRange(config.range) : [0.25, 0.92]
  const steps = config?.steps ?? 5

  return (
    <div className={styles.section} style={{ background: themeColors['editor.bg'] }}>
      <Collapsible
        title="palette"
        badge={paletteColorNames.length}
        open={expanded}
        onToggle={onToggle}
      >
        <div className={styles.rows}>
          {paletteColorNames.map((colorName, index) => (
            <PaletteRow
              key={colorName}
              colorName={colorName}
              activeTheme={activeTheme}
              config={config}
              parseRange={parseRange}
              selected={selected}
              onSelect={onSelect}
              isFirst={index === 0}
              isLast={index === paletteColorNames.length - 1}
              hoveredHex={hoveredHex}
              onHover={onHover}
              onHoverEnd={onHoverEnd}
              steps={steps}
            />
          ))}
        </div>
        <RangeControls minL={minL} maxL={maxL} onChange={onRangeChange} steps={steps} onStepsChange={onStepsChange} />
      </Collapsible>
    </div>
  )
}
