import rawDark from './dark'
import rawLight from './light'
import rawMirage from './mirage'

export type Scheme = typeof rawDark

export const dark: Scheme = rawDark
export const light: Scheme = rawLight
export const mirage: Scheme = rawMirage

export { alphaBlend } from './color'
