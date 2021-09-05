import color from './color'

const u = color('F8F9FA')
const e = color('FCFCFC')

const syntax = {
  tag: e`55B4D4`,
  func: e`F2AE49`,
  entity: e`399EE6`,
  string: e`86B300`,
  regexp: e`4CBF99`,
  markup: e`F07171`,
  keyword: e`FA8D3E`,
  special: e`E6BA7E`,
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
    active: e`035BD6`.alpha(0.15),
    inactive: e`035BD6`.alpha(0.07)
  },
  findMatch: {
    active: e`9F40FF`.alpha(0.17),
    inactive: e`9F40FF`.alpha(0.8)
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
  line: u`6B7D8F`.alpha(0.12),
  selection: {
    active: u`56728F`.alpha(0.12),
    normal: u`6B7D8F`.alpha(0.12)
  },
  panel: {
    bg: u`F3F4F5`,
    shadow: u`000000`.alpha(0.15)
  }
}

const common = {
  accent: u`FFAA33`,
  error: u`E65050`
}

export default {
  syntax,
  vcs,
  editor,
  ui,
  common
}
