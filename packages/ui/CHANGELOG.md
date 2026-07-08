# @lindaui/ui

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
