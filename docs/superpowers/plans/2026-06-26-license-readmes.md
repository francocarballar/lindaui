# LICENSE + READMEs — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Crear el archivo LICENSE (MIT) en raíz y en los 3 paquetes, más READMEs (raíz + por paquete) con install/uso/setup, e incluirlos en los tarballs npm.

**Architecture:** Archivos nuevos de documentación + edición del array `files` de cada `package.json` para empaquetar `LICENSE` y `README.md`. Sin código. Verificación vía `publish --dry-run` (tarball contents).

**Tech Stack:** Markdown, npm packaging (`files` field), pnpm workspaces.

## Global Constraints

- Licencia: `MIT`, copyright `Copyright (c) 2026 Franco Carballar`.
- Sin emojis en docs.
- Los snippets de import en READMEs deben usar entries que existen en el `exports` map real.
- No publicar (release diferida) — solo `--dry-run` para verificar tarball.
- Puede correrse en paralelo al workstream A (metadata); si A ya corrió, los `files` ya podrían existir — este plan los reescribe a su valor final igual.

---

### Task 1: LICENSE raíz (MIT)

**Files:**
- Create: `LICENSE`

**Interfaces:**
- Consumes: nada.
- Produces: el texto MIT canónico reutilizado por los 3 paquetes (Task 2).

- [ ] **Step 1: Crear `LICENSE` en la raíz**

Contenido exacto (texto MIT estándar):

```
MIT License

Copyright (c) 2026 Franco Carballar

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Step 2: Verificar**

Run: `head -3 LICENSE`
Expected: línea 1 `MIT License`, línea 3 `Copyright (c) 2026 Franco Carballar`.

- [ ] **Step 3: Commit**

```bash
git add LICENSE
git commit -m "docs: add MIT LICENSE at repo root"
```

---

### Task 2: Copiar LICENSE a los 3 paquetes

**Files:**
- Create: `packages/ui/LICENSE`, `packages/blocks/LICENSE`, `packages/tokens/LICENSE`

**Interfaces:**
- Consumes: `LICENSE` raíz (Task 1) — texto idéntico.
- Produces: LICENSE presente en cada package dir (necesario porque `files: ["dist"]` no empaqueta el LICENSE raíz).

- [ ] **Step 1: Copiar el LICENSE raíz a cada paquete**

Run:
```bash
cp LICENSE packages/ui/LICENSE
cp LICENSE packages/blocks/LICENSE
cp LICENSE packages/tokens/LICENSE
```

- [ ] **Step 2: Verificar las 3 copias**

Run: `for p in ui blocks tokens; do head -1 packages/$p/LICENSE; done`
Expected: `MIT License` tres veces.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/LICENSE packages/blocks/LICENSE packages/tokens/LICENSE
git commit -m "docs: add MIT LICENSE to each published package"
```

---

### Task 3: Incluir LICENSE + README en `files` de los 3 paquetes

**Files:**
- Modify: `packages/ui/package.json`, `packages/blocks/package.json`, `packages/tokens/package.json`

**Interfaces:**
- Consumes: nada (los archivos README se crean en Tasks 4-6; npm ignora entradas de `files` que no existen aún, sin error).
- Produces: `files: ["dist", "LICENSE", "README.md"]` en los 3.

- [ ] **Step 1: Editar el array `files` en los 3 package.json**

En cada uno reemplazar `"files": ["dist"],` por:

```json
  "files": ["dist", "LICENSE", "README.md"],
```

- [ ] **Step 2: Verificar**

Run: `for p in ui blocks tokens; do node -e "console.log('$p', require('./packages/$p/package.json').files)"; done`
Expected: cada uno imprime `[ 'dist', 'LICENSE', 'README.md' ]`.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/package.json packages/blocks/package.json packages/tokens/package.json
git commit -m "chore: include LICENSE and README in published files"
```

---

### Task 4: README de `@lindaui/ui`

**Files:**
- Create: `packages/ui/README.md`

**Interfaces:**
- Consumes: el `exports` map de `packages/ui/package.json` (para snippets válidos).
- Produces: doc de install/uso de `@lindaui/ui`.

- [ ] **Step 1: Crear `packages/ui/README.md`**

```markdown
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
```

- [ ] **Step 2: Verificar que los entries citados existen**

Run: `node -e "const e=require('./packages/ui/package.json').exports; ['./button','./select','./dialog','./cn','./search','./use-disclosure','./use-media-query'].forEach(k=>{if(!e[k])throw new Error('missing '+k);}); console.log('all entries exist')"`
Expected: `all entries exist`

- [ ] **Step 3: Commit**

```bash
git add packages/ui/README.md
git commit -m "docs(ui): add README (install/setup/usage)"
```

---

### Task 5: README de `@lindaui/blocks`

**Files:**
- Create: `packages/blocks/README.md`

**Interfaces:**
- Consumes: el `exports` map de `packages/blocks/package.json`.
- Produces: doc de install/uso de `@lindaui/blocks`.

- [ ] **Step 1: Crear `packages/blocks/README.md`**

```markdown
# @lindaui/blocks

Composed UI sections built on **@lindaui/ui** — auth flows, lists, master-detail
panels, and charts. This is an importable npm package, **not** a copy-paste /
shadcn-style registry: you `import` the blocks, you don't vendor their source.

## Install

```bash
pnpm add @lindaui/blocks @lindaui/ui @lindaui/tokens
```

Peer dependencies: `react >=19`, `react-dom >=19`, `react-hook-form >=7`, and
`recharts` (for the chart blocks).

## Usage

```tsx
import "@lindaui/tokens/css";
import { LoginForm } from "@lindaui/blocks/login-form";
import { BarChart } from "@lindaui/blocks/bar-chart";
```

Controlled blocks (`list-pane`, `detail-panel`, `document-panel`,
`split-workspace`, `confirm-dialog`) receive state + handlers. There is zero
data-fetching / backend in the library — you wire that up.

## Catalog

**UI sections:** `login-form`, `auth-layout`, `auth-provider`,
`field-array-form`, `list-item`, `list-pane`, `detail-panel`, `confirm-dialog`,
`image-viewer`, `document-panel`, `document-reader`, `recording-overlay`,
`split-workspace`.

**Charts** (on `@lindaui/ui/chart`): `area-chart`, `bar-chart`, `line-chart`,
`pie-chart`, `radar-chart`, `radial-chart`, `stat-card`, `chart-card`,
`stats-grid`.

## License

MIT
```

- [ ] **Step 2: Verificar entries citados**

Run: `node -e "const e=require('./packages/blocks/package.json').exports; ['./login-form','./bar-chart','./list-pane','./auth-layout'].forEach(k=>{if(!e[k])throw new Error('missing '+k);}); console.log('ok')"`
Expected: `ok`

- [ ] **Step 3: Commit**

```bash
git add packages/blocks/README.md
git commit -m "docs(blocks): add README (install/usage/catalog)"
```

---

### Task 6: README de `@lindaui/tokens`

**Files:**
- Create: `packages/tokens/README.md`

**Interfaces:**
- Consumes: el `exports` map de `packages/tokens/package.json` (`./css`).
- Produces: doc de uso del CSS bundle.

- [ ] **Step 1: Crear `packages/tokens/README.md`**

```markdown
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
```

- [ ] **Step 2: Verificar el export `./css`**

Run: `node -e "const e=require('./packages/tokens/package.json').exports; if(!e['./css'])throw new Error('no ./css'); console.log('ok')"`
Expected: `ok`

- [ ] **Step 3: Commit**

```bash
git add packages/tokens/README.md
git commit -m "docs(tokens): add README (CSS usage/dark mode/build)"
```

---

### Task 7: README raíz

**Files:**
- Create: `README.md`

**Interfaces:**
- Consumes: la arquitectura de `CLAUDE.md` (diagrama + tabla de paquetes).
- Produces: la portada del monorepo.

- [ ] **Step 1: Crear `README.md` en la raíz**

```markdown
# @ts design system

Monorepo (pnpm + Turborepo) of a React 19 design system: brand tokens
(`@lindaui/tokens`), component library (`@lindaui/ui`) and composed sections
(`@lindaui/blocks`), all on top of **HeroUI v3** (react-aria-components).

## Architecture

```
apps/storybook  (preview)
       │ consumes ui + blocks
       ▼
@lindaui/blocks  ──composes──►  @lindaui/ui  ──wraps──►  @heroui/react (RAC)
       │ peer                  │ peer
       ▼                       ▼
@lindaui/tokens (dist/index.css)  ──►  @heroui/styles + tailwindcss v4
```

## Packages

| Package | What | Path |
|---|---|---|
| `@lindaui/tokens` | Brand CSS bundle (tokens + HeroUI + Tailwind) | `packages/tokens/` |
| `@lindaui/ui` | React 19 component wrappers over HeroUI v3 | `packages/ui/` |
| `@lindaui/blocks` | Composed sections built on `@lindaui/ui` | `packages/blocks/` |
| `storybook` | Preview catalog (private) | `apps/storybook/` |

## Quickstart (consumer)

```bash
pnpm add @lindaui/ui @lindaui/blocks @lindaui/tokens
```

```tsx
import "@lindaui/tokens/css";            // once, at the app root
import { Button } from "@lindaui/ui/button";
import { LoginForm } from "@lindaui/blocks/login-form";
```

Peers you provide: `react >=19`, `react-dom >=19`, `react-hook-form >=7`
(+ `recharts` for chart blocks).

## Development

```bash
pnpm install
pnpm build        # turbo: tokens → ui → blocks
pnpm test         # vitest suites for ui + blocks
pnpm dev          # turbo watch
```

The contributor contract (wrapper styles, build pipeline, anti-regressions)
lives in [`CLAUDE.md`](./CLAUDE.md).

## License

MIT — see [LICENSE](./LICENSE).
```

- [ ] **Step 2: Verificar**

Run: `head -1 README.md`
Expected: `# @ts design system`

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: add root README (architecture/quickstart/dev)"
```

---

### Task 8: Verificar que LICENSE + README entran al tarball

**Files:**
- Modify: ninguno.

**Interfaces:**
- Consumes: Tasks 1-7.
- Produces: evidencia de empaquetado.

- [ ] **Step 1: Build (los dry-runs requieren `dist/`)**

Run: `pnpm build`
Expected: completa sin error.

- [ ] **Step 2: Dry-run y revisar tarball contents**

Run: `pnpm --filter @lindaui/ui publish --dry-run --no-git-checks`
Expected: la sección "Tarball Contents" lista `LICENSE` y `README.md` además de `dist/` y `package.json`.

- [ ] **Step 3: Ídem blocks y tokens**

Run: `pnpm --filter @lindaui/blocks publish --dry-run --no-git-checks`
Run: `pnpm --filter @lindaui/tokens publish --dry-run --no-git-checks`
Expected: ambos listan `LICENSE` y `README.md`.

- [ ] **Step 4: Registrar resultado**

No commit. Anotar que los 3 tarballs incluyen LICENSE + README.

---

## Self-Review

- **Cobertura del spec:** R1 (LICENSE raíz) → Task 1. R2 (LICENSE en packages + `files`) → Tasks 2-3. R3 (README raíz) → Task 7. R4/R5/R6 (READMEs ui/blocks/tokens) → Tasks 4/5/6. Criterios 1-2 → Tasks 1-7; criterio 3 → Task 3; criterio 4 → Task 8; criterio 5 (entries válidas) → Steps de verificación en Tasks 4-6.
- **Placeholders:** ninguno. Todo el texto de LICENSE y READMEs está completo e inline.
- **Consistencia:** el array `files` es idéntico en los 3 (`["dist","LICENSE","README.md"]`). Los snippets citan entries verificadas contra el `exports` real en cada task.
