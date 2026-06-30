# Spec: LICENSE + READMEs

**Fecha:** 2026-06-26
**Workstream:** B (de 3) — independiente de A (metadata) y C (tests).
**Decisión del owner:** licencia MIT.

## Problema

- No hay archivo `LICENSE` en ninguna parte. `license: "MIT"` en `package.json`
  (workstream A) sin un `LICENSE` real es incompleto: npm linkea a un archivo
  que no existe, y legalmente la licencia MIT exige distribuir el texto + el
  copyright.
- No hay README en la raíz ni en ningún paquete. Una librería de 71 entries
  (`@lindaui/ui`) + 22 (`@lindaui/blocks`) + el bundle CSS (`@lindaui/tokens`) se publicaría
  sin una sola línea de install/uso/setup de peers. El consumidor no sabría
  qué instalar ni cómo importar el CSS.

## Requisitos

### R1 — LICENSE raíz

Crear `LICENSE` en la raíz con el texto **MIT** estándar, copyright
`Copyright (c) 2026 Franco Carballar`. Año 2026 (fecha actual), titular el owner.

### R2 — LICENSE incluido en cada paquete publicado

npm incluye `LICENSE` del root automáticamente solo si está en el tarball.
Como cada paquete tiene `"files": ["dist"]`, el LICENSE del root NO se empaqueta.
Opción elegida: agregar `"LICENSE"` al array `files` de cada paquete y copiar
(o symlink en build) el LICENSE raíz a cada package dir. Para evitar drift de
copias, el método: agregar `LICENSE` a `files` y crear el archivo `LICENSE` en
cada paquete con el mismo texto MIT (3 copias idénticas). Es lo que hacen los
monorepos npm estándar; el texto MIT no cambia.

`files` resultante:
- `@lindaui/ui`: `["dist", "LICENSE", "README.md"]`
- `@lindaui/blocks`: `["dist", "LICENSE", "README.md"]`
- `@lindaui/tokens`: `["dist", "LICENSE", "README.md"]`

### R3 — README raíz

`README.md` en la raíz, contenido mínimo:

- Título + una línea: monorepo del design system (`@lindaui/tokens` + `@lindaui/ui` +
  `@lindaui/blocks`) sobre HeroUI v3.
- Diagrama de arquitectura (reusar el ASCII de `CLAUDE.md`).
- Tabla de paquetes (nombre → qué es → path).
- Quickstart de consumidor: instalar los 3, importar el CSS una vez, importar
  componentes por entry. Snippets reales (ver R4/R5/R6 para los exactos).
- Sección "Desarrollo": `pnpm install`, `pnpm build`, `pnpm test`, link a
  `CLAUDE.md` como contrato de contribución.
- Licencia: MIT.

### R4 — README de `@lindaui/ui`

`packages/ui/README.md`:

- Qué es: wrappers React 19 sobre HeroUI v3 (RAC) detrás de entry points estables.
- Install: `pnpm add @lindaui/ui @lindaui/tokens` + peers (`react`, `react-dom`,
  `react-hook-form`). Indicar que `@lindaui/tokens` es peer y hay que importar su CSS.
- Setup CSS: `import "@lindaui/tokens/css";` una vez en el root del app.
- Uso: ejemplo de import por entry —
  ```tsx
  import { Button } from "@lindaui/ui/button";
  import { Select } from "@lindaui/ui/select";
  ```
- Nota de API: HeroUI v3 es RAC; la API pública de `@lindaui/ui` es propia donde hay
  wrapper ergonómico (no re-exporta tipos de HeroUI ahí). Link a `CLAUDE.md`.
- Una línea sobre las entries no-componente: `@lindaui/ui/cn`, `@lindaui/ui/search`,
  `@lindaui/ui/use-disclosure`, `@lindaui/ui/use-media-query`.

### R5 — README de `@lindaui/blocks`

`packages/blocks/README.md`:

- Qué es: secciones compuestas sobre `@lindaui/ui` (auth, listas, master-detail,
  charts). Paquete npm importable, NO copy-paste registry.
- Install: `pnpm add @lindaui/blocks @lindaui/ui @lindaui/tokens` + peers (`react`, `react-dom`,
  `react-hook-form`, `recharts` para charts).
- Uso: ejemplo —
  ```tsx
  import "@lindaui/tokens/css";
  import { LoginForm } from "@lindaui/blocks/login-form";
  import { BarChart } from "@lindaui/blocks/bar-chart";
  ```
- Nota: los blocks controlados reciben estado + handlers (cero data-fetching).
- Catálogo: lista breve de las 22 entries por categoría (UI sections / charts).

### R6 — README de `@lindaui/tokens`

`packages/tokens/README.md`:

- Qué es: tokens de marca (OKLCH light/dark) + HeroUI v3 + Tailwind v4
  compilados en un solo CSS.
- Uso: `import "@lindaui/tokens/css";` una vez. Explicar que ese único import rinde
  HeroUI + tokens + las utilities Tailwind que la lib usa.
- Dark mode: togglear la clase `.dark` en un ancestro.
- Build local: `pnpm --filter @lindaui/tokens build` regenera `dist/index.css`.

## Fuera de scope

- Documentación por-componente exhaustiva (props tables). El catálogo vivo es
  Storybook; los READMEs son install + orientación, no API reference completa.
- CHANGELOG: lo genera Changesets en release.

## Criterios de aceptación

1. `LICENSE` existe en raíz + en los 3 packages, texto MIT, copyright
   `2026 Franco Carballar`.
2. `README.md` existe en raíz + en los 3 packages, con los snippets de R3-R6.
3. Cada package tiene `LICENSE` y `README.md` en su array `files`.
4. `pnpm --filter @lindaui/ui publish --dry-run --no-git-checks` lista `LICENSE` y
   `README.md` en el tarball (sección "Tarball Contents").
5. Los snippets de import en los READMEs usan entries que existen en el
   `exports` map real (verificable contra `package.json`).
