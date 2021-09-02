import * as chroma from 'chroma-js'


export class Color {
  constructor(private  color: chroma.Color) {
  }

  rgb() {
    return this.color.rgb()
  }

  rgba() {
    return this.color.rgba()
  }

  hex(): string
  hex(type: 'rgb' | 'rgba'): string
  hex(type: 'blend', base: Color): string
  hex(type?: any, base?: Color): string {
    if (type != 'blend') return this.color.hex(type)

    const alpha: number = this.color.alpha() as any
    return this.alpha(1).fade(base, 1 - alpha).hex()
  }

  preserveAlpha(base: Color, value: number) {
    const alpha: number = this.color.alpha() as any
    if (alpha === 1) return this.alpha(value)
    return new Color(this.alpha(1).fade(base, 1 - alpha).color.alpha(value))
  }

  alpha(value: number) {
    return new Color(this.color.alpha(value))
  }

  fade(base: Color, value: number) {
    return new Color(chroma.mix(base.color, this.color, 1 - value))
  }

  darken(value: number) {
    return new Color(this.color.darken(value))
  }

  brighten(value: number) {
    return new Color(this.color.brighten(value))
  }
}

export default (hex: TemplateStringsArray) => new Color(chroma(hex.join('')))
