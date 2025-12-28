'use client'

import { useState, useEffect, type CSSProperties } from 'react'
import styles from './NumericInput.module.css'

interface NumericInputProps {
  value: number
  min: number
  max: number
  step?: number
  precision?: number
  wrap?: boolean
  suffix?: string
  onChange: (value: number) => void
  style?: CSSProperties
}

export function NumericInput({
  value,
  min,
  max,
  step = 0.01,
  precision = 2,
  wrap = false,
  suffix,
  onChange,
  style,
}: NumericInputProps) {
  const [text, setText] = useState(value.toFixed(precision))
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    if (!focused) setText(value.toFixed(precision))
  }, [value, focused, precision])

  const clamp = (v: number) => {
    if (wrap) {
      const range = max - min
      return ((v - min) % range + range) % range + min
    }
    return Math.min(max, Math.max(min, v))
  }

  const handleBlur = () => {
    setFocused(false)
    const v = parseFloat(text)
    if (!isNaN(v)) {
      const clamped = clamp(v)
      onChange(clamped)
      setText(clamped.toFixed(precision))
    } else {
      setText(value.toFixed(precision))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleBlur()
    else if (e.key === 'ArrowUp') {
      e.preventDefault()
      onChange(clamp(value + step))
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      onChange(clamp(value - step))
    }
  }

  return (
    <span className={styles.wrapper}>
      <input
        type="text"
        inputMode="decimal"
        value={text}
        onChange={e => setText(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={styles.input}
        style={style}
      />
      {suffix && <span className={styles.suffix}>{suffix}</span>}
    </span>
  )
}
