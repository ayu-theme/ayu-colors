import * as chroma from 'chroma-js'


export class Color {
  constructor(private base: chroma.Color, private  color: chroma.Color) {
  }

  rgb() {
    return this.color.rgb()
  }

  rgba() {
    return this.color.rgba()
  }

  hex(type?: 'rgb' | 'rgba' | 'blend'): string {
    if (type != 'blend') return this.color.hex(type)

    const alpha: number = this.color.alpha() as any
    return this.forceAlpha(1).fade(1 - alpha).hex()
  }

  alpha(value: number) {
    const alpha: number = this.color.alpha() as any
    if (alpha === 1) return this.forceAlpha(value)
    return new Color(this.base, this.forceAlpha(1).fade(1 - alpha).color.alpha(value))
  }

  forceAlpha(value: number) {
    return new Color(this.base, this.color.alpha(value))
  }

  fade(value: number) {
    return new Color(this.base, chroma.mix(this.base, this.color, 1 - value))
  }

  darken(value: number) {
    return new Color(this.base, this.color.darken(value))
  }

  brighten(value: number) {
    return new Color(this.base, this.color.brighten(value))
  }
}

export default (hexBase: string) =>
  (hexColor: string) =>
    new Color(chroma(hexBase), chroma(hexColor))
