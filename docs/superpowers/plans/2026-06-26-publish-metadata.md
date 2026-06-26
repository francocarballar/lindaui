# Publish Metadata + Scope Availability — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dotar a los 3 paquetes publicables de metadata de publicación completa (license, description, repository, publishConfig, sideEffects, author) y verificar la disponibilidad del scope npm.

**Architecture:** Edición directa de los 3 `package.json` (`@ts/ui`, `@ts/blocks`, `@ts/tokens`). Sin código nuevo. Verificación vía `pnpm build`, `pnpm test` y `publish --dry-run`. Una tarea condicional de rename de scope que solo corre si el scope `@ts` está tomado.

**Tech Stack:** pnpm 11.7.0 workspaces, Turborepo, Changesets, npm registry.

## Global Constraints

- pnpm only, `pnpm@11.7.0`. Node ≥20.
- ESM only (`"type": "module"`) — no tocar.
- No publicar ni pushear (release diferida). Este plan deja metadata lista; NO corre `changeset publish` ni `npm publish` real (solo `--dry-run`).
- Licencia: `MIT`. Author: `Franco Carballar <francocarballar@gmail.com>`.
- `.changeset/config.json` ya tiene `"access": "public"` — no tocar.
- No editar el `exports` map a mano (es derivado) — este plan no lo toca.

---

### Task 1: Metadata en `@ts/ui`

**Files:**
- Modify: `packages/ui/package.json`

**Interfaces:**
- Consumes: nada.
- Produces: `package.json` con `description`, `author`, `license: "MIT"`, `repository`, `publishConfig`, `sideEffects: false`. Los workstreams B (license/readmes) y C (tests) no dependen de esto.

- [ ] **Step 1: Editar `packages/ui/package.json`**

Insertar estas claves entre `"version": "0.0.1",` y `"type": "module",`:

```json
  "description": "React 19 design-system components wrapping HeroUI v3 (react-aria-components) behind stable per-component entry points.",
  "author": "Franco Carballar <francocarballar@gmail.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/francocarballar/ts-design-system.git",
    "directory": "packages/ui"
  },
  "publishConfig": { "access": "public" },
  "sideEffects": false,
```

- [ ] **Step 2: Verificar el JSON y los campos**

Run: `node -e "const p=require('./packages/ui/package.json'); console.log(p.license, !!p.description, !!p.repository, p.publishConfig.access, p.sideEffects, p.author)"`
Expected: `MIT true true public false Franco Carballar <francocarballar@gmail.com>`

- [ ] **Step 3: Commit**

```bash
git add packages/ui/package.json
git commit -m "chore(ui): add publish metadata (license/description/repository/publishConfig)"
```

---

### Task 2: Metadata en `@ts/blocks`

**Files:**
- Modify: `packages/blocks/package.json`

**Interfaces:**
- Consumes: nada.
- Produces: idem Task 1 para blocks.

- [ ] **Step 1: Editar `packages/blocks/package.json`**

Insertar entre `"version": "0.0.1",` y `"type": "module",`:

```json
  "description": "Composed UI sections (auth, lists, master-detail, charts) built on @ts/ui — importable npm package, not a copy-paste registry.",
  "author": "Franco Carballar <francocarballar@gmail.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/francocarballar/ts-design-system.git",
    "directory": "packages/blocks"
  },
  "publishConfig": { "access": "public" },
  "sideEffects": false,
```

- [ ] **Step 2: Verificar**

Run: `node -e "const p=require('./packages/blocks/package.json'); console.log(p.license, !!p.description, !!p.repository, p.publishConfig.access, p.sideEffects)"`
Expected: `MIT true true public false`

- [ ] **Step 3: Commit**

```bash
git add packages/blocks/package.json
git commit -m "chore(blocks): add publish metadata (license/description/repository/publishConfig)"
```

---

### Task 3: Metadata en `@ts/tokens`

**Files:**
- Modify: `packages/tokens/package.json`

**Interfaces:**
- Consumes: nada.
- Produces: metadata para tokens. SIN `sideEffects` (es CSS-only; ver spec R1).

- [ ] **Step 1: Editar `packages/tokens/package.json`**

Insertar entre `"version": "0.0.1",` y `"type": "module",`:

```json
  "description": "Brand design tokens (OKLCH light/dark) + HeroUI v3 + Tailwind v4 compiled into a single CSS bundle.",
  "author": "Franco Carballar <francocarballar@gmail.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/francocarballar/ts-design-system.git",
    "directory": "packages/tokens"
  },
  "publishConfig": { "access": "public" },
```

- [ ] **Step 2: Verificar**

Run: `node -e "const p=require('./packages/tokens/package.json'); console.log(p.license, !!p.description, p.publishConfig.access, p.sideEffects)"`
Expected: `MIT true public undefined`

- [ ] **Step 3: Commit**

```bash
git add packages/tokens/package.json
git commit -m "chore(tokens): add publish metadata (license/description/repository/publishConfig)"
```

---

### Task 4: Verificar que `sideEffects: false` no rompe build ni tests

**Files:**
- Modify: ninguno (solo verificación).

**Interfaces:**
- Consumes: Tasks 1-3.
- Produces: confirmación de que el árbol sigue verde.

- [ ] **Step 1: Build completo**

Run: `pnpm build`
Expected: turbo completa `@ts/tokens` → `@ts/ui` → `@ts/blocks` sin error de tipos.

- [ ] **Step 2: Tests completos**

Run: `pnpm test`
Expected: suites de `@ts/ui` y `@ts/blocks` pasan (sin regresión).

- [ ] **Step 3: Smoke de import por dist (efectos del tree-shaking)**

Run: `node --input-type=module -e "import('@ts/ui/button').then(m=>{if(!m.Button)throw new Error('Button export missing');console.log('ok button')})"` desde la raíz tras el build.
Expected: `ok button` (el export sobrevive con `sideEffects:false`).

- [ ] **Step 4: Commit (si hubo algún fix; si no, saltar)**

Solo si algún paso anterior requirió un ajuste. Si todo pasó limpio, no hay commit en esta task.

---

### Task 5: Dry-run de publicación de los 3 paquetes

**Files:**
- Modify: ninguno.

**Interfaces:**
- Consumes: Tasks 1-4.
- Produces: evidencia de que la metadata permite publish (sin publicar de verdad).

- [ ] **Step 1: Dry-run `@ts/ui`**

Run: `pnpm --filter @ts/ui publish --dry-run --no-git-checks`
Expected: reporta `access: public`, lista el tarball, NO falla por metadata. (Puede advertir que falta `LICENSE`/`README.md` — eso lo cubre workstream B; aceptable acá.)

- [ ] **Step 2: Dry-run `@ts/blocks` y `@ts/tokens`**

Run: `pnpm --filter @ts/blocks publish --dry-run --no-git-checks`
Run: `pnpm --filter @ts/tokens publish --dry-run --no-git-checks`
Expected: ambos `access: public`, sin fallo de metadata.

- [ ] **Step 3: Registrar resultado**

No commit (no hay cambios de archivo). Anotar en el reporte de ejecución que los 3 dry-runs pasaron.

---

### Task 6 (CONDICIONAL): Verificar disponibilidad del scope `@ts` y renombrar si está tomado

**Ejecutar solo después de Task 5. Si el scope está libre, esta task termina en el Step 1.**

**Files:**
- Modify (solo si tomado): `packages/ui/package.json`, `packages/blocks/package.json`, `packages/tokens/package.json`, `packages/blocks/src/*.tsx`, `apps/storybook/**`, `CLAUDE.md`.

**Interfaces:**
- Consumes: Task 5.
- Produces: o bien confirmación de scope libre, o bien rename completo aplicado.

- [ ] **Step 1: Verificar disponibilidad**

Run: `npm view @ts/ui version`
- `404` / `npm error code E404` → scope LIBRE. **Detener esta task acá**, registrar "scope @ts libre". No hacer nada más.
- Imprime una versión → scope TOMADO. Continuar al Step 2.

- [ ] **Step 2: (solo si tomado) Confirmar scope destino con el owner**

Pausar y preguntar al owner el scope destino (default propuesto: `@francocarballar`, su usuario npm). NO hardcodear sin confirmación — es una decisión de naming pública e irreversible una vez publicada. Verificar que el destino esté libre: `npm view @<nuevo>/ui version` debe dar 404.

- [ ] **Step 3: (solo si tomado) Sustituir `@ts/` → `@<nuevo>/` en el workspace**

Reemplazar en: los 3 `name` de package.json; `peerDependencies`/`dependencies` internos (`@ts/ui`, `@ts/tokens` en blocks y storybook); imports `@ts/ui/*` y `@ts/tokens/css` en `packages/blocks/src` y `apps/storybook`; referencias en `CLAUDE.md`. Los `exports` (rutas relativas) NO cambian.

Comando guía (ajustar `<nuevo>`):
```bash
grep -rl '@ts/' --include='*.json' --include='*.ts' --include='*.tsx' --include='*.md' packages apps CLAUDE.md \
  | xargs sed -i 's#@ts/#@<nuevo>/#g'
```
Revisar el diff a mano: no debe tocar `@ts/tokens` dentro de strings que no sean package names si hubiera colisión accidental (no la hay hoy, pero verificar el diff).

- [ ] **Step 4: (solo si tomado) Reinstalar, buildear, testear**

Run: `pnpm install`
Run: `pnpm build`
Run: `pnpm test`
Expected: los 3 pasan tras el rename.

- [ ] **Step 5: (solo si tomado) Commit**

```bash
git add -A
git commit -m "chore: rename npm scope @ts -> @<nuevo> (scope availability)"
```

---

## Self-Review

- **Cobertura del spec:** R1 (campos) → Tasks 1-3. R2 (descripciones verbatim) → Tasks 1-3, copy exacto del spec. R3 (`sideEffects` seguro) → Task 4. R4 (scope condicional) → Task 6. Criterios de aceptación 1-4 → Tasks 1-5; criterio 5 → Task 6.
- **Placeholders:** ninguno. URL de repository es valor concreto (editable cuando exista remote, no `TBD`). Scope destino se confirma con el owner en Task 6 Step 2 — es una decisión deliberadamente diferida, no un placeholder de plan.
- **Consistencia de tipos:** N/A (no hay código). Las claves JSON son idénticas entre tasks salvo `directory` y `sideEffects` (ausente en tokens, por spec).
