# @lindaui/tokens

## 0.3.0

### Minor Changes

- c4dfc62: Hardening de empaquetado y pipeline (sin cambios de API de componentes):

  - `@lindaui/tokens`: el CSS publicado ya no incluye utilities de las stories de
    Storybook (solo `ui` + `blocks`); el build verifica el output (markers +
    tamaño) para que un `@source` roto falle en vez de emitir CSS sin utilities.
    Nuevos exports: `./theme.css` (source del theme, para pipelines Tailwind
    propios) y `./package.json`. `sideEffects: ["*.css"]`.
  - `@lindaui/ui` y `@lindaui/blocks`: export estándar `./package.json`;
    metadata npm (`keywords`/`homepage`/`bugs`); los peers `@lindaui/*` ahora
    declaran piso `>=0.2.0` (antes `*`) para que npm avise combinaciones
    incompatibles.

## 0.2.2

### Patch Changes

- 2f549c2: New block `@lindaui/blocks/table-pane` — the tabular sibling of `list-pane`.

  Wraps `@lindaui/ui/table` in the same controlled chrome as `list-pane` (filter
  tabs + search + loading/error/empty states) and adds:

  - `columns` / `rows` (delegated to `@lindaui/ui/table`; each cell is a `ReactNode`
    so domain chips/avatars stay in the consumer),
  - a `toolbarExtra` slot for extra filter controls to the right of the search
    (e.g. a `<Select>`),
  - an optional footer: `footer` as an escape hatch, or the `footerCount`
    convenience (`{shown, total, label?}` → "Mostrando X de Y").

  Fully controlled and does no data-fetching or filtering — pass already-filtered
  `rows`. `@lindaui/tokens` CSS regenerated for the block's utilities.

## 0.2.1

### Patch Changes

- c04fa9d: `recording-overlay` gains a `variant` prop.

  - `variant?: "overlay" | "inline"` (default `"overlay"`, backwards-compatible).
  - `overlay` keeps the fixed dark surface for use over media, now on the `viewer-*`
    tokens instead of a hardcoded color.
  - `inline` drops the absolute positioning and forced dark background, fills its
    container, inherits the panel surface, and uses token-driven text so it stays
    legible on a light or dark panel. Content is identical across variants.
  - `@lindaui/tokens` CSS regenerated for the variant's `viewer-*` / foreground
    utilities.
  - Fixes the recording animation: the `ti-rec-pulse` / `ti-rec-blink` / `ti-wf` /
    `ti-fade` keyframes the overlay references by name were never shipped in
    `@lindaui/tokens`, so the overlay rendered static. They are now bundled in the
    tokens CSS (ported verbatim from the source design), so the pulse rings,
    blinking dot and waveform animate.

- 71f9e1c: Legible back control for media overlays + inline document meta.

  - New block `@lindaui/blocks/workspace-back-button`: a token-driven back pill
    (`bg-secondary`/`border-border`) that stays readable over dark or bright media.
  - `split-workspace` gains `backHref`/`backLabel` and renders that pill by default
    behind a readability scrim with safe-area insets, so consumers no longer have to
    hand-build a legible control over the media. `back?` remains an escape hatch and
    wins over the pair.
  - `document-panel` gains `metaPlacement?: "block" | "inline"` (default `block`);
    `inline` flows subtitle and meta on one wrapping row instead of stacking meta on
    its own line.
  - `@lindaui/tokens` CSS is regenerated to include the new scrim/gradient utilities
    the block uses (`bg-linear-to-b`, `from-black/25`, safe-area insets).

## 0.2.0

### Minor Changes

- a6e167a: Fields are now token-driven with no silent-miss escape hatch.

  - `input`, `textarea`, `number-input` and `search-field` no longer accept
    `className`. Spread onto the RAC wrapper it never reached the `<input>`, so a
    class silently landed on the wrong element. It is now a compile error; style
    fields by overriding the `--field-*` custom properties instead.
  - `search-field` ships the magnifier icon and clear button by default (the clear
    button appears once there is a value).
  - `@lindaui/tokens` now declares the `--field-*` contract
    (`--field-background`/`-foreground`/`-placeholder`/`-border`/`-border-hover`/
    `-border-focus`/`-focus`/`-radius`) as refs to the canonical tokens, so field
    surfaces track the brand and dark mode for free, and a consumer re-skins every
    field from a single override point.

## 0.1.0

### Minor Changes

- 0c7eeb6: Add `@lindaui/tokens/theme-template.css`: a commented, copy-paste theme template listing every overridable canonical var (`:root` + `.dark`) plus the runtime-switchable-theme pattern (`[data-theme]`). Per-project theming works by overriding the canonical vars after the base import — no rebuild, no component changes. Documented in the package README and llms.txt.

## 0.0.3

### Patch Changes

- da0aa04: ship llms.txt in tarball

## 0.0.2

### Patch Changes

- 4eef940: Initial release of @lindaui/tokens (OKLCH brand tokens) and @lindaui/ui (React 19
  wrappers over HeroUI v3).
