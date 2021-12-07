import color from './color'

const u = color('F8F9FA')
const e = color('FCFCFC')

const syntax = {
  tag: e`55B4D4`,
  func: e`F2AE49`,
  entity: e`22A4E6`,
  string: e`86B300`,
  regexp: e`4CBF99`,
  markup: e`F07171`,
  keyword: e`FA8D3E`,
  special: e`E6B673`,
  comment: e`787B80`.alpha(0.6),
  constant: e`A37ACC`,
  operator: e`ED9366`
}

const vcs = {
  added: e`6CBF43`,
  modified: e`478ACC`,
  removed: e`FF7383`
}

const editor = {
  fg: e`5C6166`,
  bg: e`FCFCFC`,
  line: e`8A9199`.alpha(0.1),
  selection: {
    active: e`036DD6`.alpha(0.15),
    inactive: e`5696D6`.alpha(0.1)
  },
  findMatch: {
    active: e`ECD9FF`,
    inactive: e`ECD9FF`.alpha(0.45)
  },
  gutter: {
    active: e`8A9199`.alpha(0.8),
    normal: e`8A9199`.alpha(0.4)
  },
  indentGuide: {
    active: e`8A9199`.alpha(0.35),
    normal: e`8A9199`.alpha(0.18)
  }
}

const ui = {
  fg: u`8A9199`,
  bg: u`F8F9FA`,
  line: u`6B7D8F`.alpha(0.1),
  selection: {
    active: u`56728F`.alpha(0.12),
    normal: u`6B7D8F`.alpha(0.12)
  },
  popup: {
    bg: u`FFFFFF`,
    shadow: u`000000`.alpha(0.08)
  }
}

const common = {
  accent: u`FFAA33`,
  accentFg: u`804A00`,
  error: u`E65050`
}

export default {
  syntax,
  vcs,
  editor,
  ui,
  common
}
