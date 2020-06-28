import color from './color'
const _ = color('F8F9FA')

const common = {
  accent: _('FFA033'),
  bg: _('FCFCFC'),
  fg: _('575F66'),
  ui: _('8A9199')
}

const syntax = {
  tag: _('55B4D4'),
  func: _('F2AE49'),
  entity: _('399EE6'),
  string: _('86B300'),
  regexp: _('4CBF99'),
  markup: _('F07171'),
  keyword: _('FA8D3E'),
  special: _('E6BA7E'),
  comment: _('787B80').alpha(.6),
  constant: _('A37ACC'),
  operator: _('ED9366'),
  error: _('E65050')
}

const vcs = {
  added: _('81CC5C'),
  modified: _('478ACC'),
  removed: _('FF7383')
}

const editor = {
  line: common.ui.alpha(.1),
  gutter: {
    active: common.ui.alpha(.8),
    normal: common.ui.alpha(.4)
  },
  selection: {
    active: _('035BD6').alpha(.15),
    inactive: _('035BD6').alpha(.07)
  },
  findMatch: {
    active: _('FFE666'),
    inactive: _('FFE666').alpha(.45)
  },
  indentGuide: {
    active: common.ui.alpha(.35),
    normal: common.ui.alpha(.18)
  }
}

const ui = {
  line: _('6B7D8F').alpha(.12),
  panel: {
    bg: common.bg.brighten(.1),
    shadow: common.fg.darken(.5).alpha(.25)
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
