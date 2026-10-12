# @lindaui/tokens

Brand design tokens (OKLCH, light + dark) + HeroUI v3 + Tailwind v4, compiled
into a single CSS bundle. No JS — this package is just the stylesheet that makes
`@lindaui/ui` and `@lindaui/blocks` render correctly.

## Usage

Import once at your app root:

```tsx
import "@lindaui/tokens/css";
```

That single import ships HeroUI's styles, the brand tokens, and the Tailwind
utilities the component library uses (flex/gap/max-w + bespoke ones).

## Dark mode

Toggle a `.dark` class on an ancestor (e.g. `<html class="dark">`). The dark
palette redefines the canonical tokens; HeroUI's variables reference them, so
components re-skin for free.

## HeroUI defaults and LeadConverter

These style entries and the migration utility layer first ship in tokens
**0.4.0**, required by UI/blocks 0.5.0. They are not in published tokens 0.3.1.

The default `/css` and `/theme.css` teal theme remains unchanged. To preserve
HeroUI defaults rather than inherit that theme, choose a separate source entry:

```css
/* globals.css — your application runs Tailwind v4 */
@import "tailwindcss";
@import "@lindaui/tokens/lead-converter.css";
@source "../node_modules/@lindaui/ui/dist";
@source "../node_modules/@lindaui/ui/src";
@source "../node_modules/@lindaui/blocks/dist";
@source "../node_modules/@lindaui/blocks/src";
@source "./";
```

Adjust these relative `@source` paths to your stylesheet location. Installed
tarballs include both `dist` and public source; app scanning keeps dynamic
composition classes available. Import this instead of `@heroui/styles` and
never alongside `/css`: it includes HeroUI defaults, the original violet
light/dark accents, field borders, notice CTA states and scrollbar styles.
It does not change the root font size or import teal canonical variables.

`@lindaui/tokens/heroui.css` provides only upstream styles for custom native
HeroUI themes. Without a Tailwind pipeline, import
`@lindaui/tokens/lead-converter/compiled.css` once instead; it already contains
Tailwind, HeroUI, the violet theme and the library's utilities. Do not combine
source and compiled entries, which would duplicate layers.

## Custom theme (per project)

Every consumer can ship its own brand without rebuilding this package or touching
any component. The whole design system is driven by CSS custom properties read at
runtime, so theming = overriding a small set of **canonical** variables.

Copy the template, fill it with your brand, and import it **after** the base:

```tsx
import "@lindaui/tokens/css";   // HeroUI + utilities + default (teal) theme
import "./theme.css";            // your brand — overrides the canonical vars
```

The template lists every overridable variable (for `:root` and `.dark`) with the
defaults as a starting point:

```bash
# the template ships in the package:
node -e "console.log(require.resolve('@lindaui/tokens/theme-template.css'))"
```

Only override the **canonical** vars (`--primary`, `--card`, `--secondary`,
`--destructive`, `--ring`, `--radius`, `--chart-1..5`, ...). Do NOT touch the
HeroUI vars (`--accent`/`--surface`/`--default`/`--danger`/...) or the utility
vars (`--color-*`) — they reference the canonical ones and update automatically.
Soft variants (`--accent-soft`, `--danger-soft`, ...) are derived from `--primary`
/`--destructive` via `color-mix`, so they follow your brand for free.

### Runtime-switchable themes

For multiple themes in one app, switchable without reload (on top of dark/light),
scope each theme under a selector instead of `:root` — the matrix is theme × mode:

```css
[data-theme="ocean"]      { --primary: oklch(0.55 0.13 240); --ring: oklch(0.55 0.13 240); /* ... */ }
[data-theme="ocean"].dark { --primary: oklch(0.78 0.12 240); /* ... */ }
```

```js
document.documentElement.dataset.theme = "ocean";       // switch theme
document.documentElement.classList.toggle("dark");      // switch mode
```

The template's bottom section documents this pattern in full.

## Local build

```bash
pnpm --filter @lindaui/tokens build
```

Regenerates `dist/index.css` and `dist/lead-converter.css`. The build chains `@import "tailwindcss"` +
`@source` scans of `@lindaui/ui` / `@lindaui/blocks` source + `@heroui/styles` + the
brand `theme.css`, run through `@tailwindcss/cli` (Tailwind v4).
The token task also hashes UI/blocks source because their class changes must
invalidate compiled CSS even when no token values change.
Independent builds can run concurrently: each invocation compiles to unique
temporary files, validates its complete CSS snapshot, and atomically replaces
the public output. Cleanup never touches another invocation's files.
Regression check: `node --test scripts/tokens-concurrent-build.test.mjs` from
the repository root. It runs two builders together and checks output bytes and
markers continuously; watch mode publishes only after completed compilations.

## License

MIT

## Agent integration skill

For UI implementation, use the portable `lindaui` Agent Skill from
https://github.com/francocarballar/lindaui/tree/main/skills/lindaui .
Install with `npx skills add francocarballar/lindaui --skill lindaui`.
Its Node CLI supports Windows, macOS and Linux and reads the consumer-installed
API: doctor, api, setup, theme, scaffold, activate and check. Mutation commands
produce plans by default. Use activate when adopting LindaUI for all UI tasks.
Always prefer this installed package's exports, types and llms.txt over newer
unpublished GitHub APIs. See the skill for setup, recipes and verification.

CSS entries include a `types` condition pointing to the shipped `src/style.d.ts`.
Strict TypeScript `noUncheckedSideEffectImports` resolves the extensionless
`@lindaui/tokens/css` import without a consumer ambient declaration. Runtime
CSS targets remain unchanged; import styles once at the application root.
