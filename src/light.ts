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
const _ = color('FAFAFA')

const common = {
  accent: _`FF8F40`,
  bg: _`FAFAFA`,
  fg: _`61676C`,
  ui: _`9DA2A6`
}

const syntax = {
  tag: _`55B4D4`,
  func: _`F29718`,
  entity: _`399EE6`,
  string: _`86B300`,
  regexp: _`4CBF99`,
  markup: _`F07171`,
  keyword: _`FA6E32`,
  special: _`E6B673`,
  comment: _`ABB0B6`,
  constant: _`A37ACC`,
  operator: _`ED9366`,
  error: _`F51818`
}

const ui = {
  panel: {
    bg: _`FFFFFF`,
    shadow: common.bg.darken(20),
    border: common.bg.darken(20),
    row: common.bg.darken(2)
  },
  icon: common.ui.fade(60),
  scrollbar: { puck: _`000000` },
  separator: common.bg.darken(5),
  minimap: common.ui,
  opacity: 1
}

const editor = {
  line: common.bg.darken(3),
  gutter: common.ui.fade(35),
  selection: {
    bg: syntax.entity.fade(9),
    inactive: syntax.entity.fade(7),
    border: syntax.entity.fade(12)
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
