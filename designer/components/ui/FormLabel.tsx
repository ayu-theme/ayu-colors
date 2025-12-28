'use client'

import type { ReactNode } from 'react'
import { useThemeColors } from '../../hooks/useColors'
import styles from './FormLabel.module.css'

interface FormLabelProps {
  children: ReactNode
  htmlFor?: string
}

export function FormLabel({ children, htmlFor }: FormLabelProps) {
  const themeColors = useThemeColors()
  return (
    <label
      htmlFor={htmlFor}
      className={styles.label}
      style={{ color: themeColors['ui.fg'] }}
    >
      {children}
    </label>
  )
}
