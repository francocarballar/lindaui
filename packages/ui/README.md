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
`react-hook-form >=7`. `@lindaui/tokens >=0.4.0` is a peer too — it ships the CSS.
The optional shared `lucide-react >=0.4` peer is required when using `/compat`
search/input icons. It is not needed by the existing flat entries.

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

The migration APIs below first ship in UI **0.5.0**. Published UI 0.4.1 and
earlier do not export `/compound` or `/compat`; do not reuse those versions
or their archive filenames for these builds.

`@lindaui/ui/compound` is the opt-in, complete HeroUI v3 surface for existing
compound compositions (`Card.Content`, `Modal.Dialog`, `Tabs.Panel`, hooks and
types). It preserves their original props and anatomy; it does not replace or
change the stable flat entries above.

Shared visual integrations are also available without separate app imports:

- `@lindaui/ui/motion` — Framer Motion components, hooks and types.
- `@lindaui/ui/notifications` — Sonner `toast`, `Toaster`, `useSonner` and types.
- `@lindaui/ui/charts` — Recharts primitives and types (distinct from `/chart`).
- `@lindaui/ui/qr-code` — raw, image and ASCII QR presentation.

### Compatibility inputs and controls

`@lindaui/ui/compat` keeps the former UI-kit contracts separate from the stable
flat APIs: `Button`/`IconButton` retain `color`, legacy `variant`, `isLoading`
and content slots; `Input`/`SearchInput` use `onValueChange` rather than the flat
entries' `onChange`. It also exports `Badge`, `Divider`, `Spinner`, `cn`,
`formatRelativeTime`, `isToday`, `isYesterday` and `useDebounce`.
Import names deliberately from one surface; do not mix props across them.

HeroUI v3 is react-aria-components (composition: `Root` + `Content` + ...),
not NextUI v2 flat props. Where this library wraps it, the public surface is
flat and stable. See the repo `CLAUDE.md` for the full wrapper contract.

## Published types

The package is ESM-only. Published declarations use explicit relative runtime
extensions for Node16/NodeNext as well as bundler resolution. The build
normalizes declaration imports, re-exports and import types without changing
component source, runtime JS or React Server Component boundaries.
Exports put `types` first; `import` and `default` share the same ESM target.
The default fallback supports Next/webpack dynamic-import resolution, not a
separate CommonJS implementation.

## License

MIT
