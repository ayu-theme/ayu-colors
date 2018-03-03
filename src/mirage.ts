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
const _ = color('212733')

const common = {
  accent: _`FFCC66`,
  bg: _`212733`,
  fg: _`CCC9C2`,
  ui: _`667380`
}

const syntax = {
  tag: _`5CCFE6`,
  func: _`FFD580`,
  entity: _`73D0FF`,
  string: _`BAE67E`,
  regexp: _`95E6CB`,
  markup: _`F28779`,
  keyword: _`FFA759`,
  special: _`FFC44C`,
  comment: _`5C6773`,
  constant: _`D4BFFF`,
  operator: _`F29E74`,
  error: _`FF3333`
}

const ui = {
  panel: {
    bg: common.ui.fade(7),
    shadow: common.bg.darken(30),
    border: common.bg.darken(40),
    row: common.bg.darken(5)
  },
  icon: common.ui.fade(55),
  scrollbar: { puck: _`FFFFFF` },
  separator: common.bg.darken(20),
  minimap: common.ui,
  opacity: 1.0
}

const editor = {
  line: common.bg.darken(14),
  gutter: common.ui.fade(35),
  selection: {
    bg: syntax.entity.fade(10),
    inactive: syntax.entity.fade(8),
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
