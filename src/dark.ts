import color from './color'

const u = color('0D1017')
const e = color('10141C')

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
  bg: e`10141C`,
  line: e`161A24`,
  selection: {
    active: e`3388FF`.alpha(0.25),
    inactive: e`80B5FF`.alpha(0.15)
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
    normal: e`6C7380`.alpha(0.3)
  }
}

const ui = {
  fg: u`565B66`,
  bg: u`0D1017`,
  line: u`1B1F29`,
  selection: {
    active: u`475266`.alpha(0.25),
    normal: u`475266`.alpha(0.2)
  },
  popup: {
    bg: u`141821`,
    shadow: u`000000`.alpha(0.6)
  }
}

const common = {
  accent: u`E6B450`,
  accentFg: u`734D00`,
  error: u`D95757`
}

export default {
  syntax,
  vcs,
  editor,
  ui,
  common
}
