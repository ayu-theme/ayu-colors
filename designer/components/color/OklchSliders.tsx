'use client'

import { useMemo, useCallback, useState, useEffect, useRef } from 'react'
import type { Oklch } from 'culori'
import { useThemeColors } from '../../hooks/useColors'
import { Slider } from '../ui/Slider'
import { NumericInput } from '../ui/NumericInput'
import { clampChroma, formatHex, maxChromaAt } from '../../lib/color-utils'
import styles from './OklchSliders.module.css'

interface OklchSlidersProps {
  oklch: Oklch
  onChange: (hex: string) => void
}

export function OklchSliders({ oklch, onChange }: OklchSlidersProps) {
  const themeColors = useThemeColors()
  const l = Number.isFinite(oklch.l) ? oklch.l : 0
  const c = Number.isFinite(oklch.c) ? oklch.c : 0
  const h = Number.isFinite(oklch.h) ? oklch.h : 0

  const [rawC, setRawC] = useState(c)
  const [rawH, setRawH] = useState(h)
  const isInternalChange = useRef(false)

  const maxC = useMemo(() => maxChromaAt(l, rawH), [l, rawH])

  const currentHex = useMemo(() => {
    const clamped = clampChroma({ mode: 'oklch' as const, l, c: rawC, h: rawH }, 'oklch')
    return formatHex(clamped) ?? '#000000'
  }, [l, rawC, rawH])

  useEffect(() => {
    if (isInternalChange.current) {
      isInternalChange.current = false
      return
    }
    setRawC(c)
    setRawH(h)
  }, [l, c, h])

  const updateColor = (newL: number, newC: number, newH: number) => {
    isInternalChange.current = true
    const clamped = clampChroma({ mode: 'oklch' as const, l: newL, c: newC, h: newH }, 'oklch')
    onChange(formatHex(clamped) ?? '#000000')
  }

  const renderLightnessGradient = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    for (let x = 0; x <= w; x++) {
      const lVal = x / w
      ctx.fillStyle = formatHex(clampChroma({ mode: 'oklch', l: lVal, c: rawC, h: rawH }, 'oklch')) ?? '#000'
      ctx.fillRect(x, 0, 1, h)
    }
  }, [rawC, rawH])

  const renderChromaGradient = useCallback((ctx: CanvasRenderingContext2D, w: number, ht: number) => {
    for (let x = 0; x <= w; x++) {
      const cVal = (x / w) * maxC
      ctx.fillStyle = formatHex(clampChroma({ mode: 'oklch', l, c: cVal, h: rawH }, 'oklch')) ?? '#000'
      ctx.fillRect(x, 0, 1, ht)
    }
  }, [l, rawH, maxC])

  const renderHueGradient = useCallback((ctx: CanvasRenderingContext2D, w: number, ht: number) => {
    for (let x = 0; x <= w; x++) {
      const hVal = (x / w) * 360
      ctx.fillStyle = formatHex(clampChroma({ mode: 'oklch', l, c: rawC, h: hVal }, 'oklch')) ?? '#000'
      ctx.fillRect(x, 0, 1, ht)
    }
  }, [l, rawC])

  const channels = [
    { label: 'L', value: l, min: 0, max: 1, step: 0.01, precision: 2, render: renderLightnessGradient, set: (v: number) => updateColor(v, rawC, rawH) },
    { label: 'C', value: rawC, min: 0, max: maxC, step: 0.001, precision: 3, render: renderChromaGradient, set: (v: number) => { setRawC(v); updateColor(l, v, rawH) } },
    { label: 'H', value: rawH, min: 0, max: 360, step: 1, precision: 0, render: renderHueGradient, set: (v: number) => { setRawH(v); updateColor(l, rawC, v) } },
  ]

  return (
    <div className={styles.container}>
      {channels.map(ch => (
        <div key={ch.label} className={styles.channel}>
          <div className={styles.labelRow}>
            <span className={styles.label} style={{ color: themeColors['ui.fg'] }}>{ch.label}</span>
            <NumericInput
              value={ch.value}
              min={ch.min}
              max={ch.max}
              step={ch.step}
              precision={ch.precision}
              onChange={ch.set}
            />
          </div>
          <Slider
            value={ch.value}
            min={ch.min}
            max={ch.max}
            step={ch.step / 10}
            renderGradient={ch.render}
            thumbColor={currentHex}
            onChange={v => ch.set(v as number)}
            size="lg"
          />
        </div>
      ))}
    </div>
  )
}
