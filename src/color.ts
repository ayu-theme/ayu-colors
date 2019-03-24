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

  hex(type?: 'rgb' | 'rgba' | 'blend') {
    if (type != 'blend') return this.color.hex(type)

    const alpha: number = this.color.alpha() as any
    return this.fade(1 - alpha).alpha(1).hex()
  }

  alpha(value: number) {
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
