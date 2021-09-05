import color from './color'

const u = color('0B0E14')
const e = color('0D1017')

const syntax = {
  tag: e`39BAE6`,
  func: e`FFB454`,
  entity: e`59C2FF`,
  string: e`AAD94C`,
  regexp: e`95E6CB`,
  markup: e`F07178`,
  keyword: e`FF8F40`,
  special: e`E6B673`,
  comment: e`ACB6BF`.alpha(0.55),
  constant: e`D2A6FF`,
  operator: e`F29668`
}

const vcs = {
  added: e`7FD962`,
  modified: e`73B8FF`,
  removed: e`F26D78`
}

const editor = {
  fg: e`BFBDB6`,
  bg: e`0D1017`,
  line: e`131721`,
  selection: {
    active: e`409FFF`.alpha(0.3),
    inactive: e`409FFF`.alpha(0.13)
  },
  findMatch: {
    active: e`6C5980`,
    inactive: e`6C5980`.alpha(0.4)
  },
  gutter: {
    active: e`6C7380`.alpha(0.9),
    normal: e`6C7380`.alpha(0.6)
  },
  indentGuide: {
    active: e`6C7380`.alpha(0.5),
    normal: e`6C7380`.alpha(0.2)
  }
}

const ui = {
  fg: u`565B66`,
  bg: u`0B0E14`,
  line: u`11151C`,
  selection: {
    active: u`475266`.alpha(0.25),
    normal: u`475266`.alpha(0.2)
  },
  panel: {
    bg: u`0F131A`,
    shadow: u`000000`.alpha(0.5)
  }
}

const common = {
  accent: u`E6B450`,
  error: u`D95757`
}

export default {
  syntax,
  vcs,
  editor,
  ui,
  common
}
