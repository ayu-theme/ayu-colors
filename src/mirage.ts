import color from './color'

const u = color('1F2430')
const e = color('242936')

const syntax = {
  tag: e`5CCFE6`,
  func: e`FFD173`,
  entity: e`73D0FF`,
  string: e`D5FF80`,
  regexp: e`95E6CB`,
  markup: e`F28779`,
  keyword: e`FFAD66`,
  special: e`FFDFB3`,
  comment: e`B8CFE6`.alpha(0.5),
  constant: e`DFBFFF`,
  operator: e`F29E74`
}

const vcs = {
  added: e`87D96C`,
  modified: e`80BFFF`,
  removed: e`F27983`
}

const editor = {
  fg: e`CCCAC2`,
  bg: e`242936`,
  line: e`1A1F29`,
  selection: {
    active: e`409FFF`.alpha(0.25),
    inactive: e`409FFF`.alpha(0.13)
  },
  findMatch: {
    active: e`695380`,
    inactive: e`695380`.alpha(0.4)
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
  fg: u`707A8C`,
  bg: u`1F2430`,
  line: u`171B24`,
  selection: {
    active: u`637599`.alpha(0.15),
    normal: u`69758C`.alpha(0.12)
  },
  panel: {
    bg: u`1C212B`,
    shadow: u`12151C`.alpha(0.7)
  }
}

const common = {
  accent: u`FFCC66`,
  error: u`FF6666`
}

export default {
  syntax,
  vcs,
  editor,
  ui,
  common
}
