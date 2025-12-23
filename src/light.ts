import color from './color.js'

const u = color('F8F9FA')
const e = color('FCFCFC')

const syntax = {
  /** HTML/XML tags, language variables, library classes, CSS properties */
  tag: e`55B4D4`,
  /** Function names, function calls, tag attributes, list bullets */
  func: e`F2A300`,
  /** Type names, class names, CSS tag names, markup links */
  entity: e`399EE6`,
  /** String literals, imports/packages, markup headings */
  string: e`86B300`,
  /** Regular expressions, escape characters, blockquotes */
  regexp: e`4CBF99`,
  /** Member variables, library functions, markup italic/bold */
  markup: e`F07171`,
  /** Keywords, storage types, template expressions */
  keyword: e`FF7E33`,
  /** Decorators, annotations, markup strikethrough */
  special: e`D9B077`,
  /** Code comments (typically rendered italic) */
  comment: e`787B80`.alpha(0.6),
  /** Named constants, function parameters */
  constant: e`A37ACC`,
  /** Binary operators, accessor punctuation */
  operator: e`ED9366`
}

const vcs = {
  /** New files/lines in version control */
  added: e`6CBF43`,
  /** Changed files/lines in version control */
  modified: e`478ACC`,
  /** Deleted files/lines in version control */
  removed: e`FF7383`
}

const editor = {
  /** Main editor text color */
  fg: e`5C6166`,
  /** Editor background */
  bg: e`FCFCFC`,
  /** Current line highlight background */
  line: e`828E9F`.alpha(0.1),
  selection: {
    /** Selection highlight when editor is focused */
    active: e`035BD6`.alpha(0.15),
    /** Selection highlight when editor is unfocused */
    inactive: e`035BD6`.alpha(0.07)
  },
  findMatch: {
    /** Current search match highlight */
    active: e`FFE294`.alpha(1),
    /** Other search match highlights */
    inactive: e`FFE294`.alpha(0.5)
  },
  gutter: {
    /** Line number for current line */
    active: e`828E9F`.alpha(0.8),
    /** Line numbers for other lines */
    normal: e`828E9F`.alpha(0.4)
  },
  indentGuide: {
    /** Indent guide at current level */
    active: e`828E9F`.alpha(0.35),
    /** Indent guides at other levels */
    normal: e`828E9F`.alpha(0.18)
  }
}

const ui = {
  /** UI text (sidebars, panels, menus) */
  fg: u`828E9F`,
  /** UI background areas */
  bg: u`F8F9FA`,
  /** Separator lines between UI sections */
  line: u`6B7D8F`.alpha(0.12),
  selection: {
    /** Active/hovered UI item */
    active: u`56728F`.alpha(0.12),
    /** Selected UI item */
    normal: u`6B7D8F`.alpha(0.12)
  },
  panel: {
    /** Panel backgrounds (explorer, debug) */
    bg: u`FAFAFA`,
    /** Drop shadows for panels */
    shadow: u`6B7D8F`.alpha(0.07)
  }
}

const common = {
  accent: {
    /** Primary accent color for highlights, caret, focus states */
    tint: u`F29718`,
    /** Content color on accent backgrounds */
    on: u`804B00`
  },
  /** Error messages and error states */
  error: u`E65050`
}

export default {
  syntax,
  vcs,
  editor,
  ui,
  common
}
