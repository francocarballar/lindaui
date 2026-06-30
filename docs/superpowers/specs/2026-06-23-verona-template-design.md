# Verona template sobre @lindaui/ui — Diseño

> Fecha: 2026-06-23
> Estado: aprobado (descomposición) — Fase 0 en detalle

## Objetivo

Replicar el template admin **Verona (PrimeReact 10 / Next 13)** completo (~60 páginas)
usando la librería propia **@lindaui/ui** (HeroUI v3, React 19) + **@lindaui/tokens** en lugar de
PrimeReact/primeflex. El template vive como una app nueva dentro del monorepo actual.

Fuente de referencia: `C:\Users\ccarb\Downloads\verona-react-10.0.0`.

## Decisiones de fundación (cerradas)

| Decisión | Resolución |
|---|---|
| Alcance | Template completo (~60 páginas), entregado por fases. |
| Gaps de @lindaui/ui (chart, calendar de eventos, rich-text, tree, timeline, file-upload) | Construir wrappers nuevos en @lindaui/ui **primero** (cada uno su mini-spec + TDD), no libs sueltas en la app. |
| Ubicación | App dentro del monorepo actual: `apps/verona`, consume `@lindaui/ui` y `@lindaui/tokens` vía `workspace:*`. |
| Framework | Next.js **16.2.9**, app router, React 19. |
| Iconos | `lucide-react` con un adaptador `pi pi-*` → componente lucide. |
| Datos demo | `demo/service/*` (axios → JSON) portado a `public/demo/data/*.json` + `fetch`. |
| primeflex | Eliminado. Markup traducido a Tailwind v4 (ya provisto por `@lindaui/tokens/css`). |
| ripple / input-style (outlined/filled) | Dropeados — son PrimeReact-only, no existen en HeroUI v3. |

## Descomposición en fases (programa)

Cada fase es su propio ciclo spec → plan → implementación.

- **Fase 0 — Fundación** *(este spec)*. Scaffold `apps/verona`, bridge de estilos,
  layout shell portado, decisiones transversales (iconos/datos/primeflex), AppConfig mínimo.
- **Fase 1 — Gap wrappers en @lindaui/ui**. `chart`, `tree`, `rich-text`, `event-calendar`,
  `timeline`, `file-upload`. Cada uno: leer la lib externa, API propia, TDD, entry en exports map.
- **Fase 2 — Páginas que @lindaui/ui ya cubre**. auth (8), dashboards, uikit showcase (~18),
  pages (crud/invoice/timeline/contact/empty/help/notfound), profile (2), ecommerce (7).
- **Fase 3 — Apps complejas** *(dependen de Fase 1)*. mail, chat, tasklist, calendar,
  blog (editor), files, landing.
- **Fase 4 — Pulido**. documentation, charts dashboard, utilities (colors/icons),
  AppConfig completo (slim/slim-plus/horizontal + scale + 10 presets de acento), responsive, a11y.

Orden de dependencias: **0 → (1 ∥ 2) → 3 → 4**. Fase 2 corre en paralelo a Fase 1.

---

## Fase 0 — Fundación (detalle)

### 1. Scaffold `apps/verona`

- Next.js 16.2.9 (app router, React 19). `app/` con route groups idénticos a Verona:
  `(full-page)/`, `(landing)/`, `(main)/`.
- Fase 0 crea solo: `app/layout.tsx` (raíz), `(main)/layout.tsx` + `(main)/page.tsx`
  (placeholder), `(full-page)/layout.tsx` (vacío, para auth futuro).
- `package.json`: `@lindaui/ui`, `@lindaui/tokens` como `workspace:*`; `lucide-react`, `next`, `react`,
  `react-dom` como deps. Entra a `pnpm-workspace.yaml`; turbo orquesta `dev`/`build`/`lint`.
- `tsconfig.json` extiende `tsconfig.base.json`; alias `@/*` → raíz de la app (como Verona).

### 2. Bridge de estilos

- `app/layout.tsx` importa `@lindaui/tokens/css` (trae Tailwind v4 + HeroUI styles + tokens OKLCH).
- Config Tailwind v4 de la app que reusa los tokens (utilities en el markup).
- **primeflex → Tailwind v4**: traducción mecánica. Tabla de equivalencias frecuentes:
  `align-items-center`→`items-center`, `justify-content-*`→`justify-*`, `flex-1` igual,
  `gap-N` igual, `w-6`(50%)→`w-1/2`, `border-round`→`rounded`, `surface-*`/`text-*` → tokens.
- **CSS de layout**: portar `styles/layout/*.scss` de Verona (topbar, sidebar, breadcrumb,
  footer, content, config) **adaptado a vars de @lindaui/tokens**, NO reescrito a Tailwind puro.
  La lógica de menu-modes vive en SCSS; reescribirla a utilities es frágil. Fase 0 solo porta
  lo necesario para **menu-mode static** + toggle mobile; slim/overlay/horizontal se difieren.
- Fuente **Lato** (woff2 de Verona) → `public/fonts` + `next/font/local`.

### 3. Layout shell — componentes (`apps/verona/layout/`)

Portados desde Verona, con PrimeReact reemplazado por @lindaui/ui. Cada componente es un client
component (`"use client"`) salvo los puramente estructurales.

| Componente | Origen Verona | Implementación @lindaui/ui |
|---|---|---|
| `LayoutContext` | `context/layoutcontext.tsx` | State puro portado; se quitan `PrimeReactContext`, ripple, `changeTheme`. `layoutConfig` recortado a `{ colorScheme, menuMode: 'static' }`. |
| `MenuContext` | `context/menucontext.tsx` | Portado tal cual (active menu state). |
| `AppLayout` | `layout.tsx` | Contenedor + clases de container según menu-mode. Click-outside / resize listeners en `useEffect` nativo (sin hooks de PrimeReact). |
| `AppTopbar` | `AppTopbar.tsx` | Logo, menubutton, tabs, search (`@lindaui/ui/search-field`), perfil (`@lindaui/ui/menu` + `@lindaui/ui/avatar`). |
| `AppSidebar` | `AppSidebar.tsx` | Wrapper del menú. |
| `AppMenu` | `AppMenu.tsx` | Modelo de datos idéntico (mismo árbol de nav que el original). |
| `AppMenuitem` / `AppSubMenu` | idem | Render recursivo del árbol; navegación con `next/link`; `usePathname` para activo. |
| `AppBreadcrumb` | `AppBreadCrumb.tsx` | `@lindaui/ui/breadcrumbs`. |
| `AppFooter` | `AppFooter.tsx` | Estático. |
| `AppConfig` | `AppConfig.tsx` | `@lindaui/ui/drawer` + `@lindaui/ui/radio-group` + `@lindaui/ui/switch`/`button`. **Recortado a mínimo viable** (ver §5). |

### 4. Decisiones transversales

- **Iconos** — `apps/verona/lib/icon.tsx`: componente `<Icon name="pi pi-home" />` con un
  mapa `pi-*` → componente de `lucide-react`. Aísla el reemplazo; @lindaui/ui no se toca.
  Se cubren solo los iconos que el shell usa en Fase 0; el mapa crece por fase.
- **Datos** — `demo/service/*` → `public/demo/data/*.json` + helper `fetch`. Sin axios.
  Fase 0 no necesita datos (placeholder), pero se deja el patrón establecido.

### 5. AppConfig — mínimo viable (decisión cerrada)

Fase 0 solo expone:
- **Color scheme**: light / dark → togglea `.dark` en `<html>` (clase que ya consume @lindaui/tokens).
- **Menu mode**: solo `static` (desktop) + toggle mobile.

Diferido a Fase 4: scale, slim/slim-plus/overlay/horizontal, 10 presets de acento.
Dropeado: ripple, input-style.

### Entregable Fase 0

Shell navegable: topbar (logo + search + perfil) + sidebar con menú jerárquico completo
+ breadcrumb + footer + AppConfig (light/dark) + 1 página `(main)` placeholder.
Criterio de hecho: `pnpm dev` levanta la app en :3000 y renderiza el shell;
`pnpm build` pasa (incluye gate de tipos `tsc`); dark mode funciona; navegación entre
items del menú resaltando el activo.

## Fuera de alcance (Fase 0)

- Cualquier página de contenido real (auth, dashboards, uikit, apps, ecommerce).
- Los gap wrappers de @lindaui/ui (Fase 1).
- Menu-modes distintos de static, scale, presets de color.
- Tests E2E. (Tests unit del shell: pendiente de definir en el plan de implementación.)
