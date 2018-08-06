/**
 * MIT License
 *
 * Copyright (c) 2016 Ike Ku
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */


import color, { Color } from './color'
const _ = color('0F1419')

const common = {
  accent: _`F29718`,
  bg: _`0F1419`,
  fg: _`BFBAB0`,
  ui: _`475259`
}

const syntax = {
  tag: _`39BAE6`,
  func: _`FFB454`,
  entity: _`59C2FF`,
  string: _`C2D94C`,
  regexp: _`95E6CB`,
  markup: _`F07178`,
  keyword: _`FF7733`,
  special: _`E6B673`,
  comment: _`5C6773`,
  constant: _`FFEE99`,
  operator: _`F29668`,
  error: _`FF3333`
}

const ui = {
  panel: {
    bg: common.ui.fade(7),
    shadow: common.bg.darken(30),
    border: common.bg.darken(80),
    row: common.bg.darken(20)
  },
  icon: common.ui.fade(55),
  scrollbar: { puck: _`FFFFFF` },
  separator: common.bg.darken(36),
  minimap: common.fg.darken(50),
  opacity: 1.0
}

const editor = {
  line: common.bg.darken(30),
  gutter: common.ui.fade(40),
  selection: {
    bg: syntax.entity.fade(9),
    inactive: syntax.entity.fade(6),
    border: syntax.entity.fade(13)
  },
  guide: {
    stack: common.ui.fade(30),
    active: common.ui.fade(70),
    normal: common.ui.fade(30)
  },
}

export default {
  common,
  syntax,
  ui,
  editor
}
