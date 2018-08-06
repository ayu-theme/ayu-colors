import * as chroma from 'chroma-js'

export class Color {
  private base: chroma.Color
  private color: chroma.Color

  constructor(color: string, base: string) {
    this.color = chroma(color)
    this.base = chroma(base)
  }

  get rgb() {
    return this.color.rgb().map(Math.round).join(', ')
  }

  get hex() {
    return this.color.hex()
  }

  darken(value: number) {
    const color = this.color.darken(value > 1 ? value / 100 : value)
    return new Color(color.hex(), this.base.hex())
  }

  fade(value: number) {
    const level = value > 1 ? value / 100 : value
    const color = chroma.mix(this.base, this.color, level)
    return new Color(color.hex(), this.base.hex())
  }
}

export default (base: string) =>
  (color: TemplateStringsArray) =>
    new Color(color[0], base)
