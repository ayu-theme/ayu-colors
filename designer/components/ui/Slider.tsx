'use client'

import { useRef, useEffect } from 'react'
import * as RadixSlider from '@radix-ui/react-slider'
import { useThemeColors } from '../../hooks/useColors'
import styles from './Slider.module.css'

type SliderValue = number | [number, number]

interface SliderProps {
  value: SliderValue
  onChange: (value: SliderValue) => void
  min: number
  max: number
  step?: number
  renderGradient?: (ctx: CanvasRenderingContext2D, width: number, height: number) => void
  trackColor?: string
  rangeColor?: string
  thumbColor?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Slider({
  value,
  onChange,
  min,
  max,
  step = 0.01,
  renderGradient,
  trackColor,
  rangeColor,
  thumbColor,
  size = 'md',
}: SliderProps) {
  const themeColors = useThemeColors()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isRange = Array.isArray(value)
  const sliderValue = isRange ? value : [value]

  const defaultTrackColor = trackColor || themeColors['ui.line']
  const defaultRangeColor = rangeColor || themeColors['common.accent.tint']
  const defaultThumbColor = thumbColor || themeColors['common.accent.tint']

  useEffect(() => {
    if (!renderGradient || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, rect.width, rect.height)
    renderGradient(ctx, rect.width, rect.height)
  }, [renderGradient])

  const handleChange = (values: number[]) => {
    if (isRange) {
      onChange(values as [number, number])
    } else {
      onChange(values[0])
    }
  }

  const sizeClass = size === 'sm' ? styles.small : size === 'lg' ? styles.large : ''

  return (
    <div className={`${styles.container} ${sizeClass}`}>
      {renderGradient && (
        <canvas
          ref={canvasRef}
          className={styles.canvas}
        />
      )}
      <RadixSlider.Root
        value={sliderValue}
        min={min}
        max={max}
        step={step}
        onValueChange={handleChange}
        className={styles.root}
      >
        <RadixSlider.Track
          className={styles.track}
          style={{ background: renderGradient ? 'transparent' : defaultTrackColor }}
        >
          {!renderGradient && (
            <RadixSlider.Range
              className={styles.range}
              style={{ background: defaultRangeColor }}
            />
          )}
        </RadixSlider.Track>
        {sliderValue.map((_, i) => (
          <RadixSlider.Thumb
            key={i}
            className={styles.thumb}
            style={{
              background: defaultThumbColor,
              borderColor: renderGradient ? 'rgba(255,255,255,0.7)' : themeColors['ui.bg'],
            }}
          />
        ))}
      </RadixSlider.Root>
    </div>
  )
}
