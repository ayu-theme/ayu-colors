'use client'

import type { CSSProperties, ReactNode } from 'react'
import { useThemeColors } from '../../hooks/useColors'

const baseStyle: CSSProperties = {
  padding: '8px 12px',
  fontSize: 13,
  fontWeight: 500,
  borderRadius: 4,
  border: 'none',
  cursor: 'pointer',
  transition: 'opacity 0.1s, transform 0.1s',
}

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary'
  title?: string
}

export function Button({ children, onClick, disabled, variant = 'secondary', title }: ButtonProps) {
  const themeColors = useThemeColors()
  const isPrimary = variant === 'primary'
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        ...baseStyle,
        background: isPrimary ? themeColors['common.accent.tint'] : themeColors['ui.line'],
        color: isPrimary ? themeColors['ui.bg'] : themeColors['editor.fg'],
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {children}
    </button>
  )
}

interface ThemeButtonProps {
  children: ReactNode
  onClick: () => void
  active: boolean
}

export function ThemeButton({ children, onClick, active }: ThemeButtonProps) {
  const themeColors = useThemeColors()
  return (
    <button
      onClick={onClick}
      style={{
        ...baseStyle,
        background: active ? themeColors['ui.line'] : 'transparent',
        border: `1px solid ${themeColors['ui.line']}`,
        color: active ? themeColors['editor.fg'] : themeColors['ui.fg'],
        textTransform: 'capitalize',
      }}
    >
      {children}
    </button>
  )
}
