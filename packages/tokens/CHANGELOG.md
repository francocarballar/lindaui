# @lindaui/tokens

## 0.4.6

### Patch Changes

- ff93da4: Update direct and transitive workspace dependencies to their latest versions (`framer-motion` 14.2.0, `@react-types/shared` 3.37.0, `bunchee` 7.0.2, `react`/`react-dom` 19.3.1, `react-hook-form` 7.90.0, `lucide-react` 1.57.0, `zod` 4.6.7, `vitest`/`@vitest/coverage-v8` 5.0.4, `@testing-library/user-event` 14.6.8, `turbo` 2.11.8, `e2e` 0.21.0, `@e2e-dev/web` 0.15.0, `storybook` 10.6.2, and `next` 16.4.1). Coordinated patch releases for `@lindaui/ui`, `@lindaui/blocks`, and `@lindaui/tokens` publish the refreshed build artifacts and lockfile-resolved HeroUI/Tailwind CSS pipeline across the entire ecosystem.

## 0.4.5

### Patch Changes

- 2c39c23: Automate the ecosystem delivery workflow with atomic commits, rigorous verification, changelog-backed GitHub releases before npm publication, and durable publication receipts. These coordinated patch releases validate the new shared publication pipeline for all public packages.

## 0.4.4

### Patch Changes

- ba7032b: Document exact installed-version evidence and the boundaries between package integrity, builds and browser verification. Harden release verification with downloaded tarball SHA-512/SHA-1 and manifest checks, durable failure receipts, bounded registry convergence retries and protection against concurrent checkout or PR-head changes. Consumer fixtures now reject unexpected installed versions.

## 0.4.3

### Patch Changes

- 226a2f2: Document the consumer control policy in all published agent references. The LindaUI skill 1.1.0 detects raw JSX controls against installed exports, distinguishes input roles, reports local exceptions and scan scope, and provides whole-copy drift verification with backed-up synchronization. Semantic containers remain native HTML; required native behavior uses a local reason. Real consumer fixtures now use LindaUI Button and run the checker before typechecking/building.

## 0.4.2

### Patch Changes

- Render OTP slots when no custom children are supplied. Correct form category labeling,
  image loading after source changes, preview accessibility, and chat scroll cleanup.
  Regenerate the stylesheet bundles from the current component inventory.

  Verify each first-party source file with 100% statement, branch, function and line
  coverage, plus real component stories and desktop/mobile browser interaction tests.

## 0.4.1

### Patch Changes

- 8a74ca6: Document the portable LindaUI consumer skill and its agent-first integration workflow in the shipped package documentation. Add version-aware API inspection, setup plans, theme generation, functional recipes and integration diagnostics, maintained with the library and verified on Windows, macOS and Linux.

  Declare stylesheet side-effect types for all token CSS exports so strict TypeScript consumers with noUncheckedSideEffectImports can import @lindaui/tokens/css without a local ambient workaround. Runtime exports remain CSS.

## 0.4.0

### Minor Changes

- afe7a12: Add `/heroui.css` and `/lead-converter.css` source entries for portable Tailwind pipelines, plus `/lead-converter/compiled.css`, a standalone violet LeadConverter bundle that leaves the default teal `theme.css` unchanged. Include the bundles in the build and its cache inputs while keeping Storybook scanning separate from published CSS.

  Isolate temporary CSS inputs and outputs per build, validate complete snapshots before atomic rename, and clean only files owned by that invocation so concurrent builds produce complete, byte-identical artifacts.

## 0.3.1

### Patch Changes

- a7bdfb7: Update dependencies and development tooling to their latest stable versions, including HeroUI, Tailwind CSS, React, Recharts, TypeScript, and the build and test toolchain.

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
