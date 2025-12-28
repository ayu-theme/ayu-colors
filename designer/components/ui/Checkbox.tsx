'use client'

import type { ReactNode } from 'react'
import { useThemeColors } from '../../hooks/useColors'
import styles from './Checkbox.module.css'

interface CheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: ReactNode
  disabled?: boolean
}

export function Checkbox({ checked, onChange, label, disabled }: CheckboxProps) {
  const themeColors = useThemeColors()

  return (
    <label className={styles.label} style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        disabled={disabled}
        className={styles.checkbox}
      />
      {label && (
        <span
          className={styles.text}
          style={{ color: checked ? themeColors['editor.fg'] : themeColors['ui.fg'] }}
        >
          {label}
        </span>
      )}
    </label>
  )
}
