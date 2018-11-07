import color from './color'
const _ = color('0A0E14')

const common = {
  accent: _('E6B450'),
  bg: _('0A0E14'),
  fg: _('B3B1AD'),
  ui: _('3D424D')
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
  error: _('FF3333')
}

const vcs = {
  added: _('91B362'),
  modified: _('6994BF'),
  removed: _('D96C75')
}

const ui = {
  line: common.bg.darken(.13),
  panel: {
    bg: common.bg.brighten(.05),
    shadow: common.bg.darken(.2),
    border: common.bg.darken(.8)
  },
  gutter: {
    normal: common.ui.alpha(.6),
    active: common.ui.alpha(.9)
  },
  selection: {
    bg: vcs.modified.fade(.87),
    inactive: vcs.modified.fade(.92),
    border: vcs.modified.fade(.8)
  },
  guide: {
    normal: common.ui.alpha(.4),
    active: common.ui.alpha(.7)
  }
}

export default {
  common,
  syntax,
  ui,
  vcs
}
