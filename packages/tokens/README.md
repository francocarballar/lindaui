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

## Local build

```bash
pnpm --filter @lindaui/tokens build
```

Regenerates `dist/index.css`. The build chains `@import "tailwindcss"` +
`@source` scans of `@lindaui/ui` / `@lindaui/blocks` source + `@heroui/styles` + the
brand `theme.css`, run through `@tailwindcss/cli` (Tailwind v4).

## License

MIT
