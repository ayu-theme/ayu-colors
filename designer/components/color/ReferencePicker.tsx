import { useState, useMemo, useEffect } from 'react'
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  size,
  useDismiss,
  useInteractions,
  FloatingPortal,
} from '@floating-ui/react'
import { useThemeColors } from '../../hooks/useColors'
import styles from './ReferencePicker.module.css'

export interface ColorPath {
  path: string       // e.g., "syntax.markup"
  category: string   // e.g., "syntax"
  hex: string        // Resolved hex for preview
}

interface ReferencePickerProps {
  value: string                  // Current reference path, e.g., "$syntax.markup"
  onChange: (path: string) => void
  availableColors: ColorPath[]
  paletteColors: string[]        // Quick pick palette names
  isLight?: boolean
}

export function ReferencePicker({ value, onChange, availableColors, paletteColors, isLight }: ReferencePickerProps) {
  const themeColors = useThemeColors()
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState(value.replace('$', ''))

  // Sync search when value prop changes
  useEffect(() => {
    setSearch(value.replace('$', ''))
  }, [value])

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'bottom-start',
    middleware: [
      offset(2),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
      size({
        apply({ availableHeight, elements }) {
          elements.floating.style.maxHeight = `${Math.min(200, availableHeight - 8)}px`
        },
        padding: 8,
      }),
    ],
    whileElementsMounted: autoUpdate,
  })

  const dismiss = useDismiss(context)
  const { getReferenceProps, getFloatingProps } = useInteractions([dismiss])

  const filtered = useMemo(() => {
    const query = search.toLowerCase()
    return availableColors
      .filter(c =>
        c.path.toLowerCase().includes(query) ||
        c.category.toLowerCase().includes(query)
      )
      .slice(0, 10)
  }, [search, availableColors])

  const handleSelect = (path: string) => {
    const refPath = path.startsWith('$') ? path : `$${path}`
    onChange(refPath)
    setSearch(path)
    setIsOpen(false)
  }

  // Get palette colors organized by name with l1-l5 levels
  const paletteByColor = useMemo(() => {
    const byColor: Record<string, { level: string; hex: string; path: string }[]> = {}
    for (const name of paletteColors) {
      byColor[name] = []
      for (let i = 1; i <= 5; i++) {
        const path = `${name}.l${i}`
        const color = availableColors.find(c => c.category === 'palette' && c.path === path)
        if (color) {
          byColor[name].push({ level: `l${i}`, hex: color.hex, path })
        }
      }
    }
    return byColor
  }, [paletteColors, availableColors])

  return (
    <div className={styles.container} data-light={isLight}>
      {/* Palette quick pick with l1-l5 levels */}
      {paletteColors.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionLabel} style={{ color: themeColors['ui.fg'] }}>Palette</div>
          <div className={styles.paletteRows}>
            {paletteColors.map(name => (
              <div key={name} className={styles.paletteRow}>
                <span className={styles.paletteName} style={{ color: themeColors['ui.fg'] }}>{name}</span>
                <div className={styles.paletteLevels}>
                  {paletteByColor[name]?.map(({ level, hex, path }) => (
                    <button
                      key={path}
                      className={styles.paletteButton}
                      onClick={() => handleSelect(`palette.${path}`)}
                      title={`$palette.${path}`}
                      style={{
                        background: hex,
                        outline: value === `$palette.${path}` ? `2px solid ${themeColors['common.accent.tint']}` : 'none',
                        outlineOffset: 1,
                        position: 'relative',
                        zIndex: value === `$palette.${path}` ? 1 : 0,
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Any color search */}
      <div className={styles.section}>
        <div className={styles.sectionLabel} style={{ color: themeColors['ui.fg'] }}>Or any color</div>
        <div className={styles.searchWrapper}>
          <input
            ref={refs.setReference}
            type="text"
            className={styles.searchInput}
            value={search}
            onChange={e => { setSearch(e.target.value); setIsOpen(true) }}
            onFocus={() => setIsOpen(true)}
            placeholder="syntax.markup"
            {...getReferenceProps()}
          />
          {isOpen && filtered.length > 0 && (
            <FloatingPortal>
              <div
                ref={refs.setFloating}
                className={styles.dropdown}
                style={{
                  ...floatingStyles,
                  background: themeColors['ui.bg'],
                  border: `1px solid ${themeColors['ui.line']}`,
                }}
                {...getFloatingProps()}
              >
                {filtered.map(color => (
                  <div
                    key={`${color.category}.${color.path}`}
                    className={styles.dropdownItem}
                    onClick={() => handleSelect(`${color.category}.${color.path}`)}
                    style={{ color: themeColors['editor.fg'] }}
                  >
                    <div
                      className={styles.colorPreview}
                      style={{ background: color.hex }}
                    />
                    <span style={{ color: themeColors['ui.fg'] }}>{color.category}.</span>
                    <span>{color.path.replace(color.category + '.', '')}</span>
                  </div>
                ))}
              </div>
            </FloatingPortal>
          )}
        </div>
      </div>
    </div>
  )
}
