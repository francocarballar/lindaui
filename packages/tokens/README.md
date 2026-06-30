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

Regenerates `dist/index.css`. The build chains `@import "tailwindcss"` +
`@source` scans of `@lindaui/ui` / `@lindaui/blocks` source + `@heroui/styles` + the
brand `theme.css`, run through `@tailwindcss/cli` (Tailwind v4).

## License

MIT
