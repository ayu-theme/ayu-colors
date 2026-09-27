# ayu-colors

The ayu palette as an npm package (`ayu`). It is the single source of colors for every ayu port, so the Light, Mirage and Dark schemes defined here are what the VS Code theme, the Sublime theme and third-party tools all build on. It also owns the file icon set used by the ports.

## Source of truth

The `themes/` YAML files are the only place colors are defined. Everything under `src/generated/`, `src/scheme.d.ts` and `dist/` is derived from them by the build. Edit the YAML, never the output.

- The three schemes must keep an identical shape. Consumers access colors by path (`dark.editor.bg`) across all variants, and the tests fail when a key exists in one scheme but not the others. Add every key to all three files.
- Comments in the YAML are part of the content. The designer and the generated types carry them through, so they describe what a color is for.
- `themes/icons.yaml` maps icon IDs to image files in `icons/`, and file extensions and file names to icon IDs. Ports copy both, so a new file icon is added here, never in a port.

## YAML color syntax

A value is a hex color or a reference, followed by optional space-separated modifiers.

- `F07178`: a hex color (6 or 8 digits).
- `$syntax.markup`, `$palette.orange.l3`: a reference to another color by path. Circular references are an error.
- The `palette` section generates `l1`…`l5` lightness steps per hue across the `range` of OKLCH lightness. A hue can override its range with `R<min>:<max>`.

Modifiers are applied left to right. Without a sign they set a value; with `+` or `-` they shift it.

| Modifier | Meaning |
|---|---|
| `A0.25` | alpha |
| `L0.6`, `-L0.1` | OKLCH lightness, 0–1 |
| `C0.5`, `+C0.1` | chroma relative to the most saturated in-gamut color at that lightness and hue, 0–1 |

Because chroma is relative, a color keeps its saturation character when its lightness moves.

## Commands

- `npm run build`: generate from YAML, compile to `dist/`.
- `npm test`: build, then check scheme shape and YAML parsing.
- `npm run designer`: the visual color editor (Next.js, in `designer/`).
- `npx tsx scripts/build-svg.ts`: regenerate the `colors.svg` and `palette.svg` previews shown in the README. It embeds the Iosevka web font from the ayu website checkout, which must be at `~/Developer/site`.

## Designer

The designer edits the YAML directly: saving rewrites the theme file with its comments and formatting preserved, then runs the build. That means a checked-out port consuming this repo through a `file:` dependency picks up the change on its next build.

Its state lives in a single Zustand store. Switching themes clears the selection to prevent stale state. Toggling a modifier off and on restores its previous value.

## Consumers

The VS Code port ([vscode-ayu](https://github.com/ayu-theme/vscode-ayu)) depends on this repo as a sibling checkout (`file:../ayu-colors`) during development and copies `icons/` at build time. Renaming or removing a scheme key or an icon ID breaks it and any other port, so it is a breaking change for the published package.

## Tooling constraints

- TypeScript stays on 6.x. TypeScript 7 ships only the native compiler, which Next.js cannot load. Next then tries to install TypeScript by itself with yarn, leaving a `yarn.lock` behind.
- Scripts run through `tsx`. The package is ESM and compiled with `NodeNext` resolution, so imports inside `src/` use `.js` specifiers.
