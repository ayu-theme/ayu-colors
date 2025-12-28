import { iconsData } from './generated/icons.js'

export const icons = iconsData

export type IconsData = typeof iconsData

export function resolveIcon(filename: string): string {
  if (filename in icons.filenames) return icons.filenames[filename as keyof typeof icons.filenames]
  const ext = filename.slice(filename.lastIndexOf('.') + 1).toLowerCase()
  if (ext in icons.extensions) return icons.extensions[ext as keyof typeof icons.extensions]
  return 'default'
}

export function getIconFile(id: string, variant: 'dark' | 'light' = 'dark'): string | null {
  if (id === 'default') return icons.default
  const file = icons.files[id as keyof typeof icons.files]
  if (!file) return null
  if (typeof file === 'string') return file
  return file[variant]
}
