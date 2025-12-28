# ayu-colors

Color palette for the [ayu theme](https://github.com/ayu-theme/ayu) as an npm package.

## Scripts

- `npm run build` - Compile TypeScript to dist/
- `npm run svg` - Build + generate colors.svg and palette.svg
- `npm test` - Build + run tests
- `npm start` - Run svg + test
- `npm run designer` - Run the color designer app

## Project Structure

- `src/color.ts` - Color class with hex(), rgb(), alpha() methods
- `src/colors.ts` - Exports dark, light, mirage schemes
- `src/dark.ts` - Dark theme colors
- `src/light.ts` - Light theme colors
- `src/mirage.ts` - Mirage theme colors
- `scripts/build-svg.ts` - Generates preview SVGs

## Color Categories

Each scheme has: `syntax`, `vcs`, `editor`, `ui`, `common`

Colors use tagged template syntax: `` e`HEXCODE` `` where `e` is bound to editor background for alpha blending.

## Designer App

The `designer/` directory contains a Next.js app for visually editing theme colors.

### State Management

Uses Zustand for centralized state management:

- `store/designerStore.ts` - Single store with all state and actions
- `store/selectors.ts` - Memoized hooks for derived values (useCurrentTheme, useThemeColors, etc.)
- `store/index.ts` - Public exports

Key patterns:

- All state lives in the Zustand store (activeTheme, themesData, selected, etc.)
- Selectors use `useMemo`/`useCallback` for memoization
- Switching themes clears the selection to prevent stale state
- Modifier values (alpha, lightness, chroma) are remembered when toggled off/on

### Designer Structure

- `app/page.tsx` - Main page, initializes store and renders panels
- `components/colors/` - Color list and row components
- `components/color/` - Color editor, modifier editor, reference picker
- `components/palette/` - Palette section and row components
- `hooks/useColors.tsx` - ThemeColorsProvider context for UI styling

## Ports

- VS Code: <https://github.com/ayu-theme/vscode-ayu>
- Sublime: <https://github.com/ayu-theme/ayu>
