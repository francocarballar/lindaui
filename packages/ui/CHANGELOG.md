# @lindaui/ui

## 0.5.5

### Patch Changes

- 2c39c23: Automate the ecosystem delivery workflow with atomic commits, rigorous verification, changelog-backed GitHub releases before npm publication, and durable publication receipts. These coordinated patch releases validate the new shared publication pipeline for all public packages.

## 0.5.4

### Patch Changes

- ba7032b: Document exact installed-version evidence and the boundaries between package integrity, builds and browser verification. Harden release verification with downloaded tarball SHA-512/SHA-1 and manifest checks, durable failure receipts, bounded registry convergence retries and protection against concurrent checkout or PR-head changes. Consumer fixtures now reject unexpected installed versions.

## 0.5.3

### Patch Changes

- 226a2f2: Document the consumer control policy in all published agent references. The LindaUI skill 1.1.0 detects raw JSX controls against installed exports, distinguishes input roles, reports local exceptions and scan scope, and provides whole-copy drift verification with backed-up synchronization. Semantic containers remain native HTML; required native behavior uses a local reason. Real consumer fixtures now use LindaUI Button and run the checker before typechecking/building.

## 0.5.2

### Patch Changes

- Render OTP slots when no custom children are supplied. Correct form category labeling,
  image loading after source changes, preview accessibility, and chat scroll cleanup.
  Regenerate the stylesheet bundles from the current component inventory.

  Verify each first-party source file with 100% statement, branch, function and line
  coverage, plus real component stories and desktop/mobile browser interaction tests.

## 0.5.1

### Patch Changes

- 8a74ca6: Document the portable LindaUI consumer skill and its agent-first integration workflow in the shipped package documentation. Add version-aware API inspection, setup plans, theme generation, functional recipes and integration diagnostics, maintained with the library and verified on Windows, macOS and Linux.

  Declare stylesheet side-effect types for all token CSS exports so strict TypeScript consumers with noUncheckedSideEffectImports can import @lindaui/tokens/css without a local ambient workaround. Runtime exports remain CSS.

## 0.5.0

### Minor Changes

- e2ffd00: Add opt-in `/compound` HeroUI v3 components and `/compat` controls, presentation, date, and debounce entries for gradual migrations. Add QRCode and `/motion`, `/notifications`, and `/charts`, with their runtime dependencies and Storybook examples. Require `@lindaui/tokens >=0.4.0` for the new styles.

  Normalize published declaration references for Node16/NodeNext, preserve React Server Component use of the compatibility barrel with client boundaries only where needed, exclude tests and stories from package output, and add the `default` export condition for Next/webpack resolution.

## 0.4.1

### Patch Changes

- a7bdfb7: Update dependencies and development tooling to their latest stable versions, including HeroUI, Tailwind CSS, React, Recharts, TypeScript, and the build and test toolchain.

## 0.4.0

### Minor Changes

- 5c4e0da: Fase A del reemplazo de `@bienflow/ui-kit`: nuevo `icon-button`; `input` extendido con `startContent`/`endContent`/`description`/`errorMessage`; nuevos hooks `use-debounce`/`use-previous`/`use-theme`; `useIsTablet` en `use-media-query`; nuevas utilidades puras `date`/`format`/`time-grouping` (sin dependencia de `dayjs`).

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

## 0.2.0

### Minor Changes

- 7606c0a: `select` and `combobox` accept and forward `aria-label` / `aria-labelledby`.

  Both wrappers expose a flat interface and previously listed no ARIA naming props,
  so a control with no visible `label` had no accessible name (in react-aria a
  `placeholder` does not count as a name) — an unnamed control + a dev warning. They
  now accept `aria-label` / `aria-labelledby` and pass them through to the underlying
  RAC `Select` / `ComboBox`, so compact toolbars and inline filters can name the
  control without a visible label.

## 0.1.0

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

## 0.0.3

### Patch Changes

- da0aa04: ship llms.txt in tarball
- Updated dependencies [da0aa04]
  - @lindaui/tokens@0.0.3

## 0.0.2

### Patch Changes

- 4eef940: Initial release of @lindaui/tokens (OKLCH brand tokens) and @lindaui/ui (React 19
  wrappers over HeroUI v3).
- Updated dependencies [4eef940]
  - @lindaui/tokens@0.0.2
