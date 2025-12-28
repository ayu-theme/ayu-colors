'use client'

import { useState, useEffect } from 'react'
import type { SelectedColor, ColorValue, Modifier, RangeModifier } from '../../types'
import { useThemeColors } from '../../hooks/useColors'
import { parseHexToOklch, applyModifiers } from '../../lib/color-utils'
import { OklchSliders } from './OklchSliders'
import { ContrastChecker } from './ContrastChecker'
import { ReferencePicker, type ColorPath } from './ReferencePicker'
import { ModifierEditor } from './ModifierEditor'
import { FormLabel } from '../ui/FormLabel'
import { Toggle } from '../ui/Toggle'
import { TextInput } from '../ui/TextInput'
import { Checkbox } from '../ui/Checkbox'
import { Slider } from '../ui/Slider'
import { NumericInput } from '../ui/NumericInput'

interface ColorEditorProps {
  selected: SelectedColor
  onClose: () => void
  onChange: (hex: string) => void
  onReferenceChange?: (value: ColorValue) => void
  availableColors?: ColorPath[]
  paletteColors?: string[]
  initialMode?: 'hex' | 'reference'
  initialReferenceValue?: ColorValue | null
  resolveReference?: (ref: string, modifiers: Modifier[]) => string
  // Palette range props
  paletteColorRange?: RangeModifier
  globalPaletteRange?: [number, number]
  onPaletteRangeChange?: (range: RangeModifier | null) => void
}

export function ColorEditor({
  selected,
  onClose,
  onChange,
  onReferenceChange,
  availableColors = [],
  paletteColors = [],
  initialMode = 'hex',
  initialReferenceValue,
  resolveReference = () => '#888888',
  paletteColorRange,
  globalPaletteRange = [0.25, 0.92],
  onPaletteRangeChange,
}: ColorEditorProps) {
  const themeColors = useThemeColors()
  // Pick bg based on category
  const bg = (selected.category === 'editor' || selected.category === 'syntax' || selected.category === 'palette') ? themeColors['editor.bg'] : themeColors['ui.bg']
  const [mode, setMode] = useState<'hex' | 'reference'>(initialMode)
  const [hexInput, setHexInput] = useState(() => {
    const base = initialReferenceValue?.baseHex || selected.hex
    return base.toUpperCase()
  })
  const [colorValue, setColorValue] = useState<ColorValue>(() => {
    if (initialReferenceValue) {
      return initialReferenceValue
    }
    return {
      type: initialMode,
      hex: selected.hex,
      reference: '',
      modifiers: undefined,
    }
  })
  const [hoverCurrent, setHoverCurrent] = useState(false)

  // Sync hexInput from base (not resolved)
  useEffect(() => {
    const base = colorValue.baseHex || colorValue.hex
    setHexInput(base.toUpperCase())
  }, [colorValue.baseHex, colorValue.hex])

  // Reset colorValue when selected color changes (not when initialReferenceValue object changes)
  useEffect(() => {
    setMode(initialMode)
    if (initialReferenceValue) {
      setColorValue(initialReferenceValue)
    } else {
      setColorValue({
        type: initialMode,
        hex: selected.hex,
        reference: '',
        modifiers: undefined,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected.path, selected.category, selected.theme])

  // The base hex for editing (without modifiers)
  const editableBaseHex = colorValue.baseHex || colorValue.hex
  const oklch = parseHexToOklch(editableBaseHex.slice(0, 7))
  const hasChanged = colorValue.hex.toLowerCase() !== selected.originalHex.toLowerCase()
  const isPalette = selected.category === 'palette'

  const handleColorChange = (hex: string) => {
    // User is editing the base hex; recompute resolved with modifiers
    const modifiers = colorValue.modifiers || []
    const resolvedHex = modifiers.length > 0
      ? applyModifiers(hex, modifiers)
      : hex

    const newValue: ColorValue = {
      ...colorValue,
      baseHex: hex,
      hex: resolvedHex,
    }
    setColorValue(newValue)
    onChange(resolvedHex)
    onReferenceChange?.(newValue)
  }

  const handleReferenceChange = (ref: string) => {
    const resolvedHex = resolveReference(ref, colorValue.modifiers || [])
    const newValue: ColorValue = {
      type: 'reference',
      hex: resolvedHex,
      reference: ref,
      modifiers: colorValue.modifiers,
    }
    setColorValue(newValue)
    onReferenceChange?.(newValue)
  }

  const handleReset = () => {
    if (!hasChanged) return

    // Reset to original value (no modifiers)
    const resetValue: ColorValue = {
      type: 'hex',
      hex: selected.originalHex,
      baseHex: selected.originalHex,
      modifiers: undefined,
    }

    setColorValue(resetValue)
    onChange(selected.originalHex)
    onReferenceChange?.(resetValue)
  }

  const handleModifiersChange = (modifiers: Modifier[]) => {
    const newModifiers = modifiers.length > 0 ? modifiers : undefined
    if (mode === 'reference') {
      const resolvedHex = resolveReference(colorValue.reference || '', modifiers)
      const newValue: ColorValue = {
        type: 'reference',
        hex: resolvedHex,
        reference: colorValue.reference,
        modifiers: newModifiers,
      }
      setColorValue(newValue)
      onReferenceChange?.(newValue)
    } else {
      // Use baseHex if available, otherwise use selected.hex as the base
      const baseHex = colorValue.baseHex || selected.hex
      const resolvedHex = modifiers.length > 0
        ? applyModifiers(baseHex, modifiers)
        : baseHex
      const newValue: ColorValue = {
        type: 'hex',
        hex: resolvedHex,
        baseHex: baseHex,
        modifiers: newModifiers,
      }
      setColorValue(newValue)
      onReferenceChange?.(newValue)
    }
  }

  return (
    <div style={{ height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: themeColors['editor.fg'], fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {selected.category}.{selected.path}
            </span>
            <span style={{ color: themeColors['ui.fg'], fontSize: 12, fontFamily: 'var(--font-mono)' }}>
              {colorValue.hex.toUpperCase()}
            </span>
          </div>
          <div style={{ color: themeColors['ui.fg'], fontSize: 11, marginTop: 2 }}>{selected.theme}</div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: themeColors['ui.fg'], cursor: 'pointer', fontSize: 18, padding: 4, marginLeft: 8, lineHeight: 1 }}>×</button>
      </div>

      {/* Mode Toggle - only for non-palette colors */}
      {!isPalette && availableColors.length > 0 && (
        <div style={{ padding: '12px 16px' }}>
          <Toggle
            value={mode}
            options={[
              { value: 'hex', label: 'Direct' },
              { value: 'reference', label: 'Reference' },
            ]}
            onChange={v => {
              const newMode = v as 'hex' | 'reference'
              setMode(newMode)
              setColorValue({
                type: newMode,
                hex: selected.hex,
                reference: '',
                modifiers: undefined,
              })
            }}
            activeBackground={bg}
          />
        </div>
      )}

      {/* Body */}
      <div style={{ padding: 16 }}>
        {/* Before/After */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', marginBottom: 4 }}>
            <div style={{ flex: 1, fontSize: 10, color: themeColors['ui.fg'], textTransform: 'uppercase', letterSpacing: 0.5 }}>Original</div>
            <div style={{ flex: 1, fontSize: 10, color: themeColors['ui.fg'], textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'right' }}>Current</div>
          </div>
          <div style={{ display: 'flex', height: 48, borderRadius: 6, overflow: 'hidden', border: `1px solid ${themeColors['ui.line']}` }}>
            <div style={{ flex: 1, background: selected.originalHex }} />
            <div
              style={{ flex: 1, background: colorValue.hex, position: 'relative', cursor: hasChanged ? 'pointer' : 'default' }}
              onMouseEnter={() => setHoverCurrent(true)}
              onMouseLeave={() => setHoverCurrent(false)}
              onClick={handleReset}
            >
              {hasChanged && hoverCurrent && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)' }}>
                  <span style={{ fontSize: 18, color: '#fff' }}>↩</span>
                </div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', marginTop: 4 }}>
            <div style={{ flex: 1, fontSize: 10, fontFamily: 'var(--font-mono)', color: themeColors['ui.fg'] }}>{selected.originalHex.toUpperCase()}</div>
            <div style={{ flex: 1, fontSize: 10, fontFamily: 'var(--font-mono)', color: themeColors['ui.fg'], textAlign: 'right' }}>
              {hasChanged ? colorValue.hex.toUpperCase() : '==='}
            </div>
          </div>
        </div>

        {mode === 'hex' || isPalette ? (
          <>
            {/* Hex Input */}
            <div style={{ marginBottom: 20 }}>
              <FormLabel>Hex</FormLabel>
              <TextInput
                value={hexInput}
                onChange={raw => {
                  setHexInput(raw)
                  const val = raw.startsWith('#') ? raw : '#' + raw
                  if (/^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/.test(val)) {
                    handleColorChange(val)
                  }
                }}
                onBlur={() => {
                  let val = hexInput.trim()
                  if (!val.startsWith('#')) val = '#' + val
                  if (/^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/i.test(val)) {
                    handleColorChange(val)
                    setHexInput(val.toUpperCase())
                  } else {
                    setHexInput(editableBaseHex.toUpperCase())
                  }
                }}
                transform={v => v.toUpperCase()}
              />
            </div>

            {/* OKLCH Sliders */}
            {oklch && (
              <div style={{ marginBottom: 20 }}>
                <OklchSliders oklch={oklch} onChange={handleColorChange} />
              </div>
            )}
          </>
        ) : (
          <div style={{ marginBottom: 20 }}>
            <ReferencePicker
              value={colorValue.reference || ''}
              onChange={handleReferenceChange}
              availableColors={availableColors}
              paletteColors={paletteColors}
              isLight={selected.theme === 'light'}
            />
          </div>
        )}

        {/* Modifiers */}
        {!isPalette && (
          <div style={{ marginBottom: 20 }}>
            <ModifierEditor
              modifiers={colorValue.modifiers || []}
              onChange={handleModifiersChange}
            />
          </div>
        )}

        {/* Palette Range Override */}
        {isPalette && onPaletteRangeChange && (
          <div style={{ marginBottom: 20 }}>
            <Checkbox
              checked={!!paletteColorRange}
              onChange={checked => {
                if (checked) {
                  onPaletteRangeChange({ min: globalPaletteRange[0], max: globalPaletteRange[1] })
                } else {
                  onPaletteRangeChange(null)
                }
              }}
              label="Custom lightness range"
            />
            {paletteColorRange && (
              <div style={{ marginTop: 12 }}>
                <Slider
                  value={[paletteColorRange.min, paletteColorRange.max]}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={value => {
                    if (Array.isArray(value)) {
                      onPaletteRangeChange({ min: value[0], max: value[1] })
                    }
                  }}
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <div style={{ flex: 1 }}>
                    <FormLabel>Min</FormLabel>
                    <NumericInput
                      value={paletteColorRange.min}
                      min={0}
                      max={paletteColorRange.max - 0.01}
                      step={0.01}
                      precision={2}
                      onChange={v => onPaletteRangeChange({ ...paletteColorRange, min: v })}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <FormLabel>Max</FormLabel>
                    <NumericInput
                      value={paletteColorRange.max}
                      min={paletteColorRange.min + 0.01}
                      max={1}
                      step={0.01}
                      precision={2}
                      onChange={v => onPaletteRangeChange({ ...paletteColorRange, max: v })}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Contrast Checker */}
        <ContrastChecker
          foreground={colorValue.hex}
          background={bg}
          borderColor={themeColors['ui.line']}
        />
      </div>
    </div>
  )
}
