'use client'

import type { CSSProperties } from 'react'
import styles from './TextInput.module.css'

interface TextInputProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  transform?: (value: string) => string
  style?: CSSProperties
  className?: string
}

export function TextInput({
  value,
  onChange,
  onBlur,
  placeholder,
  transform,
  style,
  className,
}: TextInputProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => {
        const val = transform ? transform(e.target.value) : e.target.value
        onChange(val)
      }}
      onBlur={onBlur}
      placeholder={placeholder}
      className={`${styles.input} ${className || ''}`}
      style={style}
    />
  )
}
