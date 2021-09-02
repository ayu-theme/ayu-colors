import _ from './color'

const syntax = {
  tag: _`55B4D4`,
  func: _`F2AE49`,
  entity: _`399EE6`,
  string: _`86B300`,
  regexp: _`4CBF99`,
  markup: _`F07171`,
  keyword: _`FA8D3E`,
  special: _`E6BA7E`,
  comment: _`787B80`.alpha(.6),
  constant: _`A37ACC`,
  operator: _`ED9366`
}

const vcs = {
  added: _`6CBF43`,
  modified: _`478ACC`,
  removed: _`FF7383`
}

const editor = {
  fg: _`505559`,
  bg: _`FCFCFC`,
  line: _`8A9199`.alpha(.1),
  selection: {
    active: _`035BD6`.alpha(.15),
    inactive: _`035BD6`.alpha(.07)
  },
  findMatch: {
    active: _`ECD9FF`,
    inactive: _`ECD9FF`.alpha(.45)
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
  fg: _`8A9199`,
  bg: _`F8F9FA`,
  line: _`6B7D8F`.alpha(.12),
  selection: {
    active: _`56728F`.alpha(.12),
    normal: _`6B7D8F`.alpha(.12)
  },
  panel: {
    bg: _`F3F4F5`,
    shadow: _`000000`.alpha(.15)
  },
}

const common = {
  accent: _`FFAA33`,
  error: _`E65050`
}

export default {
  syntax,
  vcs,
  editor,
  ui,
  common
}
