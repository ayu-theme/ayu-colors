import _ from './color'

const syntax = {
  tag: _`39BAE6`,
  func: _`FFB454`,
  entity: _`59C2FF`,
  string: _`AAD94C`,
  regexp: _`95E6CB`,
  markup: _`F07178`,
  keyword: _`FF8F40`,
  special: _`E6B673`,
  comment: _`ACB6BF`.alpha(.55),
  constant: _`C3A6FF`,
  operator: _`F29668`
}

const vcs = {
  added: _`7FD962`,
  modified: _`73B8FF`,
  removed: _`F26D78`
}

const editor = {
  fg: _`BFBDB6`,
  bg: _`0D1017`,
  line: _`131721`,
  selection: {
    active: _`409FFF`.alpha(.3),
    inactive: _`409FFF`.alpha(.13)
  },
  findMatch: {
    active: _`6C5980`,
    inactive: _`6C5980`.alpha(.4)
  },
  gutter: {
    active: _`6C7380`.alpha(.9),
    normal: _`6C7380`.alpha(.6)
  },
  indentGuide: {
    active: _`6C7380`.alpha(.5),
    normal: _`6C7380`.alpha(.2)
  }
}

const ui = {
  fg: _`565B66`,
  bg: _`0B0E14`,
  line: _`11151C`,
  selection: {
    active: _`475266`.alpha(.25),
    normal: _`475266`.alpha(.2)
  },
  panel: {
    bg: _`0F131A`,
    shadow: _`000000`.alpha(.5)
  },
}

const common = {
  accent: _`E6B450`,
  error: _`D95757`
}

export default {
  syntax,
  vcs,
  editor,
  ui,
  common
}
