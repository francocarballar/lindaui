# Spec: Cerrar el gap de cobertura de tests (@ts/ui)

**Fecha:** 2026-06-26
**Workstream:** C (de 3) — independiente de A y B.
**Decisión del owner:** cubrir TODOS los faltantes (honrar la regla
"tests co-locados" de `CLAUDE.md`, no relajarla).

## Problema

`CLAUDE.md` declara como regla inquebrantable: "Tests co-locados + queries
semánticas". Realidad medida: **31 módulos fuente de `@ts/ui` no aparecen en
ningún test** (ni co-locado ni en suite compartida). Contradicción contrato↔código.

Aclaración del conteo: el conteo naive "43 sin test co-locado" estaba inflado.
Las 12 piezas date/color SÍ están cubiertas por la suite compartida
`src/date-time-color.test.tsx` (assert `toBeDefined` sobre el export). El gap
real, por referencia de import en archivos `*.test.*`, son **31 módulos**.

## Taxonomía del gap (31 módulos)

Clasificados por estilo de wrapper (define el tipo de aserción), según
`CLAUDE.md` "estilos de wrapper" y verificado leyendo cada fuente:

### Grupo 1 — Thin wrap (9) → aserción de render real

`return <HeroX {...props}/>`. Renderizan y se puede afirmar rol/contenido:

`avatar`, `chip`, `spinner`, `skeleton`, `checkbox-group`, `switch-group`,
`toggle-button-group`, `input-group`, `otp-input`.

### Grupo 2 — Compound re-export (22) → suite `toBeDefined`

`export { ... } from "@heroui/react"`. Composición RAC profunda que requiere
sub-componentes / `@internationalized/date` para render significativo; se
afirma que la superficie pública resuelve (mismo patrón que
`date-time-color.test.tsx`):

`accordion`, `breadcrumbs`, `card`, `disclosure`, `disclosure-group`,
`divider`, `drawer`, `kbd`, `link`, `listbox`, `meter`, `pagination`,
`popover`, `progress`, `progress-circle`, `scroll-shadow`, `surface`,
`tag`, `tag-group`, `text`, `toast`, `tooltip`.

## Requisitos

### R1 — Tests reales para los 9 thin-wrap

Un archivo `*.test.tsx` co-locado por módulo del Grupo 1. Cada uno: render +
aserción semántica del export principal usando el export real (verificar el
named export en la fuente). Idiom del repo (ver `button.test.tsx`,
`badge.test.tsx`, `switch.test.tsx`):

- Queries semánticas: `getByRole` / `getByLabelText` cuando hay rol;
  `getByText` cuando el componente es puramente presentacional sin rol
  (precedente: `badge.test.tsx` usa `getByText`). Prohibido `getByTestId`.
- Mínimo: una aserción de que el componente renderiza su contenido/rol.
  Donde el componente acepta `children` de texto, afirmar que aparece.
- Para los `*-group` que requieren items hijos para un rol, afirmar el
  contenedor por su rol ARIA o el render del label; si el render mínimo no
  produce rol estable en jsdom, degradar a `toBeDefined` del export +
  un render sin throw (documentar el porqué en comentario, como hace
  `date-time-color.test.tsx`).

### R2 — Suite `toBeDefined` para los 22 re-export

Una sola suite co-locada nueva `src/compound-exports.test.tsx` que importe el
export principal de cada uno de los 22 módulos del Grupo 2 y, vía `test.each`,
afirme `toBeDefined()`. Mismo patrón y comentario explicativo que
`date-time-color.test.tsx`. Un solo archivo (no 22) — es el patrón ya
establecido para compound re-exports.

Para módulos que re-exportan varios símbolos (ej. `card`: `Card`,
`CardHeader`, …), basta afirmar el símbolo principal por módulo; opcionalmente
los sub-símbolos clave. No renderizar composición parcial.

### R3 — La regla queda honrada, no relajada

No se edita `CLAUDE.md` para relajar. Tras este workstream, todo módulo fuente
de `@ts/ui` aparece en al menos un test. Se actualiza la nota de cobertura si
`CLAUDE.md` afirma un número de entries cubiertas (no hay número hoy → no hace
falta editar el contrato).

## Fuera de scope

- Tests de `@ts/blocks` (ya 100% cubierto).
- Tests de integración / visual / Storybook.
- Aumentar profundidad de los tests existentes.

## Criterios de aceptación

1. Existe al menos una referencia de import a cada uno de los 31 módulos en
   archivos `*.test.*` de `packages/ui/src`.
2. `pnpm --filter @ts/ui test` pasa, sin tests skippeados.
3. Los 9 del Grupo 1 tienen archivo `*.test.tsx` co-locado propio con al menos
   una aserción de render semántica.
4. Los 22 del Grupo 2 están cubiertos por `src/compound-exports.test.tsx` con
   `toBeDefined`.
5. Ningún test usa `getByTestId`.
6. Re-correr el chequeo del gap (script de la fase de análisis) reporta
   `TOTAL gap real: 0`.
