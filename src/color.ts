import * as chroma from 'chroma-js'

export interface Color extends chroma.Color {
  darken(value: number): Color
  fade(value: number): Color
}

export default (hexBase: string) => {
  const base = chroma(hexBase)
  const applyProxy = (hexColor: string): Color => {
    const color = chroma(hexColor)
    return new Proxy(color, {
      get (target: chroma.Color, prop: PropertyKey, receiver: any) {
        if (prop == 'hex') {
          const alpha: number = (target.alpha() as any) * 255
          return () => {
            if (alpha == 255) return target.hex();
            const str = parseInt(alpha.toFixed(0)).toString(16)
            return target.hex() + (str.length == 1 ? `0${str}` : str)
          }
        }

        if (prop == 'fade') {
          return (value) => applyProxy(chroma.mix(base, color, 1 - value).hex())
        }

        return (...args) => applyProxy(target[prop](...args))
      }
    }) as any
  }

  return applyProxy
}
