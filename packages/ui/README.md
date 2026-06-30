# @lindaui/ui

React 19 design-system components wrapping **HeroUI v3** (react-aria-components)
behind stable, per-component entry points. The public API is intentionally its
own where there's an ergonomic wrapper — it does not leak HeroUI's RAC
composition or types in those places.

## Install

```bash
pnpm add @lindaui/ui @lindaui/tokens
```

Peer dependencies (you provide them): `react >=19`, `react-dom >=19`,
`react-hook-form >=7`. `@lindaui/tokens` is a peer too — it ships the CSS.

## Setup the styles (once)

Import the token bundle once at your app root. It renders HeroUI + brand tokens
+ the Tailwind utilities the library uses:

```tsx
import "@lindaui/tokens/css";
```

Dark mode: toggle a `.dark` class on an ancestor element.

## Usage

Import per entry point — one component per import path:

```tsx
import { Button } from "@lindaui/ui/button";
import { Select } from "@lindaui/ui/select";
import { Dialog } from "@lindaui/ui/dialog";

export function Example() {
  return <Button variant="primary">Guardar</Button>;
}
```

## Non-component entries

Besides the component wrappers, `@lindaui/ui` exports utilities:

- `@lindaui/ui/cn` — Tailwind class merge (`cn`).
- `@lindaui/ui/search` — `normalizeText` / `matchesSearch` (accent-insensitive filtering).
- `@lindaui/ui/use-disclosure` — boolean state for controlled overlays.
- `@lindaui/ui/use-media-query` — `useMediaQuery` + `useIsDesktop` / `useIsMobile`.

## A note on the API

HeroUI v3 is react-aria-components (composition: `Root` + `Content` + ...),
not NextUI v2 flat props. Where this library wraps it, the public surface is
flat and stable. See the repo `CLAUDE.md` for the full wrapper contract.

## License

MIT
