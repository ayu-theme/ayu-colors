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
            const hex = target.hex()
            if (alpha == 255 || hex.length == 9) return target.hex();
            return hex.substr(0, 7) + '0' + hex.substr(7)
          }
        }

        if (prop == 'fade') {
          return (value) => applyProxy(chroma.mix(base, color, 1 - value).hex())
        }

        return (...args) => {
          const result = target[prop](...args)
          return result.constructor && result.constructor.prototype == color.constructor.prototype
            ? applyProxy(result) : result
        }
      }
    }) as any
  }

  return applyProxy
}
