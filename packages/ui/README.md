# @ts/ui

React 19 design-system components wrapping **HeroUI v3** (react-aria-components)
behind stable, per-component entry points. The public API is intentionally its
own where there's an ergonomic wrapper — it does not leak HeroUI's RAC
composition or types in those places.

## Install

```bash
pnpm add @ts/ui @ts/tokens
```

Peer dependencies (you provide them): `react >=19`, `react-dom >=19`,
`react-hook-form >=7`. `@ts/tokens` is a peer too — it ships the CSS.

## Setup the styles (once)

Import the token bundle once at your app root. It renders HeroUI + brand tokens
+ the Tailwind utilities the library uses:

```tsx
import "@ts/tokens/css";
```

Dark mode: toggle a `.dark` class on an ancestor element.

## Usage

Import per entry point — one component per import path:

```tsx
import { Button } from "@ts/ui/button";
import { Select } from "@ts/ui/select";
import { Dialog } from "@ts/ui/dialog";

export function Example() {
  return <Button variant="primary">Guardar</Button>;
}
```

## Non-component entries

Besides the component wrappers, `@ts/ui` exports utilities:

- `@ts/ui/cn` — Tailwind class merge (`cn`).
- `@ts/ui/search` — `normalizeText` / `matchesSearch` (accent-insensitive filtering).
- `@ts/ui/use-disclosure` — boolean state for controlled overlays.
- `@ts/ui/use-media-query` — `useMediaQuery` + `useIsDesktop` / `useIsMobile`.

## A note on the API

HeroUI v3 is react-aria-components (composition: `Root` + `Content` + ...),
not NextUI v2 flat props. Where this library wraps it, the public surface is
flat and stable. See the repo `CLAUDE.md` for the full wrapper contract.

## License

MIT
