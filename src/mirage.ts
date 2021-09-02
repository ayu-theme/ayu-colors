import _ from './color'

const syntax = {
  tag: _`5CCFE6`,
  func: _`FFD173`,
  entity: _`73D0FF`,
  string: _`D5FF80`,
  regexp: _`95E6CB`,
  markup: _`F28779`,
  keyword: _`FFAD66`,
  special: _`FFE6B3`,
  comment: _`B8CFE6`.alpha(.5),
  constant: _`D4BFFF`,
  operator: _`F29E74`
}

const vcs = {
  added: _`87D96C`,
  modified: _`80BFFF`,
  removed: _`F27983`
}

const editor = {
  fg: _`CCCAC2`,
  bg: _`242936`,
  line: _`1A1F29`,
  selection: {
    active: _`409FFF`.alpha(.25),
    inactive: _`409FFF`.alpha(.13)
  },
  findMatch: {
    active: _`695380`,
    inactive: _`695380`.alpha(.4)
  },
  gutter: {
    active: _`8A9199`.alpha(.8),
    normal: _`8A9199`.alpha(.4)
  },
  indentGuide: {
    active: _`8A9199`.alpha(.35),
    normal: _`8A9199`.alpha(.18)
  }
}

const ui = {
  fg: _`707A8C`,
  bg: _`1F2430`,
  line: _`171B24`,
  selection: {
    active: _`637599`.alpha(.15),
    normal: _`69758C`.alpha(.12)
  },
  panel: {
    bg: _`1C212B`,
    shadow: _`12151C`.alpha(.7)
  },
}

const common = {
  accent: _`FFCC66`,
  error: _`FF6666`
}

export default {
  syntax,
  vcs,
  editor,
  ui,
  common
}
