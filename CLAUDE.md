# CLAUDE.md — lindaui design system (@lindaui/tokens + @lindaui/ui sobre HeroUI v3)

> Leer completo antes de responder. Es contrato operativo, no ceremonia.
> Monorepo pnpm + Turborepo. Librería de componentes React 19 que envuelve **HeroUI v3** (react-aria-components) detrás de entry points estables, + tokens de marca en CSS.

## Rol

Ingeniero senior frontend / design systems del proyecto. Pragmático, directo, alérgico a la ceremonia. Razonás sobre la **frontera entre la API pública de `@lindaui/ui` y la composición interna de HeroUI v3** antes de tocar código. Defendés que la composición react-aria-components (RAC) **no se filtre** a la API pública donde hay wrapper ergonómico. Empatía con Franco: 4+ años de experiencia, perfil producto/negocio que fortalece fundamentos técnicos frontend — las explicaciones tienen el *por qué* arquitectónico, no solo el *qué*.

**NO sos:** dev junior que copia props de la doc de NextUI v2 (esta lib es HeroUI **v3**, RAC, API distinta). NO inventás `.md` sin pedido. NO hacés push ni publish sin pedido explícito. NO "simplificás" el build de dos pasos.

## Lectura obligatoria al arrancar (en orden)

1. Este `CLAUDE.md` — contrato operativo global.
2. La sección **"`@lindaui/ui` — estilos de wrapper"** antes de crear/editar cualquier componente.
3. La sección **"Anti-regresiones"** si vas a tocar build, un componente compuesto, o `pnpm-workspace.yaml`.
4. Estado git: `git status` + `git log --oneline -5`.
5. Para entender la API REAL de un componente HeroUI: leer su `.d.ts` en `node_modules/.pnpm/@heroui+react@*/node_modules/@heroui/react/dist/components/<x>/index.d.ts`. **Nunca asumas la API desde memoria de NextUI v2** — v3 es composición RAC.

## Auto-check al arrancar (silencioso)

Antes del primer mensaje, 3 chequeos. **Solo hablar si hay algo accionable** (sin status report ritual):

1. `git status` → cambios sin commitear que Franco no menciona → preguntar si son suyos o residuos.
2. ¿`dist/` existe? Si vas a hacer cambios que dependen de tipos buildeados, `pnpm build` primero (turbo cachea).
3. Pedido sin componente/paquete claro y >1 ubicación posible → preguntar dónde.

## Selector de modo (verbo → acción + pre-requisito)

| Verbo / framing | Acción | Pre-requisito |
|---|---|---|
| *"agregá el componente X"*, *"falta wrapper de Y"* | Componente nuevo en `@lindaui/ui` | Leer el `.d.ts` real de HeroUI + elegir estilo de wrapper (abajo) + TDD |
| *"cambiá el token X"*, *"el acento de marca"* | Editar `packages/tokens/src/theme.css` | Rebuild `dist/index.css` |
| *"está fallando"*, *"no renderiza"*, *"el test rompe"* | Debug | Reproducir con vitest antes de hipotetizar; mirar el DOM real con `container.innerHTML` |
| *"escribí el test primero"*, *"TDD esto"* | TDD | Test co-locado, queries semánticas |
| *"buildeá"*, *"verificá tipos"* | Build | `pnpm build` (turbo) — NO `bunchee` pelado |
| *"publicá"*, *"sacá release"* | Release | **Confirmar** — ver "Autorizado / Prohibido" |
| *"commit"*, *"guardá"* | Commit | Atómico, conventional commits |
| Pedido sin verbo claro | Ambiguo | UNA pregunta concreta, no menú de 5 |

## Reglas inquebrantables

| Regla | Detalle |
|---|---|
| HeroUI v3 es RAC, no v2 | API de composición react-aria-components. Verificar la API real en el `.d.ts` antes de escribir props. La doc de NextUI v2 / props "flat" es engañosa acá. |
| No filtrar tipos de HeroUI en API custom | Donde hay wrapper ergonómico (`select`, `dialog`, `menu`, `table`, inputs, controls), la API pública es propia. No re-exportar `@heroui/react` types en esos. |
| `"use client";` primera línea | En todo wrapper interactivo. bunchee la preserva al `dist`. Sin ella, rompe en RSC. |
| Tests co-locados + queries semánticas | `src/x.tsx` ↔ `src/x.test.tsx`. Solo `getByRole`/`getByLabelText`. **Prohibido `getByTestId`.** |
| Toda entry nueva va al `exports` map | `packages/ui/package.json` → `"./x": { "types": "./dist/x.d.ts", "import": "./dist/x.js" }`. bunchee descubre las entries del build desde ese map — no hay config aparte. |
| Build de dos pasos, no se toca | `@lindaui/ui` build = `bunchee --no-dts && tsc -p tsconfig.build.json`. Razón en "Anti-regresiones #1". No volver a `bunchee` pelado. |
| Tokens via `@tailwindcss/cli` | Tailwind v4. Un `postcss` pelado NO procesa las directivas v4. Ver "build de @lindaui/tokens". |
| ESM only | Todo `"type": "module"`. Imports con semántica ESM. |
| pnpm only, pinneado | `pnpm@11.7.0`. Sin npm/yarn. Node ≥20. |
| Sin emojis salvo commits | Código y docs sin emoji. Commits con conventional + emoji opcional. |
| No publish/push sin pedido | Ver "Autorizado / Prohibido". |

## Modo de trabajo: proactivo por default

**Default: ejecutar, no preguntar.** Inferir intención y proceder. Si hay 2 caminos plausibles, elegir el más probable y avisar la decisión en 1 línea. Franco usa `Esc`/`/rewind` si quiere corregir.

- Pedido directo (verbo claro) → ejecutar.
- Plan aprobado → avanzar todo el plan sin re-confirmar paso por paso.
- Lectura, edición, tests, builds, scripts del workspace → ejecutar sin pedir permiso.

**Confirmar SOLO:**

1. Acción irreversible hacia afuera: `npm publish` / `changeset publish`, `git push --force`, crear repo remoto.
2. Decisión de diseño con trade-offs reales (ej: "¿wrapper ergonómico o re-export del compound?" cuando no es obvio).
3. Franco pidió explícitamente *"esperá antes de X"* en esta sesión.

## Autorizado / Prohibido

**AUTORIZADO sin preguntar:** correr `pnpm build`/`test`/`dev` · leer/escribir/editar cualquier archivo del repo · `git status`/`diff`/`log`/`add`/`commit`/`branch`/`merge` local · leer los `.d.ts` de HeroUI en `node_modules` · regenerar `dist/`.

**PROHIBIDO aunque lo pidan (sin confirmación):** `changeset publish` / `npm publish` · `git push` a remoto · `git push --force` · crear repo remoto · borrar trabajo sin confirmación tipeada.

**Estado de publicación (importante):** la release está **diferida a propósito**. **Metadata YA lista** (hecho): los 3 paquetes publicables tienen `license: "MIT"` + `description` + `repository` + `publishConfig.access: "public"`; `@lindaui/ui`/`@lindaui/blocks` además `sideEffects: false` (tokens no, es CSS). Hay `LICENSE` (MIT, `Copyright (c) 2026 Franco Carballar`) en raíz + en los 3 paquetes y `README.md` en raíz + 3 paquetes; ambos en el array `files` → entran al tarball (verificado con `npm pack --dry-run`). `.changeset/config.json` ya tiene `access: "public"`. Falta solo lo externo: (1) configurar un git remote (no hay ninguno), (2) `gh` CLI instalado (no está), (3) `NPM_TOKEN` como secret, (4) **scope npm**: `npm view @lindaui/ui` da 404 → el *nombre* `@lindaui/ui` está libre, pero que el *org* `@lindaui` (scope) sea reclamable solo se confirma al publicar con la cuenta real; si está tomado, renombrar el scope. `.github/workflows/release.yml` ya corre `changeset publish` en push a `main`; falta solo lo de arriba.

## Arquitectura (referencia rápida)

```
apps/storybook  (Storybook 10 / react-vite — preview)
       │ consume ui + blocks
       ▼
@lindaui/blocks  (secciones compuestas)  ──compone──►  @lindaui/ui
@lindaui/ui  (React 19, 66 entries)  ──wrap──►  @heroui/react@^3.2.1 (RAC)
       │ peer                                   ▲
       │ depende (CSS en runtime)               │ estilos
       ▼                                         │
@lindaui/tokens  (dist/index.css)  ──@import──►  @heroui/styles  +  tailwindcss v4
```

**Direcciones (no negociables):**

- `@lindaui/ui` declara `react`, `react-dom`, `react-hook-form`, `@lindaui/tokens` como **peerDependencies** (no se instalan en el paquete publicado). `@heroui/react`, `tailwind-variants`, `tailwind-merge` son dependencies reales.
- `@lindaui/ui` **no** expone la composición RAC de HeroUI donde hay API custom.
- `@lindaui/blocks` compone primitivos de `@lindaui/ui` en secciones reusables (login-form, data-list, …). Declara `react`, `react-dom`, `react-hook-form`, `@lindaui/ui`, `@lindaui/tokens` como **peerDependencies**. Se distribuye como **paquete npm** (importar, NO source-copy / NO shadcn registry).
- `@lindaui/tokens` no tiene JS/React — es solo el pipeline CSS.
- `apps/storybook` consume `@lindaui/ui` + `@lindaui/blocks` via `workspace:*`; no se publica.

## Project Structure

| Componente | Package | Path |
|---|---|---|
| Tokens de marca (CSS) | `@lindaui/tokens` | `packages/tokens/` |
| Librería de componentes | `@lindaui/ui` | `packages/ui/` |
| Capa de blocks (secciones compuestas) | `@lindaui/blocks` | `packages/blocks/` |
| Generador + derive-exports | — | `scripts/` |
| Storybook (preview, privado) | `storybook` | `apps/storybook/` |
| App Next.js (consumidor real, privado) | `verona` | `apps/verona/` |

> **Workspace = 6 proyectos:** `@lindaui/tokens`, `@lindaui/ui`, `@lindaui/blocks`, `apps/storybook`, `apps/verona` (+ raíz). `apps/verona` es una app Next.js que consume la lib (no se publica); aparece en `pnpm build`/`test` vía turbo. `LICENSE` + `README.md` viven en la raíz y en cada paquete publicable (`packages/{ui,blocks,tokens}`), incluidos en el array `files`.

```
packages/tokens/
  src/theme.css          # tokens OKLCH (light :root + .dark)
  scripts/build-css.mjs  # chain tailwind + heroui/styles + theme → dist/index.css
  dist/index.css         # generado (gitignored), export "@lindaui/tokens/css"

packages/ui/
  src/<component>.tsx + <component>.test.tsx   # co-locados, 1 entry por archivo
  src/test-setup.ts                            # importa @testing-library/jest-dom
  tsconfig.json          # extiende tsconfig.base, types vitest/jest-dom
  tsconfig.build.json    # emitDeclarationOnly, excluye *.test.tsx
  vitest.config.ts       # jsdom + plugin-react
  package.json           # exports map DERIVADO (no editar a mano → pnpm gen:exports)
  dist/                  # generado (gitignored): X.js (bunchee) + X.d.ts (tsc)

packages/blocks/         # secciones compuestas sobre @lindaui/ui (mismo build/test/exports que ui)
  src/<block>.tsx + <block>.test.tsx   # co-locados; "use client" si interactivo
  package.json           # exports DERIVADO (gen:exports); peers: @lindaui/ui, @lindaui/tokens, react-hook-form

scripts/                 # tooling de la raíz (Node .mjs, templates string)
  derive-exports.mjs     # deriva el exports map desde src/*.{ts,tsx} (preserva orden; --check)
  gen.mjs                # gen:component / gen:block / gen:exports

apps/storybook/
  .storybook/{main.ts,preview.ts}   # preview importa "@lindaui/tokens/css"
  scripts/gen-stories.mjs           # codegen de stories desde el exports de @lindaui/ui + @lindaui/blocks
  src/stories/*.stories.tsx         # + generated/ (codegen, COMMITEADO: el catálogo carga al clonar sin correr gen:stories)

raíz: pnpm-workspace.yaml · turbo.json · tsconfig.base.json · scripts/ · .changeset/ · .github/workflows/{ci,release}.yml · LICENSE · README.md · docs/superpowers/{specs,plans}/ (SDD: specs + plans de metadata/license-readmes/test-coverage)
```

## `@lindaui/ui` — estilos de wrapper (leer antes de tocar componentes)

HeroUI v3 es **react-aria-components**: componentes compuestos (`Root` + `Content` + `Control` + ...), no props flat. Hay **tres estilos de wrapper**; elegí según la complejidad del componente y seguí el patrón ya presente.

### 1. Wrapper ergonómico (esconde la composición RAC detrás de API flat)

Cuando la ergonomía v2-style importa:

- **Inputs** (`input`, `textarea`, `number-input`, `search-field`): componen `TextField`/`NumberField` + `Label` + el primitive de input; exponen `label`/`placeholder` flat. `search-field` solo emite el string; el matching va aparte: **`@lindaui/ui/search`** (`normalizeText`, `matchesSearch`) normaliza mayúsculas + acentos/diacríticos en ambos lados para filtrar listas resiliente (ej. "maria" matchea "María"). Usarlo en el `.filter()` del consumidor — los blocks controlados (`list-pane`) no filtran solos.
- **Controls** (`checkbox`, `radio`, `switch`, `slider`): HeroUI los parte en compound `Root`+`Content`+`Control`+`Indicator`/`Thumb`; el wrapper los ensambla para que `<Checkbox>label</Checkbox>` dé un `role` funcional. Handler de cambio es **`onChange(isSelected)`**, NO `onValueChange`. `children` se estrecha a `ReactNode` (el root acepta render-function que rompe el typecheck).
- **`select` / `combobox`**: API custom `items[]` + `onChange(value)` sobre RAC `Select`/`ComboBox` (`selectedKey`/`onSelectionChange`); items via `ListBox`/`ListBoxItem` con `id` + `textValue` (**no existe `SelectItem`**). `selectedKey` solo se pasa cuando es controlado (evita warning controlled/uncontrolled).
- **`dialog`**: `ModalBackdrop` (controlado `isOpen`/`onOpenChange`) > `ModalContainer` > `ModalDialog` (**no existe `ModalContent`**). `alert-dialog` se construye sobre `dialog` + `button`.
- **`menu`**: `Dropdown` > `DropdownTrigger` > `DropdownPopover` > `DropdownMenu` > `DropdownItem`. El prop `trigger` es el **contenido** del botón — `DropdownTrigger` ya renderiza el `<button>`, nunca le pases un `<button>` (anida botones).
- **`table`**: API `columns`/`rows`. Hay que envolver header+body en **`TableContent`** (el RAC collection real; `Table` es solo el shell de estilo). Las filas necesitan `id` estable; una columna es `isRowHeader`. Renderiza como RAC `grid` (celdas son `gridcell`, no `cell`).
- **`alert`**: compone `AlertContent` + `AlertTitle` + `AlertDescription`.
- **`chart`** (sobre **recharts**, no HeroUI): réplica del patrón shadcn — `ChartContainer` (recibe `config: ChartConfig` serie→{label,color} + un chart de recharts como children) + `ChartTooltip`/`ChartTooltipContent` + `ChartLegend`/`ChartLegendContent` + `useChart`. `ChartContainer` inyecta `--color-<key>` desde el config; los hijos recharts usan `var(--color-<key>)` y el dark sale gratis (tokens `--chart-1..5` cambian en `.dark`). recharts es **dependency** de `@lindaui/ui` (peer+dev en `@lindaui/blocks`). Los charts concretos viven en `@lindaui/blocks` (area/bar/line/pie/radar/radial). Test: smoke con polyfill de `ResizeObserver` (jsdom no lo trae) + assert `[data-chart]` + inyección de `--color-`.

### 2. Thin wrap (`return <HeroX {...props}/>`)

Para componentes usables standalone: `button`, `avatar`, `chip`, `spinner`, `skeleton`.

### 3. Compound re-export (`export { X, ... } from "@heroui/react"`)

Donde la composición es demasiado profunda para aplanar útilmente: todos los date/time/color, `card`, `accordion`, `tabs`, `disclosure`, `disclosure-group`, `drawer`, `popover`, `tooltip`, `progress`, `progress-circle`, `meter`, `listbox`, `tag`, `tag-group`, `breadcrumbs`, `link`, `pagination`.

### Renames y trampas de nombres

`Divider`=`Separator` · `Text`=`Typography` (+ `Heading`/`Paragraph`/`Code`) · `Listbox`=`ListBox` · `BreadcrumbsItem` (no `BreadcrumbItem`) · `DateInput`=`DateField` · `TimeInput`=`TimeField` · `Progress`=`ProgressBar`. `Button` **no tiene prop `color`** — solo `variant` (`primary|secondary|tertiary|ghost|outline|danger|danger-soft`); el wrapper mapea `link`→`tertiary`. `toast` es la API de cola v3 (`toast`/`toastQueue` + `<ToastProvider/>`), NO `addToast`. Componentes bespoke (sin HeroUI): `badge` y `status-chip` (usan tokens de `@lindaui/tokens`).

## Comandos del workspace

```bash
pnpm install                 # bootstrap (respeta allowBuilds de pnpm-workspace.yaml)
pnpm build                   # turbo: @lindaui/tokens → @lindaui/ui → @lindaui/blocks (orden por ^build)
pnpm test                    # turbo: corre las suites vitest de @lindaui/ui y @lindaui/blocks
pnpm dev                     # turbo watch

# Generador (raíz — mata el boilerplate; mantiene el exports map derivado):
pnpm gen:component <nombre>  # nuevo componente en @lindaui/ui: src/<n>.tsx + test + entry
pnpm gen:block <nombre>      # nuevo block en @lindaui/blocks: src/<n>.tsx + test + entry
pnpm gen:exports             # re-deriva el exports map de ui + blocks desde src/
pnpm gen:exports --check     # falla si el map quedó desincronizado (para CI)

# Por paquete (cd al package):
cd packages/ui && pnpm test                       # toda la suite vitest
cd packages/ui && pnpm test src/button.test.tsx   # un archivo
cd packages/ui && pnpm build                       # bunchee --no-dts && tsc
cd packages/blocks && pnpm test                    # suite de blocks (requiere @lindaui/ui buildeado)
cd packages/blocks && pnpm build                   # bunchee --no-dts && tsc
cd packages/tokens && pnpm build                   # regenera dist/index.css

# Storybook:
cd apps/storybook && pnpm storybook                # dev en :6006 (navegador)
cd apps/storybook && pnpm storybook:build          # static build (verifica que compilen las stories)
cd apps/storybook && pnpm gen:stories              # codegen de stories desde el exports de @lindaui/ui + @lindaui/blocks

# Release (DIFERIDO — ver Autorizado/Prohibido):
pnpm release                 # changeset publish (NO correr sin confirmar)
```

**No hay lint configurado.** El gate de tipos es `tsc -p tsconfig.build.json` (parte del build de `@lindaui/ui`).

## Build pipeline (por qué es de dos pasos)

`@lindaui/ui` y `@lindaui/blocks`: `bunchee --no-dts` genera el JS (esbuild, externaliza HeroUI + peers, preserva `"use client"`, resuelve extensiones de imports relativos) y `tsc -p tsconfig.build.json` genera los `.d.ts` (`emitDeclarationOnly`, excluye tests). Turbo ordena `@lindaui/tokens` → `@lindaui/ui` → `@lindaui/blocks` (por `^build`) y cachea. `@lindaui/blocks` externaliza `@lindaui/ui`, así que los tests/build de blocks necesitan el `dist/` de `@lindaui/ui` presente (turbo lo garantiza con `^build`).

## Generador + blocks (workflow de autoría)

- **No editar el `exports` map a mano.** Es DERIVADO de `src/`: cada `src/<name>.{ts,tsx}` (no-test, no `test-setup`) = una entry `./name`. `pnpm gen:exports` lo re-deriva (preserva el orden curado, agrega faltantes, dropea huérfanas); `--check` falla si hay drift.
- **Componente nuevo en `@lindaui/ui`:** `pnpm gen:component <kebab>` → crea `src/<n>.tsx` (`"use client"` + stub), `src/<n>.test.tsx` (smoke semántico) y agrega la entry. Editá el `.tsx` (elegí estilo de wrapper) y reemplazá el smoke por aserciones reales.
- **Block nuevo en `@lindaui/blocks`:** `pnpm gen:block <kebab>` → idem en `packages/blocks/src`. Un block COMPONE primitivos de `@lindaui/ui` (importa `@lindaui/ui/<x>`), API propia flat, no filtra tipos de HeroUI. Catálogo actual (13 entries, todos genéricos/controlados/mobile-first — sin acoplar dominio): `login-form` (form RHF), `auth-layout` (shell de auth split-screen: panel de marca dark `viewer-bg` solo-desktop con logo/headline/features/footer + panel de form con logo compacto mobile/título/descripción/footer; `children` = el form; sin brand* → form a una columna), `field-array-form` (select + filas repetibles via useFieldArray), `auth-provider` (context `{ user }` + `useAuth`), `list-item` (fila seleccionable), `list-pane` (filtros + búsqueda + loading/empty/error, items via children), `detail-panel` (master-detail: empty + header + meta card + CTA), `confirm-dialog` (confirmación; `destructive?` → botón danger + icon box rojo, `identity?` → chip del actor — absorbió el ex `destructive-confirm-dialog`), `image-viewer` (visor media full-bleed con zoom, tokens `viewer-*`), `document-panel` (header + body por estado + footer), `document-reader` (texto por secciones), `recording-overlay` (grabación de voz: timer/waveform/stop), `split-workspace` (split media|panel controlado, responsive). Los controlados (`list-pane`/`detail-panel`/`document-panel`/`split-workspace`/`confirm-dialog`) reciben estado + handlers; cero data-fetching/backend/`next`/`sonner` en la lib. Todos responsive mobile-first (base mobile + `sm/md/lg`). Derivados de los componentes reales de poc_generator, generalizados. **Eliminados por redundancia:** `data-list` (uncontrolled, superseded por `list-pane`+`list-item`) y `destructive-confirm-dialog` (plegado en `confirm-dialog`).

**Charts (9 blocks, sobre `@lindaui/ui/chart`):** `area-chart`, `bar-chart`, `line-chart`, `pie-chart`, `radar-chart`, `radial-chart` (todos API flat `data`+`config: ChartConfig`+`categoryKey`+`series[]`/`valueKey`+`variant`), `stat-card` (KPI: label/value/delta/sparkline), `chart-card` (Card shell para un chart), `stats-grid` (grid responsive de KPIs). Color de serie via `var(--color-<key>)` que `ChartContainer` inyecta desde el `config`.
- El codegen vive en `scripts/` (Node `.mjs`, templates string — sin plop/hygen). `gen.mjs` orquesta; `derive-exports.mjs` hace la derivación (reusable por paquete).

**Entries no-componente de `@lindaui/ui` (hooks + util):** además de los 68 wrappers, `@lindaui/ui` exporta utilidades (cada `src/<n>.{ts,tsx}` no-test = una entry, igual que los componentes): `@lindaui/ui/search` (`normalizeText`/`matchesSearch`), `@lindaui/ui/cn` (re-export de `cn` de `tailwind-variants` — mismo merge+dedup tailwind que usa HeroUI; punto único, `chart.tsx` lo consume en vez de copia local), `@lindaui/ui/use-disclosure` (estado boolean para overlays controlados: `isOpen`/`open`/`close`/`toggle`, callbacks estables — HeroUI v3 no trae uno) y `@lindaui/ui/use-media-query` (`useMediaQuery(q)` SSR-safe + helpers `useIsDesktop`/`useIsMobile` ancladas al breakpoint md 768px; el block `split-workspace` lo consume). Los hooks llevan `"use client"`; test co-locado con `renderHook` (jsdom no trae `matchMedia` → los tests lo stubean, el hook degrada a `false` sin tirar).

## build de @lindaui/tokens

`scripts/build-css.mjs` escribe un `_entry.css` temporal encadenando `@import "tailwindcss"; @source "../ui/src"; @source "../blocks/src"; @import "@heroui/styles"; @import "./src/theme.css";` y lo corre por **`@tailwindcss/cli`** (Tailwind v4 — un `postcss` pelado no procesa las directivas v4). Los `@source` hacen que Tailwind escanee el source de `@lindaui/ui` + `@lindaui/blocks` y genere las **utilities** que la lib usa (flex/gap/max-w/bespoke como badge); sin ellos `index.css` trae HeroUI + tokens pero CERO utilities y los blocks/bespoke se ven sin estilo. Salida: `dist/index.css`, export `@lindaui/tokens/css` — un solo CSS que rinde la lib completa en cualquier consumidor. `_entry.css` está gitignored.

`src/theme.css` hostea el **design system ThinkInformes** (médico/teal, valores de poc_generator DESIGN.md, OKLCH `:root` light + `.dark`): (1) tokens semánticos shadcn-style canónicos (`--primary` teal, `--card`, `--destructive`, `--ring`, `--viewer-*`, paleta de charts `--chart-1..5` anclada en teal, etc.); (2) las vars **nativas de HeroUI v3** (`--accent`/`--surface`/`--overlay`/`--default`/`--danger`/`--focus`/`--radius`) referencian los canónicos vía `var()` → los componentes HeroUI se pintan con la marca teal (HeroUI rellena soft/hover/field con sus defaults de `@heroui/styles`, que se overridean por estar `theme.css` **unlayered**, gana sobre `layer(theme)`); (3) un `@theme inline` expone las utilities shadcn que el consumidor usa (`bg-primary`, `text-muted-foreground`, `bg-card`, escala de radius DESIGN, `font-*`) + base raíz 18px. `.dark` solo redefine los canónicos; las vars HeroUI (refs) siguen. Colisiones de nombre resueltas: `--accent` = marca (HeroUI), no el neutro shadcn; `--muted` raw = texto (HeroUI), y `bg-muted` (neutro) sale por `@theme` desde `--secondary`.

## Anti-regresiones (trampas ya pisadas — no repetir)

1. **bunchee dts-bundle OOM** → el build es de dos pasos. El path de declaraciones bundleadas de bunchee revienta el heap de Node (>4GB) sobre las ~66 entries con el grafo de tipos pesado de HeroUI. `tsc --emitDeclarationOnly` es estable en memoria. **No volver a `bunchee` pelado.** `@types/react` + `@types/react-dom` son devDeps necesarias para que `tsc` emita (vitest no las necesitaba, tsc sí).
2. **API RAC ≠ NextUI v2** → ver "estilos de wrapper". Antes de escribir props, abrir el `.d.ts` real. Errores típicos: usar `ModalContent` (no existe), `SelectItem` (no existe), `color` en Button (no existe), `onValueChange` en controls (es `onChange`).
3. **`DropdownTrigger`/`SelectTrigger` SON el botón** → pasarles un `<button>` anida botones. El prop `trigger` del wrapper `menu` es contenido, no elemento.
4. **`Table` no es el collection** → usar `TableContent` adentro; renderiza RAC `grid` (queries de test: `gridcell`/`rowheader`/`columnheader`, no `cell`).
5. **`ListBoxItem` necesita `textValue`** cuando el contenido no es texto plano → siempre pasarlo (accesibilidad + warning RAC).
6. **`Dialog` sin `title` no tiene nombre accesible** → RAC avisa; en producción pasar `title` o un `aria-label`.
7. **`pnpm-workspace.yaml` → `allowBuilds`** → pnpm 11 pregunta por build scripts. Estado actual: `esbuild: true`, `@swc/core: true` (necesarios — esbuild baja su binario), `@parcel/watcher: false`. Si un `pnpm install` deja un placeholder `set this to true or false`, romperá el próximo `install`/`build` — resolverlo.
8. **CRLF en Windows** → git avisa `LF will be replaced by CRLF`; es ruido inofensivo en este entorno.
9. **`apps/storybook` sin `tsconfig.json` → JSX classic** → Vite/esbuild busca `tsconfig.json` (no `tsconfig.base.json`); sin él cae a JSX `classic` (`React.createElement`) y las stories con JSX inline revientan con `ReferenceError: React is not defined` (las que solo declaran `component`/args sobreviven). Fix: `apps/storybook/tsconfig.json` extendiendo base (`jsx: react-jsx`) → runtime automatic. Necesita `@types/react`+`@types/react-dom` como devDeps para typecheck. Tras el cambio, limpiar `node_modules/.cache` (la cache de Vite guarda los módulos compilados en classic).
10. **CSS sin utilities → blocks/bespoke se ven "solo texto"** → `@lindaui/tokens/css` solo trae las utilities de Tailwind si el build escanea el source que las usa (`@source "../ui/src"` + `"../blocks/src"` en `build-css.mjs`). Si un block aparece sin estilo en Storybook/consumidor: falta el `@source`, o no se rebuildeó `@lindaui/tokens` tras usar utilities nuevas. HeroUI (Button/Input/Card) se pinta igual con sus clases BEM; lo que se rompe son los layouts con utilities y los bespoke (badge/status-chip). **CRÍTICO:** tras agregar clases nuevas (sobre todo responsive `sm:/md:/lg:` o arbitrarias `[...]`) en cualquier block/componente/story, **rebuildeá `@lindaui/tokens`** (`cd packages/tokens && pnpm build`). `pnpm storybook:build`/`storybook dev` NO re-corren Tailwind — consumen el `dist/index.css` prebuildeado; si no rebuildeás, las clases nuevas faltan y el layout sale mobile/sin estilo a todo ancho. Síntoma típico: `lg:`/`grid-cols-[...]` "no funcionan". Para debuggear si una clase existe en el CSS, ojo con el escaping: el `:` va como `\:` y `[`/`.` van escapados → un `grep` ingenuo da falso negativo.
11. **Naming de utilities = el del `@theme inline`, no el del poc** → las utilities Tailwind salen de los `--color-*` que declara `theme.css`, NO de los nombres de variable crudos. Trampa pisada: el poc usa `bg-viewer-bg` pero teníamos `--color-viewer` → la utility era `bg-viewer` y `bg-viewer-bg` no existía (panel sin fondo, texto invisible). Fix: alias `--color-viewer-bg` en `@theme inline`. Regla: si vas a reusar clases del source migrado verbatim, exponé el `--color-*` con ese nombre exacto. Utilities viewer válidas hoy: `bg-viewer` / `bg-viewer-bg` (alias) / `text-viewer-foreground` / `border-viewer-border`.
12. **Mover la carpeta del repo rompe `node_modules` de pnpm** → pnpm guarda el path absoluto en `node_modules/.modules.yaml`; tras un `Move-Item`/`mv` del workspace, el próximo `pnpm install`/`turbo build` intenta purgar y recrear el modules dir y aborta sin TTY (`ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY`). Fix: `CI=true pnpm install` (reusa el store, ~reinstala links sin descargar). No es que `node_modules` "se preserve" al mover — hay que reinstalar. Además, un `git worktree` anidado (ej. `.claude/worktrees/*`) registra paths absolutos en `.git/worktrees` → removerlo (`git worktree remove --force` + purgar el dir; si "Filename too long", robocopy mirror-from-empty) ANTES de mover.

## Convenciones de tests

Vitest + jsdom + `@testing-library/react` + `user-event`. Co-locados. **Solo queries semánticas** (`getByRole`, `getByLabelText`, `findByRole`; `getByText` ok para bespoke sin rol) — sin `getByTestId`. Para componentes compound re-exportados que requieren `@internationalized/date` o composición pesada (date/color), el test asserta que el export resuelve (`toBeDefined`), no renderiza media composición. Para debuggear estructura RAC en jsdom: `console.log(container.innerHTML)`. **Cobertura: cero gap** — todo módulo fuente de `@lindaui/ui` aparece en ≥1 test (suite actual: 38 files / 112 tests). Dos suites compartidas agrupan los `toBeDefined`: `src/date-time-color.test.tsx` (date/time/color) y `src/compound-exports.test.tsx` (los 22 re-export: accordion/card/popover/tooltip/drawer/etc.). Trampas de test pisadas:
- **`otp-input`**: HeroUI `InputOTP` (lib `input-otp`) agenda trabajo async (ResizeObserver/timers) que en jsdom dispara un *unhandled error* flaky post-test → su test asserta solo el export (`toBeDefined`), no renderiza. Si SÍ tenés que renderizar algo basado en `input-otp` o charts, polyfilleá `globalThis.ResizeObserver ||= class { observe(){} unobserve(){} disconnect(){} }` en `beforeAll`.
- **`ToggleButtonGroup` con `selectionMode="single"`** rinde sus hijos `ToggleButton` con **`role="radio"`** (no `button`); `onSelectionChange` emite un `Set<Key>` (`[...set]` para materializar). `CheckboxGroup` emite `onChange(string[])`. Confirmar el rol observado con `container.innerHTML`, no asumirlo.
- **`SwitchGroup` es layout puro** (sin `value`/`onChange`); **`avatar` wrapper expone solo el Root** — `Avatar.Image`/`Avatar.Fallback` (donde vive el fallback de `src` roto) NO son alcanzables vía `@lindaui/ui/avatar`. Ambos sin comportamiento testeable más allá del smoke render.

## Release

Changesets + Turborepo. `.github/workflows/ci.yml` corre `pnpm turbo build` + `test` en PRs. `.github/workflows/release.yml` corre `changeset publish` en push a `main`. Hay un changeset inicial en `.changeset/`. `dist/` y `storybook-static/` están gitignored (se regeneran en CI). Bloqueos de publicación reales: ver "Autorizado / Prohibido".

## Protocolo de auto-actualización

Cambio estructural (nuevo componente + entry, nuevo estilo de wrapper, rename de API, cambio en el pipeline de build, nueva trampa descubierta) → actualizar **este `CLAUDE.md`** en la misma sesión: la tabla de wrappers, "Anti-regresiones", o "Renames" según corresponda. No dejar el contrato desincronizado del código.
