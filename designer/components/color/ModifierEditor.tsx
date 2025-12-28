'use client'

import { useThemeColors } from '../../hooks/useColors'
import { useDesignerStore } from '../../store'
import { NumericInput } from '../ui/NumericInput'
import { FormLabel } from '../ui/FormLabel'
import { Checkbox } from '../ui/Checkbox'
import { Toggle } from '../ui/Toggle'
import { Slider } from '../ui/Slider'
import type { Modifier } from '../../types'
import styles from './ModifierEditor.module.css'

interface ModifierEditorProps {
  modifiers: Modifier[]
  onChange: (modifiers: Modifier[]) => void
}

type ModifierType = 'L' | 'C' | 'A'

const MODIFIER_CONFIG: { type: ModifierType; label: string; max: number; step: number }[] = [
  { type: 'L', label: 'Lightness', max: 1, step: 0.01 },
  { type: 'C', label: 'Chroma', max: 0.4, step: 0.01 },
  { type: 'A', label: 'Alpha', max: 1, step: 0.01 },
]

export function ModifierEditor({ modifiers, onChange }: ModifierEditorProps) {
  const themeColors = useThemeColors()
  const savePreviousModifierValue = useDesignerStore(state => state.savePreviousModifierValue)
  const getPreviousModifierValue = useDesignerStore(state => state.getPreviousModifierValue)

  const getModifier = (type: ModifierType): Modifier | undefined =>
    modifiers.find(m => m.type === type)

  const isEnabled = (type: ModifierType): boolean =>
    modifiers.some(m => m.type === type)

  const isRelative = (type: ModifierType): boolean => {
    const mod = getModifier(type)
    return mod ? mod.op !== '' : false
  }

  const getSignedValue = (type: ModifierType): number => {
    const mod = getModifier(type)
    if (!mod) return 0
    if (mod.op === '-') return -mod.value
    return mod.value
  }

  const toggleEnabled = (type: ModifierType, max: number) => {
    if (isEnabled(type)) {
      // Save current value before disabling
      const mod = getModifier(type)
      if (mod) {
        savePreviousModifierValue(type, mod.value)
      }
      onChange(modifiers.filter(m => m.type !== type))
    } else {
      // Restore previous value when enabling
      const previousValue = getPreviousModifierValue(type, max)
      onChange([...modifiers, { op: '', type, value: previousValue }])
    }
  }

  const toggleRelative = (type: ModifierType, max: number) => {
    const mod = getModifier(type)
    if (!mod) return
    const newMods = modifiers.filter(m => m.type !== type)
    if (mod.op === '') {
      newMods.push({ op: '+', type, value: 0 })
    } else {
      const previousValue = getPreviousModifierValue(type, max)
      newMods.push({ op: '', type, value: previousValue })
    }
    onChange(newMods)
  }

  const updateValue = (type: ModifierType, signedValue: number, relative: boolean) => {
    // Save value for memory
    savePreviousModifierValue(type, Math.abs(signedValue))

    const newMods = modifiers.filter(m => m.type !== type)
    if (relative) {
      const op = signedValue >= 0 ? '+' : '-'
      newMods.push({ op, type, value: Math.abs(signedValue) })
    } else {
      newMods.push({ op: '', type, value: signedValue })
    }
    onChange(newMods)
  }

  return (
    <div className={styles.container}>
      <FormLabel>Modifiers</FormLabel>
      {MODIFIER_CONFIG.map(({ type, label, max, step }) => {
        const enabled = isEnabled(type)
        const relative = isRelative(type)
        const mod = getModifier(type)
        const value = relative ? getSignedValue(type) : (mod?.value ?? max / 2)
        const sliderMin = relative ? -max : 0
        const sliderMax = max

        return (
          <div key={type} className={styles.row}>
            <div className={styles.checkboxWrapper}>
              <Checkbox
                checked={enabled}
                onChange={() => toggleEnabled(type, max)}
                label={label}
              />
            </div>

            {enabled && (
              <>
                <Toggle
                  value={relative ? 'rel' : 'abs'}
                  options={[
                    { value: 'abs', label: 'Abs' },
                    { value: 'rel', label: 'Rel' },
                  ]}
                  onChange={v => toggleRelative(type, max)}
                  size="sm"
                  activeBackground={themeColors['ui.bg']}
                />

                <NumericInput
                  value={value}
                  min={sliderMin}
                  max={sliderMax}
                  step={step}
                  precision={2}
                  onChange={v => updateValue(type, v, relative)}
                  style={{ width: 56 }}
                />

                <div className={styles.sliderContainer}>
                  <Slider
                    value={value}
                    min={sliderMin}
                    max={sliderMax}
                    step={step}
                    onChange={v => updateValue(type, v as number, relative)}
                    size="sm"
                  />
                </div>
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}
