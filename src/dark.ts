import color from './color'
const _ = color('0F1419')

const common = {
  accent: _('F29718'),
  bg: _('0D131A'),
  fg: _('BFBAB0'),
  ui: _('475059')
}

const syntax = {
  tag: _('39BAE6'),
  func: _('FFB454'),
  entity: _('59C2FF'),
  string: _('C2D94C'),
  regexp: _('95E6CB'),
  markup: _('F07178'),
  keyword: _('FF7733'),
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
    bg: common.bg.brighten(.1),
    shadow: common.bg.darken(.2),
    border: common.bg.darken(.8)
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
