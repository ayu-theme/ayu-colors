'use client'

import { useThemeColors } from '../../hooks/useColors'
import styles from './Toggle.module.css'

interface ToggleOption {
  value: string
  label: string
}

interface ToggleProps {
  value: string
  options: ToggleOption[]
  onChange: (value: string) => void
  size?: 'sm' | 'md'
  activeBackground?: string
}

export function Toggle({ value, options, onChange, size = 'md', activeBackground }: ToggleProps) {
  const themeColors = useThemeColors()
  const activeBg = activeBackground || themeColors['editor.bg']

  return (
    <div
      className={`${styles.container} ${size === 'sm' ? styles.small : ''}`}
      style={{ background: themeColors['ui.line'] }}
    >
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={styles.option}
          style={{
            background: value === opt.value ? activeBg : 'transparent',
            color: value === opt.value ? themeColors['editor.fg'] : themeColors['ui.fg'],
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
