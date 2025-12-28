import {
  parse,
  oklch,
  formatHex,
  formatHex8,
  toGamut,
  converter,
  clampChroma
} from 'culori'
import type { Oklch, Rgb } from 'culori'

const toRgb = converter('rgb')

export class Color {
  private _rgb: Rgb
  private _alpha: number
  private _lOverride: number | null = null
  private _lDelta: number = 0
  private _cOverride: number | null = null
  private _cDelta: number = 0

  constructor(hex: string) {
    const parsed = parse(hex)
    if (!parsed) throw new Error(`Invalid color: ${hex}`)
    this._rgb = toRgb(parsed)!
    this._alpha = parsed.alpha ?? 1
  }

  private get _oklch(): Oklch {
    return oklch(this._rgb) as Oklch
  }

  private get _resolvedOklch(): Oklch {
    const ok = this._oklch
    ok.l = this.getL()
    ok.c = this.getC()
    return ok
  }

  private _getMaxC(l: number): number {
    const highChroma = { mode: 'oklch' as const, l, c: 0.5, h: this._oklch.h }
    const gamutMapper = toGamut('rgb', 'oklch')
    const rgb = gamutMapper(highChroma) as Rgb
    const mapped = oklch(rgb) as Oklch
    return mapped.c
  }

  private _clone(): Color {
    const c = new Color('#000')
    c._rgb = { ...this._rgb }
    c._alpha = this._alpha
    c._lOverride = this._lOverride
    c._lDelta = this._lDelta
    c._cOverride = this._cOverride
    c._cDelta = this._cDelta
    return c
  }

  // --- Output formats ---

  hex(): string {
    if (this._lOverride === null && this._lDelta === 0 && this._cOverride === null && this._cDelta === 0) {
      return this._alpha < 1
        ? formatHex8({ ...this._rgb, alpha: this._alpha })
        : formatHex(this._rgb)
    }
    const ok = this._resolvedOklch
    const gamutMapper = toGamut('rgb', 'oklch')
    const rgb = gamutMapper(ok) as Rgb
    return this._alpha < 1
      ? formatHex8({ ...rgb, alpha: this._alpha })
      : formatHex(rgb)
  }

  rgb(): [number, number, number] {
    if (this._lOverride === null && this._lDelta === 0 && this._cOverride === null && this._cDelta === 0) {
      return [
        Math.round(this._rgb.r * 255),
        Math.round(this._rgb.g * 255),
        Math.round(this._rgb.b * 255)
      ]
    }
    const ok = this._resolvedOklch
    const gamutMapper = toGamut('rgb', 'oklch')
    const rgb = gamutMapper(ok) as Rgb
    return [
      Math.round(rgb.r * 255),
      Math.round(rgb.g * 255),
      Math.round(rgb.b * 255)
    ]
  }

  rgba(): [number, number, number, number] {
    return [...this.rgb(), this._alpha]
  }

  getAlpha(): number {
    return this._alpha
  }

  getL(): number {
    const baseL = this._oklch.l
    if (this._lOverride !== null) {
      return Math.max(0, Math.min(1, this._lOverride + this._lDelta))
    }
    return Math.max(0, Math.min(1, baseL + this._lDelta))
  }

  getC(): number {
    const resolvedL = this.getL()
    const maxC = this._getMaxC(resolvedL)
    const baseRelativeC = this._oklch.c / this._getMaxC(this._oklch.l)

    if (this._cOverride !== null) {
      return Math.max(0, Math.min(1, this._cOverride + this._cDelta)) * maxC
    }
    return Math.max(0, Math.min(1, baseRelativeC + this._cDelta)) * maxC
  }

  // --- Manipulation ---

  alpha(value: number): Color {
    const c = this._clone()
    c._alpha = value
    return c
  }

  darken(amount: number): Color {
    return this.deltaL(-amount * 0.1)
  }

  brighten(amount: number): Color {
    return this.deltaL(amount * 0.1)
  }

  deltaL(delta: number): Color {
    const c = this._clone()
    c._lDelta += delta
    return c
  }

  setL(value: number): Color {
    const c = this._clone()
    c._lOverride = Math.max(0, Math.min(1, value))
    c._lDelta = 0
    return c
  }

  deltaC(delta: number): Color {
    const c = this._clone()
    c._cDelta += delta
    return c
  }

  setC(value: number): Color {
    const c = this._clone()
    c._cOverride = Math.max(0, Math.min(1, value))
    c._cDelta = 0
    return c
  }

  // --- Blend with background ---

  blend(bg: Color | string): Color {
    const bgColor = typeof bg === 'string' ? new Color(bg) : bg

    // Get RGB values for both colors (applying any L/C modifiers)
    const fgRgb = this.rgb()
    const bgRgb = bgColor.rgb()
    const alpha = this._alpha

    // Alpha compositing formula: result = fg * alpha + bg * (1 - alpha)
    const c = new Color('#000')
    c._rgb = {
      mode: 'rgb',
      r: (fgRgb[0] * alpha + bgRgb[0] * (1 - alpha)) / 255,
      g: (fgRgb[1] * alpha + bgRgb[1] * (1 - alpha)) / 255,
      b: (fgRgb[2] * alpha + bgRgb[2] * (1 - alpha)) / 255
    }
    c._alpha = 1
    return c
  }

  // --- Static palette generation ---

  private static _maxChromaAt(l: number, h: number | undefined): number {
    const highChroma = { mode: 'oklch' as const, l, c: 0.5, h }
    const gamutMapper = toGamut('rgb', 'oklch')
    const rgb = gamutMapper(highChroma) as Rgb
    const mapped = oklch(rgb) as Oklch
    return mapped.c
  }

  static generatePalette(
    inputHex: string,
    steps: number,
    minL: number,
    maxL: number
  ): Map<number, Color> {
    const parsed = parse(inputHex)
    if (!parsed) throw new Error(`Invalid color: ${inputHex}`)
    const orig = oklch(parsed) as Oklch

    // Find max chroma at original L/H (gamut boundary)
    const origMaxC = Color._maxChromaAt(orig.l, orig.h)

    // Calculate relative saturation (how far toward gamut edge)
    const ratio = origMaxC > 0 ? orig.c / origMaxC : 0

    // Clamp original L to range - if outside, place at closest extreme
    const clampedOrigL = Math.max(minL, Math.min(maxL, orig.l))

    // Find where clamped original falls in L range, anchor it to a step
    const origPos = (clampedOrigL - minL) / (maxL - minL)
    const origIndex = Math.round(origPos * (steps - 1))

    // Generate L values with non-uniform spacing anchored to clamped original
    const stepsBelow = origIndex
    const stepsAbove = steps - 1 - origIndex

    const lValues: number[] = []
    if (stepsBelow > 0) {
      for (let i = 0; i <= stepsBelow; i++) {
        lValues.push(minL + (clampedOrigL - minL) * (i / stepsBelow))
      }
    } else {
      lValues.push(clampedOrigL)
    }
    for (let i = 1; i <= stepsAbove; i++) {
      lValues.push(clampedOrigL + (maxL - clampedOrigL) * (i / stepsAbove))
    }

    // Generate colors, keyed by L×1000
    const result = new Map<number, Color>()
    for (const l of lValues) {
      const maxC = Color._maxChromaAt(l, orig.h)
      const c = maxC * ratio
      const clamped = clampChroma({ mode: 'oklch', l, c, h: orig.h }, 'oklch')
      const hex = formatHex(clamped)
      const key = Math.round(l * 1000)
      result.set(key, new Color(hex))
    }

    // Ensure original color is in the result (with its actual L, not clamped)
    // If outside range, remove the extreme color to keep exactly 10
    if (orig.l < minL) {
      result.delete(Math.round(minL * 1000))
    } else if (orig.l > maxL) {
      result.delete(Math.round(maxL * 1000))
    }
    const origKey = Math.round(orig.l * 1000)
    result.set(origKey, new Color(inputHex))

    return result
  }
}
