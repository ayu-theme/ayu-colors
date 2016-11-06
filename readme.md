![ayu](http://i.imgur.com/b3etBQX.png)

> The colors of [@dempfi's](https://github.com/dempfi) beautiful [ayu color scheme](https://github.com/dempfi/ayu) extracted as a NPM package.

### Installation

```
npm install --save ayu
yarn add ayu
```

### Usage

```JS
import { dark, light, mirage } from 'ayu'

dark.ui.bg === '0F1419'
light.ui.fg === '828C99'
mirage.syntax.error === 'FF3333'
```

You can find the full colors at [dempfi/ayu/src/themes](https://github.com/dempfi/ayu/blob/master/src/themes).

### Updates

  - Major: A key gets deleted or a new key gets inserted
  - Minor: A key gets updated in all themes
  - Patch: A key gets updated in a single theme
