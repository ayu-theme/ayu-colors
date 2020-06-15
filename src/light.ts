import color from './color'
const _ = color('F8F9FA')

const common = {
  accent: _('FF9940'),
  bg: _('FAFAFA'),
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
  comment: _('ABB0B6'),
  constant: _('A37ACC'),
  operator: _('ED9366'),
  error: _('F51818')
}

const vcs = {
  added: _('99BF4D'),
  modified: _('709ECC'),
  removed: _('F27983')
}

const ui = {
  line: common.ui.alpha(.1),
  panel: {
    bg: common.bg.brighten(.1),
    shadow: common.fg.darken(.5).alpha(.25),
    border: common.bg.darken(.2)
  },
  gutter: {
    normal: common.ui.alpha(.4),
    active: common.ui.alpha(.8)
  },
  selection: {
    bg: _('2EA8E6').fade(.7),
    inactive: _('000000').fade(.87),
    border: _('000000').fade(.82),
  },
  guide: {
    active: common.ui.alpha(.35),
    normal: common.ui.alpha(.18)
  }
}

export default {
  common,
  syntax,
  ui,
  vcs
}
