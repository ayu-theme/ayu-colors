import * as chroma from 'chroma-js'

export class Color {
  static blend = false

  constructor(private color: chroma.Color, private bg: chroma.Color) {}

  rgb() {
    return this.color.rgb()
  }

  rgba() {
    return this.color.rgba()
  }

  hex(): string
  hex(type: 'rgb' | 'rgba' | 'blend'): string
  hex(type?: any): string {
    if ((type === 'blend' || Color.blend) && this.color.alpha() !== 1) {
      const alpha: number = this.color.alpha() as any
      return this.alpha(1).fade(alpha).hex()
    } else {
      return this.color.hex(type)
    }
  }

  preserveAlpha(value: number) {
    const alpha: number = this.color.alpha() as any
    if (alpha === 1) return this.alpha(value)
    return new Color(this.alpha(1).fade(alpha).color.alpha(value), this.bg)
  }

  alpha(value: number) {
    return new Color(this.color.alpha(value), this.bg)
  }

  fade(value: number) {
    type RGB = [number, number, number]
    const c = (this.color as any)._rgb as RGB
    const bg = (this.bg as any)._rgb as RGB
    const r = ((1 - value) * (bg[0] / 255) + value * (c[0] / 255)) * 255
    const g = ((1 - value) * (bg[1] / 255) + value * (c[1] / 255)) * 255
    const b = ((1 - value) * (bg[2] / 255) + value * (c[2] / 255)) * 255

    return new Color(chroma([Math.min(r, 255), Math.min(g, 255), Math.min(b, 255)], 'rgb'), this.bg)
  }

  darken(value: number) {
    return new Color(this.color.darken(value), this.bg)
  }

  brighten(value: number) {
    return new Color(this.color.brighten(value), this.bg)
  }
}

export default (bg: string) => (hex: TemplateStringsArray) =>
  new Color(chroma(hex.join('')), chroma(bg))

export const alphaBlend = (blend: boolean) => (Color.blend = blend)
