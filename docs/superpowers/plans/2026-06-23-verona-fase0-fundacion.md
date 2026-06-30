# Verona Template — Fase 0 (Fundación) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Levantar `apps/verona` (Next.js 16.2.9) dentro del monorepo con el layout shell de Verona portado a @lindaui/ui — topbar, sidebar con menú jerárquico, breadcrumb, footer y AppConfig mínimo (light/dark + menu-mode static) — navegable y con `pnpm build` pasando.

**Architecture:** App Next.js app-router como nuevo workspace. Consume `@lindaui/ui` (componentes) y `@lindaui/tokens` (CSS) vía `workspace:*`. El layout de Verona se porta componente a componente, reemplazando PrimeReact por @lindaui/ui y `pi pi-*` por un adaptador a `lucide-react`. El CSS de layout de Verona (SCSS) se copia y se conecta a los tokens OKLCH mediante un único archivo puente de variables; solo se porta lo necesario para menu-mode `static`.

**Tech Stack:** Next.js 16.2.9, React 19, TypeScript, @lindaui/ui (HeroUI v3), @lindaui/tokens (Tailwind v4 + OKLCH), lucide-react, sass, vitest + @testing-library/react (tests de unidades lógicas).

## Global Constraints

- Node ≥20, **pnpm@11.7.0** (sin npm/yarn). Todo `"type": "module"` / ESM.
- React **19**, Next.js **16.2.9** exacto.
- `@lindaui/ui` y `@lindaui/tokens` se consumen como **`workspace:*`** (no publicados).
- Componentes interactivos: **`"use client";` como primera línea**.
- Iconos: nunca `pi pi-*` literal en JSX nuevo fuera del adaptador; usar `<Icon name="..." />`.
- **Sin primeflex, sin ripple, sin input-style (outlined/filled), sin PrimeReact.**
- Menu-mode en Fase 0: **solo `static`** (+ toggle mobile). slim/slim-plus/overlay/horizontal, scale y presets de color → diferidos a Fase 4.
- AppConfig Fase 0: **solo light/dark**.
- Tests: solo queries semánticas (`getByRole`/`getByLabelText`), prohibido `getByTestId`.
- El workspace `apps/verona` entra a `pnpm-workspace.yaml` (ya cubre `apps/*`) y a turbo (hereda tasks `dev`/`build`).
- `dist/` de `@lindaui/ui` debe existir antes de `dev`: correr `pnpm build` una vez tras instalar.

---

## File Structure

```
apps/verona/
  package.json                 # workspace deps + scripts (dev/build/lint/test)
  next.config.mjs              # transpilePackages no necesario (dist prebuilt); strict
  tsconfig.json                # extiende ../../tsconfig.base.json, alias @/*
  postcss.config.mjs           # @tailwindcss/postcss
  vitest.config.ts             # jsdom + plugin-react (tests de lógica)
  vitest.setup.ts              # @testing-library/jest-dom
  next-env.d.ts                # generado por next
  types/layout.ts              # MenuModel, LayoutConfig/State, context props (recortado)
  lib/icon.tsx                 # <Icon name="pi pi-home"/> -> lucide-react
  lib/icon.test.tsx
  layout/context/layout-context.tsx   # LayoutProvider + useLayout (recortado a static)
  layout/context/menu-context.tsx     # MenuProvider + useMenu
  layout/context/layout-context.test.tsx
  layout/app-menu.tsx          # modelo de navegación (árbol idéntico a Verona)
  layout/app-menuitem.tsx      # item recursivo (solo path static)
  layout/app-submenu.tsx       # raíz del menú + genera breadcrumbs
  layout/app-menuitem.test.tsx
  layout/app-sidebar.tsx
  layout/app-topbar.tsx
  layout/app-breadcrumb.tsx
  layout/app-footer.tsx
  layout/app-config.tsx        # drawer light/dark
  layout/app-config.test.tsx
  layout/app-layout.tsx        # ensambla todo
  styles/
    globals.css                # @import tailwindcss + @lindaui/tokens/css + layout scss compilado
    layout/                    # SCSS copiado de Verona (subset static) + _bridge.scss
  public/fonts/                # Lato woff2 (copiados de Verona)
  app/layout.tsx               # root: html/body, fuente, providers, importa globals.css
  app/(main)/layout.tsx        # envuelve children en <AppLayout>
  app/(main)/page.tsx          # placeholder dashboard
  app/(full-page)/layout.tsx   # passthrough (para auth futuro)
```

---

### Task 1: Scaffold `apps/verona` que arranca en blanco

**Files:**
- Create: `apps/verona/package.json`
- Create: `apps/verona/next.config.mjs`
- Create: `apps/verona/tsconfig.json`
- Create: `apps/verona/postcss.config.mjs`
- Create: `apps/verona/styles/globals.css`
- Create: `apps/verona/app/layout.tsx`
- Create: `apps/verona/app/page.tsx` (placeholder temporal, se mueve en Task 8)

**Interfaces:**
- Produces: workspace `verona` con scripts `dev`/`build`/`lint`/`test`; alias TS `@/*` → raíz de la app.

- [ ] **Step 1: Crear `apps/verona/package.json`**

```json
{
  "name": "verona",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run"
  },
  "dependencies": {
    "@lindaui/tokens": "workspace:*",
    "@lindaui/ui": "workspace:*",
    "lucide-react": "^0.460.0",
    "next": "16.2.9",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.0.0",
    "tailwindcss": "^4.0.0",
    "sass": "^1.80.0",
    "typescript": "^5.5.0",
    "@types/node": "^20.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "vitest": "^2.1.0",
    "jsdom": "^25.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.5.0",
    "@testing-library/jest-dom": "^6.5.0"
  }
}
```

- [ ] **Step 2: Crear `apps/verona/next.config.mjs`**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  sassOptions: {
    includePaths: ['./styles']
  }
};

export default nextConfig;
```

- [ ] **Step 3: Crear `apps/verona/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "allowJs": true,
    "noEmit": true,
    "incremental": true,
    "jsx": "preserve",
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Crear `apps/verona/postcss.config.mjs`**

```js
export default {
  plugins: {
    '@tailwindcss/postcss': {}
  }
};
```

- [ ] **Step 5: Crear `apps/verona/styles/globals.css`** (las dos primeras líneas; el `@use` del SCSS de layout se agrega en Task 2)

```css
@import 'tailwindcss';
@import '@lindaui/tokens/css';
```

> Nota conocida: `@lindaui/tokens/css` ya trae preflight de Tailwind compilado; el `@import "tailwindcss"` de la app agrega utilities con scope de la app. Puede haber preflight duplicado (idempotente por cascada). Optimización a Fase 4.

- [ ] **Step 6: Crear `apps/verona/app/layout.tsx`** (root mínimo, sin providers todavía)

```tsx
import type { ReactNode } from 'react';
import '../styles/globals.css';

export const metadata = {
  title: 'Verona — @lindaui/ui',
  description: 'Verona template sobre @lindaui/ui'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 7: Crear `apps/verona/app/page.tsx`** (placeholder temporal)

```tsx
export default function Home() {
  return <main style={{ padding: 24 }}>verona scaffold ok</main>;
}
```

- [ ] **Step 8: Instalar y verificar build de la lib**

Run: `pnpm install && pnpm build`
Expected: instala el nuevo workspace `verona`; turbo buildea `@lindaui/tokens` y `@lindaui/ui` (genera `dist/`). Sin errores.

- [ ] **Step 9: Verificar que la app arranca**

Run: `pnpm --filter verona dev` (luego Ctrl-C)
Expected: Next levanta en `:3000`; `http://localhost:3000` muestra "verona scaffold ok". Sin errores de resolución de `@lindaui/tokens/css` ni `@lindaui/ui`.

- [ ] **Step 10: Commit**

```bash
git add apps/verona pnpm-workspace.yaml pnpm-lock.yaml
git commit -m "feat(verona): scaffold app Next 16.2.9 en el monorepo"
```

---

### Task 2: Bridge de estilos — SCSS de layout conectado a tokens

**Files:**
- Create: `apps/verona/styles/layout/` (copia subset de `verona-react-10.0.0/styles/layout/`)
- Create: `apps/verona/styles/layout/_bridge.scss` (variables PrimeReact/Verona → tokens)
- Create: `apps/verona/styles/layout/layout.scss` (entry, subset static)
- Create: `apps/verona/public/fonts/*` (Lato woff2)
- Modify: `apps/verona/styles/globals.css`
- Modify: `apps/verona/app/layout.tsx` (fuente Lato local)

**Interfaces:**
- Produces: clases CSS `.layout-container`, `.layout-topbar`, `.layout-sidebar`, `.layout-menu`, `.layout-breadcrumb`, `.layout-footer`, `.layout-content*`, `.layout-static-inactive`, `.layout-mobile-active` disponibles globalmente, resueltas contra tokens OKLCH.

- [ ] **Step 1: Copiar los SCSS de layout necesarios (subset static)**

Copiar desde `C:\Users\ccarb\Downloads\verona-react-10.0.0\styles\layout\` a `apps/verona/styles/layout/`:
`_main.scss`, `_topbar.scss`, `_breadcrumb.scss`, `_footer.scss`, `_content.scss`, `_typography.scss`, `_utils.scss`, `_config.scss`, `_responsive.scss`, `sidebar/_sidebar_vertical.scss`.
NO copiar: `_sidebar_slim.scss`, `_sidebar_slim_plus.scss`, `theme/_themes.scss`, `theme/_primary.scss` (definían menu-modes/temas diferidos).

Copiar fuentes Lato de `verona-react-10.0.0/styles/layout/fonts/*.woff2` a `apps/verona/public/fonts/`.

- [ ] **Step 2: Crear `apps/verona/styles/layout/_bridge.scss`** — define las vars que el SCSS espera, en términos de @lindaui/tokens

```scss
/* Puente: vars PrimeReact/Verona -> tokens @lindaui/tokens (light por defecto en :root) */
:root {
  --primary-color: var(--accent);
  --primary-color-text: var(--accent-foreground);
  --primary-400: var(--accent);
  --primary-500: var(--accent);
  --primary-800: var(--accent);

  --surface-ground: var(--surface);
  --surface-card: var(--surface-raised);
  --surface-overlay: var(--overlay);
  --surface-border: color-mix(in oklch, var(--text-color) 14%, transparent);
  --surface-hover: color-mix(in oklch, var(--text-color) 6%, transparent);

  --text-color: var(--text-color);
  --text-color-secondary: var(--text-secondary);

  --border-radius: var(--border-radius);
  --font-family: var(--font-sans);
  --transition-duration: 0.2s;
  --focus-ring: 0 0 0 2px var(--surface), 0 0 0 4px var(--accent);

  /* Verona-specific (--v-*) */
  --v-body-bg: var(--surface);
  --v-menuitem-text-color: var(--text-color);
  --v-menuitem-text-color-secondary: var(--text-secondary);
  --v-menuitem-hover-bg: var(--surface-hover);
  --v-overlay-menuitem-text-color: var(--text-color);
  --v-overlay-menuitem-hover-bg: var(--surface-hover);
  --v-topbar-search-button-bg: var(--surface-hover);
  --v-topbar-search-button-icon-color: var(--text-secondary);
  --menuitem-text-color: var(--text-color);
}
```

> `--text-color`/`--border-radius` ya existen en tokens; redefinirlos con su propio valor es no-op intencional (documenta el contrato). El `.dark` de @lindaui/tokens ya re-define `--surface`/`--text-color`/etc, así que el bridge hereda dark automáticamente.

- [ ] **Step 3: Crear `apps/verona/styles/layout/layout.scss`** (entry recortado)

```scss
$breakpoint: 992px !default;

@import './bridge';
@import './main';
@import './sidebar_vertical';
@import './topbar';
@import './breadcrumb';
@import './footer';
@import './content';
@import './responsive';
@import './typography';
@import './utils';
@import './config';
```

> `_sidebar_vertical.scss` está en `sidebar/`; moverlo a `styles/layout/sidebar_vertical.scss` o ajustar el path del import. Mantener `@import './sidebar/sidebar_vertical'` si se conserva la carpeta.

- [ ] **Step 4: Conectar el SCSS en `globals.css`** — agregar tercera línea

```css
@import 'tailwindcss';
@import '@lindaui/tokens/css';
@import './layout/layout.scss';
```

- [ ] **Step 5: Cargar la fuente Lato en `app/layout.tsx`**

```tsx
import type { ReactNode } from 'react';
import localFont from 'next/font/local';
import '../styles/globals.css';

const lato = localFont({
  src: [
    { path: '../public/fonts/lato-v17-latin-ext_latin-regular.woff2', weight: '400', style: 'normal' },
    { path: '../public/fonts/lato-v17-latin-ext_latin-700.woff2', weight: '700', style: 'normal' },
    { path: '../public/fonts/lato-v17-latin-ext_latin-300.woff2', weight: '300', style: 'normal' }
  ],
  variable: '--font-lato',
  display: 'swap'
});

export const metadata = {
  title: 'Verona — @lindaui/ui',
  description: 'Verona template sobre @lindaui/ui'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={lato.variable}>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 6: Verificar compilación de estilos**

Run: `pnpm --filter verona dev` (luego Ctrl-C)
Expected: compila sin errores de SCSS (variables resueltas, sin `undefined variable`). La página placeholder hereda la fuente Lato y el fondo de surface.

- [ ] **Step 7: Commit**

```bash
git add apps/verona/styles apps/verona/public apps/verona/app/layout.tsx apps/verona/styles/globals.css
git commit -m "feat(verona): bridge de estilos SCSS de layout sobre tokens @ts"
```

---

### Task 3: Tipos + LayoutContext + MenuContext (recortados a static)

**Files:**
- Create: `apps/verona/types/layout.ts`
- Create: `apps/verona/layout/context/layout-context.tsx`
- Create: `apps/verona/layout/context/menu-context.tsx`
- Test: `apps/verona/layout/context/layout-context.test.tsx`
- Create: `apps/verona/vitest.config.ts`
- Create: `apps/verona/vitest.setup.ts`

**Interfaces:**
- Produces:
  - `types/layout.ts`: `MenuModel`, `Breadcrumb`, `LayoutConfig = { colorScheme: 'light'|'dark'; menuMode: 'static' }`, `LayoutState`, `LayoutContextProps`, `MenuContextProps`.
  - `layout-context.tsx`: `LayoutProvider` (componente), `useLayout(): LayoutContextProps`. Default config `{ colorScheme: 'light', menuMode: 'static' }`. Expone `onMenuToggle()`, `isDesktop()`, `isSidebarActive()`, `breadcrumbs`, `setBreadcrumbs`, `openTab`, `closeTab`, `tabs`, y stubs `isSlim`/`isSlimPlus`/`isHorizontal` que retornan `false`.
  - `menu-context.tsx`: `MenuProvider`, `useMenu(): { activeMenu: string; setActiveMenu: (k: string) => void }`.

- [ ] **Step 1: Crear `apps/verona/vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts']
  },
  resolve: {
    alias: { '@': new URL('.', import.meta.url).pathname }
  }
});
```

- [ ] **Step 2: Crear `apps/verona/vitest.setup.ts`**

```ts
import '@testing-library/jest-dom';
```

- [ ] **Step 3: Crear `apps/verona/types/layout.ts`**

```ts
import type { Dispatch, SetStateAction, HTMLAttributeAnchorTarget } from 'react';

export type ColorScheme = 'light' | 'dark';
export type MenuMode = 'static';

export interface MenuModel {
  label: string;
  icon?: string;
  items?: MenuModel[];
  to?: string;
  url?: string;
  target?: HTMLAttributeAnchorTarget;
  class?: string;
  visible?: boolean;
  disabled?: boolean;
  seperator?: boolean;
}

export interface Breadcrumb {
  labels?: string[];
  to?: string;
}

export interface LayoutConfig {
  colorScheme: ColorScheme;
  menuMode: MenuMode;
}

export interface LayoutState {
  staticMenuDesktopInactive: boolean;
  staticMenuMobileActive: boolean;
  configSidebarVisible: boolean;
}

export interface Tab {
  label: string;
  to: string;
}

export interface LayoutContextProps {
  layoutConfig: LayoutConfig;
  setLayoutConfig: Dispatch<SetStateAction<LayoutConfig>>;
  layoutState: LayoutState;
  setLayoutState: Dispatch<SetStateAction<LayoutState>>;
  onMenuToggle: () => void;
  isDesktop: () => boolean;
  isSidebarActive: () => boolean;
  isSlim: () => boolean;
  isSlimPlus: () => boolean;
  isHorizontal: () => boolean;
  breadcrumbs: Breadcrumb[];
  setBreadcrumbs: Dispatch<SetStateAction<Breadcrumb[]>>;
  tabs: Tab[];
  openTab: (tab: Tab) => void;
  closeTab: (index: number) => void;
}

export interface MenuContextProps {
  activeMenu: string;
  setActiveMenu: (key: string) => void;
}
```

- [ ] **Step 4: Escribir el test que falla — `layout-context.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react';
import { LayoutProvider, useLayout } from './layout-context';

function Probe() {
  const { layoutConfig, isSlim, isDesktop } = useLayout();
  return (
    <div>
      <span>scheme:{layoutConfig.colorScheme}</span>
      <span>mode:{layoutConfig.menuMode}</span>
      <span>slim:{String(isSlim())}</span>
      <span>desktop-fn:{typeof isDesktop}</span>
    </div>
  );
}

test('LayoutProvider expone config default static/light y stubs en false', () => {
  render(
    <LayoutProvider>
      <Probe />
    </LayoutProvider>
  );
  expect(screen.getByText('scheme:light')).toBeInTheDocument();
  expect(screen.getByText('mode:static')).toBeInTheDocument();
  expect(screen.getByText('slim:false')).toBeInTheDocument();
  expect(screen.getByText('desktop-fn:function')).toBeInTheDocument();
});
```

- [ ] **Step 5: Correr el test para verificar que falla**

Run: `pnpm --filter verona test -- layout-context`
Expected: FAIL — `Cannot find module './layout-context'`.

- [ ] **Step 6: Crear `apps/verona/layout/context/menu-context.tsx`**

```tsx
'use client';
import { createContext, useContext, useState, type ReactNode } from 'react';
import type { MenuContextProps } from '@/types/layout';

const MenuContext = createContext<MenuContextProps>({} as MenuContextProps);

export function MenuProvider({ children }: { children: ReactNode }) {
  const [activeMenu, setActiveMenu] = useState('');
  return <MenuContext.Provider value={{ activeMenu, setActiveMenu }}>{children}</MenuContext.Provider>;
}

export const useMenu = () => useContext(MenuContext);
```

- [ ] **Step 7: Crear `apps/verona/layout/context/layout-context.tsx`**

```tsx
'use client';
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { LayoutConfig, LayoutState, LayoutContextProps, Breadcrumb, Tab } from '@/types/layout';

const LayoutContext = createContext<LayoutContextProps>({} as LayoutContextProps);

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>({ colorScheme: 'light', menuMode: 'static' });
  const [layoutState, setLayoutState] = useState<LayoutState>({
    staticMenuDesktopInactive: false,
    staticMenuMobileActive: false,
    configSidebarVisible: false
  });
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);
  const [tabs, setTabs] = useState<Tab[]>([]);

  const isDesktop = useCallback(() => typeof window !== 'undefined' && window.innerWidth > 991, []);

  const onMenuToggle = useCallback(() => {
    setLayoutState((prev) =>
      isDesktop()
        ? { ...prev, staticMenuDesktopInactive: !prev.staticMenuDesktopInactive }
        : { ...prev, staticMenuMobileActive: !prev.staticMenuMobileActive }
    );
  }, [isDesktop]);

  const isSidebarActive = useCallback(() => layoutState.staticMenuMobileActive, [layoutState.staticMenuMobileActive]);
  const openTab = useCallback((tab: Tab) => setTabs((prev) => [...prev, tab]), []);
  const closeTab = useCallback((index: number) => setTabs((prev) => prev.filter((_, i) => i !== index)), []);

  const value: LayoutContextProps = {
    layoutConfig,
    setLayoutConfig,
    layoutState,
    setLayoutState,
    onMenuToggle,
    isDesktop,
    isSidebarActive,
    isSlim: () => false,
    isSlimPlus: () => false,
    isHorizontal: () => false,
    breadcrumbs,
    setBreadcrumbs,
    tabs,
    openTab,
    closeTab
  };

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
}

export const useLayout = () => useContext(LayoutContext);
```

- [ ] **Step 8: Correr el test para verificar que pasa**

Run: `pnpm --filter verona test -- layout-context`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add apps/verona/types apps/verona/layout/context apps/verona/vitest.config.ts apps/verona/vitest.setup.ts
git commit -m "feat(verona): tipos + LayoutContext/MenuContext recortados a static"
```

---

### Task 4: Adaptador de iconos `pi pi-*` → lucide-react

**Files:**
- Create: `apps/verona/lib/icon.tsx`
- Test: `apps/verona/lib/icon.test.tsx`

**Interfaces:**
- Produces: `Icon({ name, className }: { name?: string; className?: string })` — parsea un string tipo `"pi pi-fw pi-home"`, extrae el token `pi-<x>`, lo mapea a un componente de `lucide-react`. Token desconocido → `Circle` (fallback). `name` vacío → no renderiza nada (`null`).

- [ ] **Step 1: Escribir el test que falla — `icon.test.tsx`**

```tsx
import { render } from '@testing-library/react';
import { Icon } from './icon';

test('renderiza un svg para un token pi conocido', () => {
  const { container } = render(<Icon name="pi pi-fw pi-home" />);
  expect(container.querySelector('svg')).toBeInTheDocument();
});

test('token desconocido cae al fallback (svg igual presente)', () => {
  const { container } = render(<Icon name="pi pi-zzz-unknown" />);
  expect(container.querySelector('svg')).toBeInTheDocument();
});

test('name vacío no renderiza nada', () => {
  const { container } = render(<Icon name="" />);
  expect(container.querySelector('svg')).not.toBeInTheDocument();
});

test('propaga className al svg', () => {
  const { container } = render(<Icon name="pi pi-home" className="layout-menuitem-icon" />);
  expect(container.querySelector('svg')?.getAttribute('class')).toContain('layout-menuitem-icon');
});
```

- [ ] **Step 2: Correr el test para verificar que falla**

Run: `pnpm --filter verona test -- icon`
Expected: FAIL — `Cannot find module './icon'`.

- [ ] **Step 3: Crear `apps/verona/lib/icon.tsx`** (mapa de los iconos que usa el shell en Fase 0)

```tsx
import {
  Home, Image, Star, IdCard, CheckSquare, Bookmark, AlertCircle, Box, Table, List,
  Share2, Tablet, Copy, Bars3 as Bars, MessageSquare, File, BarChart3, CircleOff,
  LayoutGrid, Calendar, MessagesSquare, Folder, Inbox, Pencil, Gem, Eye, Globe,
  Compass, Palette, Monitor, Briefcase, User, SignIn, XCircle, Lock, UserPlus,
  HelpCircle, Phone, DollarSign, History, Plus, ShoppingCart, AlignLeft, Download,
  InfoCircle, Wallet, AlignJustify, Search, Cog, Power, AngleDown, Check, Minus,
  CircleDot, Circle, type LucideIcon
} from 'lucide-react';

// lucide no exporta algunos nombres pi 1:1; mapear a los equivalentes reales.
const MAP: Record<string, LucideIcon> = {
  'home': Home, 'image': Image, 'star': Star, 'id-card': IdCard, 'check-square': CheckSquare,
  'bookmark': Bookmark, 'exclamation-circle': AlertCircle, 'box': Box, 'table': Table,
  'list': List, 'share-alt': Share2, 'tablet': Tablet, 'clone': Copy, 'bars': Bars,
  'comment': MessageSquare, 'comments': MessagesSquare, 'file': File, 'chart-bar': BarChart3,
  'circle-off': CircleOff, 'th-large': LayoutGrid, 'calendar': Calendar, 'folder': Folder,
  'inbox': Inbox, 'pencil': Pencil, 'prime': Gem, 'eye': Eye, 'eye-slash': Eye, 'globe': Globe,
  'compass': Compass, 'palette': Palette, 'desktop': Monitor, 'briefcase': Briefcase,
  'user': User, 'user-plus': UserPlus, 'sign-in': SignIn, 'times-circle': XCircle, 'lock': Lock,
  'question': HelpCircle, 'question-circle': HelpCircle, 'cog': Cog, 'envelope': MessageSquare,
  'phone': Phone, 'dollar': DollarSign, 'history': History, 'plus': Plus, 'shopping-cart': ShoppingCart,
  'align-left': AlignLeft, 'download': Download, 'info-circle': InfoCircle, 'wallet': Wallet,
  'search': Search, 'power-off': Power, 'angle-down': AngleDown, 'check': Check, 'minus': Minus,
  'circle-fill': CircleDot
};

function tokenFrom(name: string): string | null {
  const parts = name.split(/\s+/).filter(Boolean);
  for (const p of parts) {
    if (p === 'pi' || p === 'pi-fw') continue;
    if (p.startsWith('pi-')) return p.slice(3);
  }
  return null;
}

export function Icon({ name, className }: { name?: string; className?: string }) {
  if (!name) return null;
  const token = tokenFrom(name);
  const Cmp = (token && MAP[token]) || Circle;
  return <Cmp className={className} size={16} aria-hidden />;
}
```

> Nota: si algún identificador de lucide del import no existe con ese nombre exacto en la versión instalada (p.ej. `SignIn`, `AngleDown`, `Bars3`, `InfoCircle`), reemplazar por el equivalente real de lucide (`LogIn`, `ChevronDown`, `Menu`, `Info`) y ajustar el `MAP`. Verificar con `node -e "console.log(Object.keys(require('lucide-react')))"`.

- [ ] **Step 4: Correr el test para verificar que pasa**

Run: `pnpm --filter verona test -- icon`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add apps/verona/lib/icon.tsx apps/verona/lib/icon.test.tsx
git commit -m "feat(verona): adaptador de iconos pi-* -> lucide-react"
```

---

### Task 5: Menú jerárquico — AppMenu, AppMenuitem, AppSubMenu, AppSidebar

**Files:**
- Create: `apps/verona/layout/app-menu.tsx`
- Create: `apps/verona/layout/app-menuitem.tsx`
- Create: `apps/verona/layout/app-submenu.tsx`
- Create: `apps/verona/layout/app-sidebar.tsx`
- Test: `apps/verona/layout/app-menuitem.test.tsx`

**Interfaces:**
- Consumes: `useLayout`, `useMenu` (Task 3); `Icon` (Task 4); `MenuModel`, `Breadcrumb` (Task 3 types).
- Produces:
  - `AppMenu` (default export): renderiza `<AppSubMenu model={MODEL} />` con el árbol de navegación completo de Verona.
  - `AppMenuitem` (default export): item recursivo; props `{ item: MenuModel; index: number; parentKey?: string; root?: boolean }`. Calcula `key` y `active`; resalta `active-route` cuando `pathname === item.to`.
  - `AppSubMenu` (default export): `{ model: MenuModel[] }`; envuelve en `<MenuProvider>`, renderiza `<ul className="layout-menu">`, y en `useEffect` llama `setBreadcrumbs(generateBreadcrumbs(model))`.
  - `AppSidebar` (default export): `<div className="layout-menu-container"><MenuProvider><AppMenu/></MenuProvider></div>`.

- [ ] **Step 1: Crear `apps/verona/layout/app-menu.tsx`** (modelo idéntico al de Verona)

```tsx
import AppSubMenu from './app-submenu';
import type { MenuModel } from '@/types/layout';

const MODEL: MenuModel[] = [
  {
    label: 'Dashboards', icon: 'pi pi-home',
    items: [
      { label: 'SaaS', icon: 'pi pi-fw pi-home', to: '/' },
      { label: 'Sales', icon: 'pi pi-fw pi-image', to: '/dashboard-sales' }
    ]
  },
  {
    label: 'UI Kit', icon: 'pi pi-fw pi-star',
    items: [
      { label: 'Form Layout', icon: 'pi pi-fw pi-id-card', to: '/uikit/formlayout' },
      { label: 'Input', icon: 'pi pi-fw pi-check-square', to: '/uikit/input' },
      { label: 'Float Label', icon: 'pi pi-fw pi-bookmark', to: '/uikit/floatlabel' },
      { label: 'Invalid State', icon: 'pi pi-fw pi-exclamation-circle', to: '/uikit/invalidstate' },
      { label: 'Button', icon: 'pi pi-fw pi-box', to: '/uikit/button' },
      { label: 'Table', icon: 'pi pi-fw pi-table', to: '/uikit/table' },
      { label: 'List', icon: 'pi pi-fw pi-list', to: '/uikit/list' },
      { label: 'Tree', icon: 'pi pi-fw pi-share-alt', to: '/uikit/tree' },
      { label: 'Panel', icon: 'pi pi-fw pi-tablet', to: '/uikit/panel' },
      { label: 'Overlay', icon: 'pi pi-fw pi-clone', to: '/uikit/overlay' },
      { label: 'Media', icon: 'pi pi-fw pi-image', to: '/uikit/media' },
      { label: 'Menu', icon: 'pi pi-fw pi-bars', to: '/uikit/menu' },
      { label: 'Message', icon: 'pi pi-fw pi-comment', to: '/uikit/message' },
      { label: 'File', icon: 'pi pi-fw pi-file', to: '/uikit/file' },
      { label: 'Chart', icon: 'pi pi-fw pi-chart-bar', to: '/uikit/charts' },
      { label: 'Misc', icon: 'pi pi-fw pi-circle-off', to: '/uikit/misc' }
    ]
  },
  {
    label: 'Apps', icon: 'pi pi-th-large',
    items: [
      {
        label: 'Blog', icon: 'pi pi-fw pi-comment',
        items: [
          { label: 'List', icon: 'pi pi-fw pi-image', to: '/apps/blog/list' },
          { label: 'Detail', icon: 'pi pi-fw pi-list', to: '/apps/blog/detail' },
          { label: 'Edit', icon: 'pi pi-fw pi-pencil', to: '/apps/blog/edit' }
        ]
      },
      { label: 'Calendar', icon: 'pi pi-fw pi-calendar', to: '/apps/calendar' },
      { label: 'Chat', icon: 'pi pi-fw pi-comments', to: '/apps/chat' },
      { label: 'Files', icon: 'pi pi-fw pi-folder', to: '/apps/files' },
      {
        label: 'Mail', icon: 'pi pi-fw pi-envelope',
        items: [
          { label: 'Inbox', icon: 'pi pi-fw pi-inbox', to: '/apps/mail/inbox' },
          { label: 'Compose', icon: 'pi pi-fw pi-pencil', to: '/apps/mail/compose' },
          { label: 'Detail', icon: 'pi pi-fw pi-comment', to: '/apps/mail/detail/1000' }
        ]
      },
      { label: 'Task List', icon: 'pi pi-fw pi-check-square', to: '/apps/tasklist' }
    ]
  },
  {
    label: 'Prime Blocks', icon: 'pi pi-fw pi-prime',
    items: [
      { label: 'Free Blocks', icon: 'pi pi-fw pi-eye', to: '/blocks' },
      { label: 'All Blocks', icon: 'pi pi-fw pi-globe', url: 'https://blocks.primevue.org', target: '_blank' }
    ]
  },
  {
    label: 'Utilities', icon: 'pi pi-fw pi-compass',
    items: [
      { label: 'PrimeIcons', icon: 'pi pi-fw pi-prime', to: '/utilities/icons' },
      { label: 'Colors', icon: 'pi pi-fw pi-palette', to: '/utilities/colors' }
    ]
  },
  {
    label: 'Pages', icon: 'pi pi-fw pi-briefcase',
    items: [
      { label: 'Landing', icon: 'pi pi-fw pi-globe', to: '/landing' },
      {
        label: 'Auth', icon: 'pi pi-fw pi-user',
        items: [
          { label: 'Login', icon: 'pi pi-fw pi-sign-in', to: '/auth/login' },
          { label: 'Error', icon: 'pi pi-fw pi-times-circle', to: '/auth/error' },
          { label: 'Access Denied', icon: 'pi pi-fw pi-lock', to: '/auth/access' },
          { label: 'Register', icon: 'pi pi-fw pi-user-plus', to: '/auth/register' },
          { label: 'Forgot Password', icon: 'pi pi-fw pi-question', to: '/auth/forgotpassword' },
          { label: 'New Password', icon: 'pi pi-fw pi-cog', to: '/auth/newpassword' },
          { label: 'Verification', icon: 'pi pi-fw pi-envelope', to: '/auth/verification' },
          { label: 'Lock Screen', icon: 'pi pi-fw pi-eye-slash', to: '/auth/lockscreen' }
        ]
      },
      { label: 'Crud', icon: 'pi pi-fw pi-pencil', to: '/pages/crud' },
      { label: 'Timeline', icon: 'pi pi-fw pi-calendar', to: '/pages/timeline' },
      { label: 'Invoice', icon: 'pi pi-fw pi-dollar', to: '/pages/invoice' },
      { label: 'Help', icon: 'pi pi-fw pi-question-circle', to: '/pages/help' },
      { label: 'Not Found', icon: 'pi pi-fw pi-exclamation-circle', to: '/pages/notfound' },
      { label: 'Empty', icon: 'pi pi-fw pi-circle-off', to: '/pages/empty' },
      { label: 'Contact Us', icon: 'pi pi-fw pi-phone', to: '/pages/contact' }
    ]
  },
  {
    label: 'E-Commerce', icon: 'pi pi-fw pi-wallet',
    items: [
      { label: 'Product Overview', icon: 'pi pi-fw pi-image', to: '/ecommerce/product-overview' },
      { label: 'Product List', icon: 'pi pi-fw pi-list', to: '/ecommerce/product-list' },
      { label: 'New Product', icon: 'pi pi-fw pi-plus', to: '/ecommerce/new-product' },
      { label: 'Shopping Cart', icon: 'pi pi-fw pi-shopping-cart', to: '/ecommerce/shopping-cart' },
      { label: 'Checkout Form', icon: 'pi pi-fw pi-check-square', to: '/ecommerce/checkout-form' },
      { label: 'Order History', icon: 'pi pi-fw pi-history', to: '/ecommerce/order-history' },
      { label: 'Order Summary', icon: 'pi pi-fw pi-file', to: '/ecommerce/order-summary' }
    ]
  },
  {
    label: 'User Management', icon: 'pi pi-fw pi-user',
    items: [
      { label: 'List', icon: 'pi pi-fw pi-list', to: '/profile/list' },
      { label: 'Create', icon: 'pi pi-fw pi-plus', to: '/profile/create' }
    ]
  },
  {
    label: 'Start', icon: 'pi pi-fw pi-download',
    items: [
      { label: 'Buy Now', icon: 'pi pi-fw pi-shopping-cart', url: 'https://www.primefaces.org/store' },
      { label: 'Documentation', icon: 'pi pi-fw pi-info-circle', to: '/documentation' }
    ]
  }
];

export default function AppMenu() {
  return <AppSubMenu model={MODEL} />;
}
```

> Se omiten del modelo los items externos (PrimeFlex/Figma) y la rama "Hierarchy" de submenús de demo, irrelevantes para navegación real. Se pueden reañadir en Fase 4.

- [ ] **Step 2: Escribir el test que falla — `app-menuitem.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react';
import AppMenuitem from './app-menuitem';
import { LayoutProvider } from './context/layout-context';
import { MenuProvider } from './context/menu-context';

vi.mock('next/navigation', () => ({
  usePathname: () => '/uikit/input',
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: vi.fn() })
}));

function wrap(ui: React.ReactNode) {
  return render(
    <LayoutProvider>
      <MenuProvider>
        <ul>{ui}</ul>
      </MenuProvider>
    </LayoutProvider>
  );
}

test('item con to renderiza un link con su label', () => {
  wrap(<AppMenuitem item={{ label: 'Input', icon: 'pi pi-fw pi-check-square', to: '/uikit/input' }} index={0} />);
  const link = screen.getByRole('link', { name: /Input/ });
  expect(link).toHaveAttribute('href', '/uikit/input');
});

test('marca active-route cuando el pathname coincide', () => {
  wrap(<AppMenuitem item={{ label: 'Input', to: '/uikit/input' }} index={0} />);
  expect(screen.getByRole('link', { name: /Input/ })).toHaveClass('active-route');
});

test('item sin to con hijos renderiza un toggler (no link)', () => {
  wrap(
    <AppMenuitem
      item={{ label: 'Mail', items: [{ label: 'Inbox', to: '/apps/mail/inbox' }] }}
      index={0}
      root
    />
  );
  expect(screen.getByText('Mail')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Inbox/ })).toHaveAttribute('href', '/apps/mail/inbox');
});
```

- [ ] **Step 3: Correr el test para verificar que falla**

Run: `pnpm --filter verona test -- app-menuitem`
Expected: FAIL — `Cannot find module './app-menuitem'`.

- [ ] **Step 4: Crear `apps/verona/layout/app-menuitem.tsx`** (port recortado: solo path static)

```tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useLayout } from './context/layout-context';
import { useMenu } from './context/menu-context';
import { Icon } from '@/lib/icon';
import type { MenuModel } from '@/types/layout';

interface Props {
  item: MenuModel;
  index: number;
  parentKey?: string;
  root?: boolean;
}

export default function AppMenuitem({ item, index, parentKey, root }: Props) {
  const { activeMenu, setActiveMenu } = useMenu();
  const { setLayoutState, isDesktop } = useLayout();
  const pathname = usePathname();

  const key = parentKey ? `${parentKey}-${index}` : String(index);
  const isActiveRoute = !!item.to && pathname === item.to;
  const active = activeMenu === key || (!!activeMenu && activeMenu.startsWith(key + '-'));

  useEffect(() => {
    if (isActiveRoute) setActiveMenu(key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const itemClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (item.disabled) {
      event.preventDefault();
      return;
    }
    if (item.items) {
      setActiveMenu(active ? (parentKey ?? '') : key);
    } else {
      if (!isDesktop()) setLayoutState((prev) => ({ ...prev, staticMenuMobileActive: false }));
      setActiveMenu(key);
    }
  };

  const subMenu =
    item.items && item.visible !== false ? (
      <ul>
        {item.items.map((child, i) => (
          <AppMenuitem item={child} index={i} parentKey={key} key={child.label} />
        ))}
      </ul>
    ) : null;

  return (
    <li className={[root ? 'layout-root-menuitem' : '', active ? 'active-menuitem' : ''].filter(Boolean).join(' ')}>
      {root && item.visible !== false && (
        <div className="layout-menuitem-root-text">
          <span>{item.label}</span>
        </div>
      )}

      {(!item.to || item.items) && item.visible !== false ? (
        <a
          href={item.url}
          onClick={itemClick}
          className={item.class}
          target={item.target}
          tabIndex={0}
        >
          <Icon name={item.icon} className="layout-menuitem-icon" />
          <span className="layout-menuitem-text">{item.label}</span>
          {item.items && <Icon name="pi pi-angle-down" className="layout-submenu-toggler" />}
        </a>
      ) : null}

      {item.to && !item.items && item.visible !== false ? (
        <Link
          href={item.to}
          onClick={itemClick}
          className={[item.class, isActiveRoute ? 'active-route' : ''].filter(Boolean).join(' ')}
          tabIndex={0}
        >
          <Icon name={item.icon} className="layout-menuitem-icon" />
          <span className="layout-menuitem-text">{item.label}</span>
        </Link>
      ) : null}

      {subMenu}
    </li>
  );
}
```

- [ ] **Step 5: Crear `apps/verona/layout/app-submenu.tsx`**

```tsx
'use client';
import { useEffect } from 'react';
import AppMenuitem from './app-menuitem';
import { MenuProvider } from './context/menu-context';
import { useLayout } from './context/layout-context';
import type { MenuModel, Breadcrumb } from '@/types/layout';

function generateBreadcrumbs(model: MenuModel[]): Breadcrumb[] {
  const crumbs: Breadcrumb[] = [];
  const walk = (item: MenuModel, labels: string[] = []) => {
    const next = item.label ? [...labels, item.label] : labels;
    item.items?.forEach((child) => walk(child, next));
    if (item.to) crumbs.push({ labels: next, to: item.to });
  };
  model.forEach((item) => walk(item));
  return crumbs;
}

export default function AppSubMenu({ model }: { model: MenuModel[] }) {
  const { setBreadcrumbs } = useLayout();

  useEffect(() => {
    setBreadcrumbs(generateBreadcrumbs(model));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MenuProvider>
      <ul className="layout-menu">
        {model.map((item, i) =>
          !item.seperator ? (
            <AppMenuitem item={item} root index={i} key={item.label} />
          ) : (
            <li className="menu-separator" key={`sep-${i}`} />
          )
        )}
      </ul>
    </MenuProvider>
  );
}
```

- [ ] **Step 6: Crear `apps/verona/layout/app-sidebar.tsx`**

```tsx
'use client';
import AppMenu from './app-menu';
import { MenuProvider } from './context/menu-context';

export default function AppSidebar() {
  return (
    <div className="layout-menu-container">
      <MenuProvider>
        <AppMenu />
      </MenuProvider>
    </div>
  );
}
```

- [ ] **Step 7: Correr el test para verificar que pasa**

Run: `pnpm --filter verona test -- app-menuitem`
Expected: PASS (3 tests).

- [ ] **Step 8: Commit**

```bash
git add apps/verona/layout/app-menu.tsx apps/verona/layout/app-menuitem.tsx apps/verona/layout/app-submenu.tsx apps/verona/layout/app-sidebar.tsx apps/verona/layout/app-menuitem.test.tsx
git commit -m "feat(verona): menú jerárquico (AppMenu/Menuitem/SubMenu/Sidebar) sobre @lindaui/ui"
```

---

### Task 6: AppTopbar, AppBreadcrumb, AppFooter

**Files:**
- Create: `apps/verona/layout/app-topbar.tsx`
- Create: `apps/verona/layout/app-breadcrumb.tsx`
- Create: `apps/verona/layout/app-footer.tsx`

**Interfaces:**
- Consumes: `useLayout` (Task 3); `Icon` (Task 4); `@lindaui/ui/search-field`, `@lindaui/ui/avatar`, `@lindaui/ui/menu`.
- Produces:
  - `AppTopbar` (default export): logo + botón de menú (llama `onMenuToggle`) + `SearchField` + menú de perfil con avatar.
  - `AppBreadcrumb` (default export): `{ className?: string }`; lee `breadcrumbs` del contexto, casa contra `pathname`, renderiza `<nav className="layout-breadcrumb">`.
  - `AppFooter` (default export): footer estático.

> Verificar la API real de cada wrapper antes de escribir props (regla del CLAUDE.md): `@lindaui/ui/search-field`, `@lindaui/ui/avatar`, `@lindaui/ui/menu`. Si la firma difiere de lo escrito acá, adaptar. El menú de perfil usa el wrapper ergonómico de `menu` (`trigger` = contenido del botón, NO un `<button>`).

- [ ] **Step 1: Crear `apps/verona/layout/app-breadcrumb.tsx`**

```tsx
'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, Fragment } from 'react';
import { useLayout } from './context/layout-context';
import { Icon } from '@/lib/icon';
import type { Breadcrumb } from '@/types/layout';

export default function AppBreadcrumb({ className }: { className?: string }) {
  const pathname = usePathname();
  const { breadcrumbs } = useLayout();
  const [crumb, setCrumb] = useState<Breadcrumb | null>(null);

  useEffect(() => {
    const found = breadcrumbs.find((c) => c.to?.replace(/\/$/, '') === pathname.replace(/\/$/, ''));
    setCrumb(found ?? null);
  }, [pathname, breadcrumbs]);

  return (
    <div className={className}>
      <nav className="layout-breadcrumb">
        <ol>
          <li>
            <Link href="/" style={{ color: 'inherit' }} aria-label="Home">
              <Icon name="pi pi-home" />
            </Link>
          </li>
          <li className="layout-breadcrumb-chevron"> / </li>
          {crumb && crumb.labels && pathname !== '/' ? (
            crumb.labels.map((label, i) => (
              <Fragment key={i}>
                {i !== 0 && <li className="layout-breadcrumb-chevron"> / </li>}
                <li>{label}</li>
              </Fragment>
            ))
          ) : (
            pathname === '/' && <li>SaaS Dashboard</li>
          )}
        </ol>
      </nav>
    </div>
  );
}
```

- [ ] **Step 2: Crear `apps/verona/layout/app-footer.tsx`**

```tsx
'use client';
export default function AppFooter() {
  return (
    <div className="layout-footer mt-auto">
      <div className="footer-start">
        <span className="app-name">Verona</span>
      </div>
      <div className="footer-right">
        <span>© Your Organization</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Crear `apps/verona/layout/app-topbar.tsx`**

```tsx
'use client';
import Link from 'next/link';
import { useLayout } from './context/layout-context';
import { Icon } from '@/lib/icon';
import { SearchField } from '@lindaui/ui/search-field';
import { Avatar } from '@lindaui/ui/avatar';
import { Menu, MenuItem } from '@lindaui/ui/menu';

export default function AppTopbar() {
  const { onMenuToggle } = useLayout();

  return (
    <div className="layout-topbar">
      <Link href="/" className="app-logo">
        <span className="app-name">Verona</span>
      </Link>

      <button className="topbar-menubutton p-link" type="button" onClick={onMenuToggle} aria-label="Toggle menu">
        <span />
      </button>

      <div className="topbar-search">
        <SearchField aria-label="Search" placeholder="Search" />
      </div>

      <div className="topbar-profile">
        <Menu
          trigger={
            <span className="topbar-profile-button">
              <Avatar name="Gene Russell" />
              <span className="profile-details">
                <span className="profile-name">Gene Russell</span>
                <span className="profile-job">Developer</span>
              </span>
              <Icon name="pi pi-angle-down" />
            </span>
          }
        >
          <MenuItem id="profile">Profile</MenuItem>
          <MenuItem id="settings">Settings</MenuItem>
          <MenuItem id="signout">Sign Out</MenuItem>
        </Menu>
      </div>
    </div>
  );
}
```

> Si los named exports reales de `@lindaui/ui/menu`/`search-field`/`avatar` difieren (revisar sus `.d.ts` en `packages/ui/dist`), ajustar imports y props. El objetivo es: search funcional + menú de perfil accesible (`role="menu"`).

- [ ] **Step 4: Verificar tipos/compilación**

Run: `pnpm --filter verona exec tsc --noEmit`
Expected: sin errores en `app-topbar.tsx`/`app-breadcrumb.tsx`/`app-footer.tsx`. (Si falla por firma de un wrapper, ajustar props según el `.d.ts`.)

- [ ] **Step 5: Commit**

```bash
git add apps/verona/layout/app-topbar.tsx apps/verona/layout/app-breadcrumb.tsx apps/verona/layout/app-footer.tsx
git commit -m "feat(verona): topbar (search + perfil), breadcrumb y footer"
```

---

### Task 7: AppConfig — drawer light/dark

**Files:**
- Create: `apps/verona/layout/app-config.tsx`
- Test: `apps/verona/layout/app-config.test.tsx`

**Interfaces:**
- Consumes: `useLayout` (Task 3); `@lindaui/ui/drawer`, `@lindaui/ui/radio-group`, `@lindaui/ui/button`.
- Produces: `AppConfig` (default export): botón flotante (engranaje) que abre un drawer derecho con un radio-group Light/Dark. Al elegir dark, agrega la clase `dark` a `document.documentElement` y setea `layoutConfig.colorScheme`; light la quita.

- [ ] **Step 1: Escribir el test que falla — `app-config.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AppConfig from './app-config';
import { LayoutProvider } from './context/layout-context';

function setup() {
  return render(
    <LayoutProvider>
      <AppConfig />
    </LayoutProvider>
  );
}

test('elegir Dark agrega la clase dark al html', async () => {
  const user = userEvent.setup();
  setup();
  await user.click(screen.getByRole('button', { name: /config/i }));
  await user.click(screen.getByRole('radio', { name: /dark/i }));
  expect(document.documentElement).toHaveClass('dark');
});

test('volver a Light remueve la clase dark', async () => {
  const user = userEvent.setup();
  setup();
  await user.click(screen.getByRole('button', { name: /config/i }));
  await user.click(screen.getByRole('radio', { name: /dark/i }));
  await user.click(screen.getByRole('radio', { name: /light/i }));
  expect(document.documentElement).not.toHaveClass('dark');
});
```

- [ ] **Step 2: Correr el test para verificar que falla**

Run: `pnpm --filter verona test -- app-config`
Expected: FAIL — `Cannot find module './app-config'`.

- [ ] **Step 3: Crear `apps/verona/layout/app-config.tsx`**

```tsx
'use client';
import { useEffect } from 'react';
import { useLayout } from './context/layout-context';
import { Icon } from '@/lib/icon';
import { Drawer } from '@lindaui/ui/drawer';
import { RadioGroup, Radio } from '@lindaui/ui/radio-group';
import type { ColorScheme } from '@/types/layout';

export default function AppConfig() {
  const { layoutConfig, setLayoutConfig, layoutState, setLayoutState } = useLayout();

  useEffect(() => {
    const root = document.documentElement;
    if (layoutConfig.colorScheme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [layoutConfig.colorScheme]);

  const open = () => setLayoutState((prev) => ({ ...prev, configSidebarVisible: true }));
  const onOpenChange = (isOpen: boolean) => setLayoutState((prev) => ({ ...prev, configSidebarVisible: isOpen }));
  const onScheme = (value: string) =>
    setLayoutConfig((prev) => ({ ...prev, colorScheme: value as ColorScheme }));

  return (
    <>
      <button className="layout-config-button config-link" type="button" onClick={open} aria-label="Config">
        <Icon name="pi pi-cog" />
      </button>

      <Drawer isOpen={layoutState.configSidebarVisible} onOpenChange={onOpenChange} placement="right" title="Configuración">
        <RadioGroup label="Color Scheme" value={layoutConfig.colorScheme} onChange={onScheme}>
          <Radio value="light">Light</Radio>
          <Radio value="dark">Dark</Radio>
        </RadioGroup>
      </Drawer>
    </>
  );
}
```

> Adaptar a la API real de `@lindaui/ui/drawer` (`isOpen`/`onOpenChange`/`placement`/`title`) y `@lindaui/ui/radio-group` (`value`/`onChange(value)`, `Radio`) leyendo sus `.d.ts`. El handler de los controls es `onChange`, no `onValueChange` (CLAUDE.md). Si el drawer no auto-renderiza un nombre accesible, pasar `aria-label`.

- [ ] **Step 4: Correr el test para verificar que pasa**

Run: `pnpm --filter verona test -- app-config`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add apps/verona/layout/app-config.tsx apps/verona/layout/app-config.test.tsx
git commit -m "feat(verona): AppConfig drawer con toggle light/dark"
```

---

### Task 8: Ensamblar el shell y verificar build

**Files:**
- Create: `apps/verona/layout/app-layout.tsx`
- Create: `apps/verona/app/(main)/layout.tsx`
- Create: `apps/verona/app/(main)/page.tsx`
- Create: `apps/verona/app/(full-page)/layout.tsx`
- Modify: `apps/verona/app/layout.tsx` (envolver en `LayoutProvider`)
- Delete: `apps/verona/app/page.tsx` (placeholder de Task 1)

**Interfaces:**
- Consumes: todos los componentes de layout (Tasks 5-7) + `LayoutProvider` (Task 3).
- Produces: `AppLayout` (default export): `{ children }`; arma `.layout-container` con clases según `layoutState`, monta `AppTopbar`, `AppSidebar`, `AppBreadcrumb`, `AppConfig`, `AppFooter` y `children`.

- [ ] **Step 1: Crear `apps/verona/layout/app-layout.tsx`**

```tsx
'use client';
import type { ReactNode } from 'react';
import { useLayout } from './context/layout-context';
import AppTopbar from './app-topbar';
import AppSidebar from './app-sidebar';
import AppBreadcrumb from './app-breadcrumb';
import AppFooter from './app-footer';
import AppConfig from './app-config';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { layoutState, layoutConfig } = useLayout();

  const containerClass = [
    'layout-container',
    'layout-static',
    layoutState.staticMenuDesktopInactive ? 'layout-static-inactive' : '',
    layoutState.staticMenuMobileActive ? 'layout-mobile-active' : '',
    layoutConfig.colorScheme === 'dark' ? 'layout-dark' : 'layout-light'
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClass}>
      <AppTopbar />
      <div className="layout-sidebar">
        <AppSidebar />
      </div>
      <div className="layout-content-wrapper">
        <div className="layout-content">
          <div className="layout-content-inner">
            <AppBreadcrumb />
            {children}
            <AppFooter />
          </div>
        </div>
      </div>
      <AppConfig />
    </div>
  );
}
```

- [ ] **Step 2: Envolver el root en `LayoutProvider` — editar `app/layout.tsx`**

Reemplazar el `<body>{children}</body>` por:

```tsx
import { LayoutProvider } from '../layout/context/layout-context';
// ...
      <body>
        <LayoutProvider>{children}</LayoutProvider>
      </body>
```

- [ ] **Step 3: Crear `apps/verona/app/(main)/layout.tsx`**

```tsx
import type { ReactNode } from 'react';
import AppLayout from '../../layout/app-layout';

export default function MainLayout({ children }: { children: ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}
```

- [ ] **Step 4: Crear `apps/verona/app/(main)/page.tsx`** (placeholder dashboard)

```tsx
import { Card } from '@lindaui/ui/card';

export default function Dashboard() {
  return (
    <Card>
      <h1>SaaS Dashboard</h1>
      <p>Shell de Verona sobre @lindaui/ui — Fase 0 lista. Las páginas llegan en fases siguientes.</p>
    </Card>
  );
}
```

> Verificar export real de `@lindaui/ui/card`. Si `Card` requiere subcomponentes (`CardBody`...), adaptar según su `.d.ts`.

- [ ] **Step 5: Crear `apps/verona/app/(full-page)/layout.tsx`** (passthrough para auth futuro)

```tsx
import type { ReactNode } from 'react';

export default function FullPageLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
```

- [ ] **Step 6: Borrar el placeholder de Task 1**

Run: `rm apps/verona/app/page.tsx`
Expected: la home ahora la sirve `(main)/page.tsx` (route group sin segmento de URL).

- [ ] **Step 7: Verificar dev — shell navegable**

Run: `pnpm --filter verona dev` (navegar manualmente, luego Ctrl-C)
Expected: `http://localhost:3000` muestra topbar + sidebar con menú jerárquico + breadcrumb + footer + botón de config. Click en items navega y resalta el activo. El engranaje abre el drawer; Dark cambia el esquema (clase `dark` en `<html>`).

- [ ] **Step 8: Verificar build de producción + tipos**

Run: `pnpm build`
Expected: turbo buildea `@lindaui/tokens`, `@lindaui/ui` y `verona`. `next build` compila sin errores de tipos ni de import. (Es el gate de tipos de la app.)

- [ ] **Step 9: Correr la suite de tests de la app**

Run: `pnpm --filter verona test`
Expected: PASS — context, icon, menuitem, app-config.

- [ ] **Step 10: Commit**

```bash
git add apps/verona/layout/app-layout.tsx "apps/verona/app/(main)" "apps/verona/app/(full-page)" apps/verona/app/layout.tsx
git rm apps/verona/app/page.tsx
git commit -m "feat(verona): ensamblar shell (AppLayout + route groups) y verificar build"
```

---

## Self-Review

**1. Spec coverage:**
- Scaffold `apps/verona` Next 16.2.9 + workspace → Task 1. ✓
- Bridge de estilos (`@lindaui/tokens/css` + Tailwind + SCSS port + primeflex out + Lato) → Task 2. ✓
- Layout shell (Context, Menu, Topbar, Sidebar, Breadcrumb, Footer, Config) → Tasks 3,5,6,7,8. ✓
- Iconos lucide → Task 4. ✓
- AppConfig mínimo (light/dark + static) → Task 7 + LayoutConfig recortado Task 3. ✓
- Datos JSON+fetch → Fase 0 no necesita datos (placeholder); patrón se introduce en Fase 2. Documentado en spec como "se deja el patrón"; sin tarea en Fase 0 porque no hay consumo real. (Gap intencional, no de cobertura.)
- Entregable: dev levanta + build pasa + dark mode + nav activa → Task 8. ✓

**2. Placeholder scan:** sin TBD/TODO. Los "ajustar según `.d.ts`" son instrucciones de verificación de API real (regla del CLAUDE.md), no placeholders de implementación.

**3. Type consistency:** `useLayout`/`useMenu` nombres consistentes Tasks 3→5,6,7,8. `LayoutContextProps` (con `isSlim/isSlimPlus/isHorizontal` stubs) usado en menuitem. `MenuModel` compartido menu/submenu/menuitem. `Icon({name,className})` firma única Tasks 4→5,6,7. `Breadcrumb {labels,to}` consistente submenu/breadcrumb. `ColorScheme` Task 3→7.

## Riesgos conocidos
- **APIs reales de @lindaui/ui** (`search-field`, `avatar`, `menu`, `drawer`, `radio-group`, `card`): el plan asume firmas razonables; cada tarea instruye verificar el `.d.ts` y adaptar. Es el punto de fricción más probable.
- **Nombres de iconos lucide**: algunos del import pueden no existir con ese identificador exacto; Task 4 incluye verificación.
- **SCSS port + bridge**: riesgo visual (no cubierto por tests unit). Verificación manual en Task 2 Step 6 y Task 8 Step 7.
- **Doble preflight de Tailwind**: aceptado en Fase 0, optimización a Fase 4.
