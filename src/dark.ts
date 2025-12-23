import color from './color.js'

const u = color('0D1017')
const e = color('10141C')

const syntax = {
  /** HTML/XML tags, language variables, library classes, CSS properties */
  tag: e`39BAE6`,
  /** Function names, function calls, tag attributes, list bullets */
  func: e`FFB454`,
  /** Type names, class names, CSS tag names, markup links */
  entity: e`59C2FF`,
  /** String literals, imports/packages, markup headings */
  string: e`AAD94C`,
  /** Regular expressions, escape characters, blockquotes */
  regexp: e`95E6CB`,
  /** Member variables, library functions, markup italic/bold */
  markup: e`F07178`,
  /** Keywords, storage types, template expressions */
  keyword: e`FF8F40`,
  /** Decorators, annotations, markup strikethrough */
  special: e`E6C08A`,
  /** Code comments (typically rendered italic) */
  comment: e`99ADBF`.alpha(0.55),
  /** Named constants, function parameters */
  constant: e`D2A6FF`,
  /** Binary operators, accessor punctuation */
  operator: e`F29668`
}

const vcs = {
  /** New files/lines in version control */
  added: e`70BF56`,
  /** Changed files/lines in version control */
  modified: e`73B8FF`,
  /** Deleted files/lines in version control */
  removed: e`F26D78`
}

const editor = {
  /** Main editor text color */
  fg: e`BFBDB6`,
  /** Editor background */
  bg: e`10141C`,
  /** Current line highlight background */
  line: e`161A24`,
  selection: {
    /** Selection highlight when editor is focused */
    active: e`3388FF`.alpha(0.25),
    /** Selection highlight when editor is unfocused */
    inactive: e`80B5FF`.alpha(0.15)
  },
  findMatch: {
    /** Current search match highlight */
    active: e`4C4126`,
    /** Other search match highlights */
    inactive: e`4C4126`.alpha(0.5)
  },
  gutter: {
    /** Line number for current line */
    active: e`6C7380`.alpha(0.9),
    /** Line numbers for other lines */
    normal: e`6C7380`.alpha(0.6)
  },
  indentGuide: {
    /** Indent guide at current level */
    active: e`6C7380`.alpha(0.5),
    /** Indent guides at other levels */
    normal: e`6C7380`.alpha(0.2)
  }
}

const ui = {
  /** UI text (sidebars, panels, menus) */
  fg: u`555E73`,
  /** UI background areas */
  bg: u`0D1017`,
  /** Separator lines between UI sections */
  line: u`1B1F29`,
  selection: {
    /** Active/hovered UI item */
    active: u`475266`.alpha(0.25),
    /** Selected UI item */
    normal: u`475266`.alpha(0.2)
  },
  panel: {
    /** Panel backgrounds (explorer, debug) */
    bg: u`141821`,
    /** Drop shadows for panels */
    shadow: u`000000`.alpha(0.5)
  }
}

const common = {
  accent: {
    /** Primary accent color for highlights, caret, focus states */
    tint: u`E6B450`,
    /** Content color on accent backgrounds */
    on: u`805600`
  },
  /** Error messages and error states */
  error: u`D95757`
}

export default {
  syntax,
  vcs,
  editor,
  ui,
  common
}
