import color from './color'
const _ = color('0A0E14')

const common = {
  accent: _('E6B450'),
  bg: _('0A0E14'),
  fg: _('B3B1AD'),
  ui: _('4D5566')
}

const syntax = {
  tag: _('39BAE6'),
  func: _('FFB454'),
  entity: _('59C2FF'),
  string: _('C2D94C'),
  regexp: _('95E6CB'),
  markup: _('F07178'),
  keyword: _('FF8F40'),
  special: _('E6B673'),
  comment: _('626A73'),
  constant: _('FFEE99'),
  operator: _('F29668'),
  error: _('F24949')
}

const vcs = {
  added: _('99CC66'),
  modified: _('6994BF'),
  removed: _('D96C75')
}

const editor = {
  line: common.bg.darken(.2),
  gutter: {
    active: common.ui.alpha(.9),
    normal: common.ui.alpha(.6)
  },
  selection: {
    active: vcs.modified.fade(.87),
    inactive: vcs.modified.fade(.94)
  },
  findMatch: {
    active: _('FFC34D'),
    inactive: _('FFE666').alpha(.4)
  },
  indentGuide: {
    normal: common.ui.alpha(.4),
    active: common.ui.alpha(.7)
  }
}

const ui = {
  line: common.bg.darken(.2),
  panel: {
    bg: common.bg.brighten(.05),
    shadow: common.bg.darken(.2)
  },
  selection: {
    active: _('2EA8E6').fade(.7),
    normal: _('000000').fade(.87)
  }
}

export default {
  common,
  syntax,
  editor,
  ui,
  vcs
}
