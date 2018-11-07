import color from './color'
const _ = color('1F2430')

const common = {
  accent: _('FFCC66'),
  bg: _('1F2430'),
  fg: _('CBCCC6'),
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
  error: _('FF3333')
}

const vcs = {
  added: _('A6CC70'),
  modified: _('77A8D9'),
  removed: _('F27983')
}

const ui = {
  line: common.bg.darken(.15),
  panel: {
    bg: common.bg.brighten(.1),
    shadow: common.bg.darken(.3),
    border: common.bg.darken(.4)
  },
  gutter: {
    normal: common.ui.alpha(.4),
    active: common.ui.alpha(.8)
  },
  selection: {
    bg: vcs.modified.fade(.87),
    inactive: vcs.modified.fade(.92),
    border: vcs.modified.fade(.8)
  },
  guide: {
    active: common.ui.alpha(.7),
    normal: common.ui.alpha(.3)
  }
}

export default {
  common,
  syntax,
  ui,
  vcs
}
