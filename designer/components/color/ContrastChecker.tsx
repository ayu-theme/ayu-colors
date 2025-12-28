import { getAPCAContrast } from '../../lib/color-utils'

interface ContrastCheckerProps {
  foreground: string
  background: string
  borderColor: string
}

export function ContrastChecker({ foreground, background, borderColor }: ContrastCheckerProps) {
  const lc = getAPCAContrast(foreground, background)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: borderColor, borderRadius: 6 }}>
      <div style={{ width: 32, height: 32, borderRadius: 4, background, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${borderColor}` }}>
        <span style={{ color: foreground, fontSize: 14, fontWeight: 600 }}>Aa</span>
      </div>
      <span style={{ fontSize: 14, fontWeight: 600, color: foreground, fontFamily: 'var(--font-mono)' }}>Lc {lc.toFixed(1)}</span>
    </div>
  )
}
