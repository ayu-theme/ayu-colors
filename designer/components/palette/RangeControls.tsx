import { useThemeColors } from '../../hooks/useColors'
import { Slider } from '../ui/Slider'
import { NumericInput } from '../ui/NumericInput'
import { FormLabel } from '../ui/FormLabel'
import styles from './RangeControls.module.css'

interface RangeControlsProps {
  minL: number
  maxL: number
  onChange: (min: number, max: number) => void
  steps: number
  onStepsChange: (steps: number) => void
}

export function RangeControls({ minL, maxL, onChange, steps, onStepsChange }: RangeControlsProps) {
  const themeColors = useThemeColors()
  const round = (n: number) => Math.round(n * 1000) / 1000

  return (
    <div className={styles.container}>
      <div className={styles.sliderGroup}>
        <FormLabel>Lightness</FormLabel>
        <Slider
          min={0}
          max={1}
          step={0.001}
          value={[minL, maxL]}
          onChange={v => {
            const [min, max] = v as [number, number]
            onChange(round(min), round(max))
          }}
          trackColor={themeColors['ui.line']}
          thumbColor={themeColors['editor.fg']}
        />
      </div>
      <div className={styles.inputGroup}>
        <FormLabel>Min</FormLabel>
        <NumericInput
          value={round(minL)}
          min={0}
          max={1}
          step={0.001}
          precision={3}
          onChange={v => { if (v >= 0 && v < maxL) onChange(round(v), maxL) }}
        />
      </div>
      <div className={styles.inputGroup}>
        <FormLabel>Max</FormLabel>
        <NumericInput
          value={round(maxL)}
          min={0}
          max={1}
          step={0.001}
          precision={3}
          onChange={v => { if (v <= 1 && v > minL) onChange(minL, round(v)) }}
        />
      </div>
      <div className={styles.inputGroup}>
        <FormLabel>Steps</FormLabel>
        <NumericInput
          value={steps}
          min={2}
          max={10}
          step={1}
          precision={0}
          onChange={v => onStepsChange(Math.round(v))}
        />
      </div>
    </div>
  )
}
