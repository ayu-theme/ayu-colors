import color from './color'
const _ = color('0A0E14')

const common = {
  accent: _('E6B450'),
  bg: _('0A0E14'),
  fg: _('BFBDB6'),
  ui: _('626773')
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
  comment: _('ACB6BF').alpha(.55),
  constant: _('C3A6FF'),
  operator: _('F29668'),
  error: _('D95757')
}

const vcs = {
  added: _('99CC66'),
  modified: _('6994BF'),
  removed: _('D96C75')
}

const editor = {
  line: common.bg.darken(.1),
  gutter: {
    active: common.ui.alpha(.9),
    normal: common.ui.alpha(.6)
  },
  selection: {
    active: _('409FFF').alpha(.3),
    inactive: _('409FFF').alpha(.13)
  },
  findMatch: {
    active: _('806A00'),
    inactive: _('806A00').alpha(.4)
  },
  indentGuide: {
    normal: common.ui.alpha(.4),
    active: common.ui.alpha(.7)
  }
}

const ui = {
  line: common.bg.darken(.3),
  panel: {
    bg: common.bg.brighten(.05),
    shadow: common.bg.darken(.2)
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
