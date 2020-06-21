import color from './color'
const _ = color('1F2430')

const common = {
  accent: _('FFCC66'),
  bg: _('1F2430'),
  fg: _('D9D5D2'),
  ui: _('707A8C')
}

const syntax = {
  tag: _('5CCFE6'),
  func: _('FFD580'),
  entity: _('73D0FF'),
  string: _('BAE67E'),
  regexp: _('95E6CB'),
  markup: _('F28779'),
  keyword: _('FFA759'),
  special: _('FFE6B3'),
  comment: _('5C6773'),
  constant: _('D4BFFF'),
  operator: _('F29E74'),
  error: _('FF6666')
}

const vcs = {
  added: _('87D96C'),
  modified: _('5CA1E6'),
  removed: _('F27983')
}

const editor = {
  line: common.bg.darken(.15),
  gutter: {
    active: common.ui.alpha(.8),
    normal: common.ui.alpha(.4)
  },
  selection: {
    active: _('3388FF').alpha(.25),
    inactive: _('3388FF').alpha(.13)
  },
  indentGuide: {
    active: common.ui.alpha(.7),
    normal: common.ui.alpha(.3)
  }
}

const ui = {
  line: common.bg.darken(.2),
  panel: {
    bg: common.bg.brighten(.1),
    shadow: common.bg.darken(.3)
  },
  selection: {
    active: editor.selection.active,
    normal: common.ui.alpha(.1)
  }
}

export default {
  common,
  syntax,
  editor,
  ui,
  vcs
}
