# ayu-colors

Color palette for the [ayu theme](https://github.com/ayu-theme/ayu) as an npm package.

## Scripts

- `npm run build` - Compile TypeScript to dist/
- `npm run svg` - Build + generate colors.svg and palette.svg
- `npm test` - Build + run tests
- `npm start` - Run svg + test

## Project Structure

- `src/color.ts` - Color class with hex(), rgb(), alpha() methods
- `src/colors.ts` - Exports dark, light, mirage schemes
- `src/dark.ts` - Dark theme colors
- `src/light.ts` - Light theme colors
- `src/mirage.ts` - Mirage theme colors
- `scripts/build-svg.js` - Generates preview SVGs

## Color Categories

Each scheme has: `syntax`, `vcs`, `editor`, `ui`, `common`

Colors use tagged template syntax: `` e`HEXCODE` `` where `e` is bound to editor background for alpha blending.

## Ports

- VS Code: https://github.com/ayu-theme/vscode-ayu
- Sublime: https://github.com/ayu-theme/ayu
