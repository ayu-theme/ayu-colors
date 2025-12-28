import type { Color } from './color.js'

export interface Palette {
  gray: { l1: Color; l2: Color; l3: Color; l4: Color; l5: Color }
  red: { l1: Color; l2: Color; l3: Color; l4: Color; l5: Color }
  pink: { l1: Color; l2: Color; l3: Color; l4: Color; l5: Color }
  orange: { l1: Color; l2: Color; l3: Color; l4: Color; l5: Color }
  peach: { l1: Color; l2: Color; l3: Color; l4: Color; l5: Color }
  yellow: { l1: Color; l2: Color; l3: Color; l4: Color; l5: Color }
  green: { l1: Color; l2: Color; l3: Color; l4: Color; l5: Color }
  teal: { l1: Color; l2: Color; l3: Color; l4: Color; l5: Color }
  indigo: { l1: Color; l2: Color; l3: Color; l4: Color; l5: Color }
  blue: { l1: Color; l2: Color; l3: Color; l4: Color; l5: Color }
  purple: { l1: Color; l2: Color; l3: Color; l4: Color; l5: Color }
}

export interface Scheme {
  palette: Palette
  syntax: {
    tag: Color
    func: Color
    entity: Color
    string: Color
    regexp: Color
    markup: Color
    keyword: Color
    special: Color
    comment: Color
    constant: Color
    operator: Color
  }
  terminal: {
    black: Color
    red: Color
    green: Color
    yellow: Color
    blue: Color
    magenta: Color
    cyan: Color
    white: Color
    brightBlack: Color
    brightRed: Color
    brightGreen: Color
    brightYellow: Color
    brightBlue: Color
    brightMagenta: Color
    brightCyan: Color
    brightWhite: Color
  }
  vcs: {
    added: Color
    modified: Color
    removed: Color
  }
  editor: {
    fg: Color
    bg: Color
    line: Color
    selection: {
      active: Color
      inactive: Color
    }
    findMatch: {
      active: Color
      inactive: Color
    }
    lineNumber: {
      active: Color
      normal: Color
    }
    indentGuide: {
      active: Color
      normal: Color
    }
  }
  ui: {
    fg: Color
    bg: Color
    line: Color
    selection: {
      active: Color
      normal: Color
    }
    panel: {
      bg: Color
      shadow: Color
    }
    popup: {
      bg: Color
      shadow: Color
    }
  }
  common: {
    accent: {
      tint: Color
      on: Color
    }
    error: Color
  }
}
