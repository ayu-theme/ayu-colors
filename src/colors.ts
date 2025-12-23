import rawDark from './dark.js'
import rawLight from './light.js'
import rawMirage from './mirage.js'

export type Scheme = typeof rawDark

export const dark: Scheme = rawDark
export const light: Scheme = rawLight
export const mirage: Scheme = rawMirage

export { alphaBlend } from './color.js'
