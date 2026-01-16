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
  /** Syntax highlighting colors */
  syntax: {
    /** HTML/XML tags, CSS selectors */
    tag: Color
    /** Function names and calls */
    func: Color
    /** Class names, types, modules */
    entity: Color
    /** String literals */
    string: Color
    /** Regular expressions */
    regexp: Color
    /** Markup elements (bold, italic, headings) */
    markup: Color
    /** Language keywords (if, else, return) */
    keyword: Color
    /** Special values (this, self, super) */
    special: Color
    /** Code comments */
    comment: Color
    /** Constants and numbers */
    constant: Color
    /** Operators (+, -, =, etc.) */
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
  surface: {
    sunk: Color
    base: Color
    lift: Color
    over: Color
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
