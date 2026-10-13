# @lindaui/blocks

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

- c7eeb67: Add AppShell and its footer, EntitySwitcher, CommandPalette, ConnectionPanel, ChannelSettings, SettingsLayout, SaveBar, Stepper, KanbanBoard, KanbanColumn, EntityCard, FilterBar, SourceSelector, and StatusFilters. Add independent `/chat`, `/analytics`, and `/compat` namespaces while preserving the existing flat chat entries. Keep the blocks controlled through props and callbacks, with no SDK, persistence, or business logic; keep ScheduleGrid and TimeSlotSelector out of the package.

  Normalize published declaration references for Node16/NodeNext, exclude tests and stories from package output, and add the `default` export condition for Next/webpack resolution.

## 0.4.2

### Patch Changes

- 5bc98c2: Update lucide-react to 1.55.0 and validate the blocks against the latest icon library.

## 0.4.1

### Patch Changes

- a7bdfb7: Update dependencies and development tooling to their latest stable versions, including HeroUI, Tailwind CSS, React, Recharts, TypeScript, and the build and test toolchain.

## 0.4.0

### Minor Changes

- 02263bc: Fase B del reemplazo de `@bienflow/ui-kit`: familia de blocks de chat genérica y agnóstica de dominio — `chat-layout`, `chat-header`, `chat-avatar`, `conversation-list`, `conversation-list-item`, `conversation-thread`, `message-bubble`, `message-composer`, `audio-player`, `chat-date-divider`, `chat-time-divider`, `empty-chat-view`, más los tipos compartidos `chat-types`. Sin `framer-motion` (animaciones vía CSS de `theme.css`).
- 02263bc: Fase C del reemplazo de `@bienflow/ui-kit`: nuevos blocks `time-range-picker` (presets + rango custom, sin `@internationalized/date`), `entity-health-card` (lista de salud genérica) y `fetching-indicator`; `stat-card` gana `loading` (skeletons de value/delta/description).

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

## 0.1.0

### Minor Changes

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

## 0.0.3

### Patch Changes

- da0aa04: ship llms.txt in tarball
- Updated dependencies [da0aa04]
  - @lindaui/tokens@0.0.3
  - @lindaui/ui@0.0.3

## 0.0.2

### Patch Changes

- 6234dd3: Nuevo paquete @lindaui/blocks: secciones compuestas sobre @lindaui/ui, distribuidas como
  paquete npm (importar, no source-copy). Seed inicial: login-form (form RHF) y
  data-list (filtro + búsqueda + estados). Acompaña un generador en scripts/
  (gen:component / gen:block / gen:exports) que mantiene el exports map derivado.
- Updated dependencies [4eef940]
  - @lindaui/tokens@0.0.2
  - @lindaui/ui@0.0.2
