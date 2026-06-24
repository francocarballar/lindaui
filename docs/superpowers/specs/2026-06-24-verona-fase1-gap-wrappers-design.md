# Verona Fase 1 — Gap wrappers en @ts/ui — Diseño

> Fecha: 2026-06-24
> Estado: aprobado (diseño) — pendiente review de spec
> Fase previa: Fase 0 (shell) completa en `feat/verona-fase0`.

## Objetivo

Construir en `@ts/ui` los 6 componentes que el template Verona usa y que HeroUI v3
no provee, cada uno como wrapper sobre una lib externa elegida (o bespoke), con API
pública propia, TDD y entry en el `exports` map. Esta fase entrega **solo los wrappers
+ sus tests + entries**; las páginas que los consumen son Fase 2/3.

Fuente de referencia de uso: `C:\Users\ccarb\Downloads\verona-react-10.0.0` (PrimeReact 10.2.1).

## Por qué son gaps reales

HeroUI v3 (= react-aria-components) no expone ninguno de los 6. `@ts/ui/calendar` y
`range-calendar` son date-pickers RAC (selección de fecha), **no** calendarios de eventos.
Verona los cubría con PrimeReact (`Chart`, `Tree`, `Editor`, `FullCalendar`, `Timeline`,
`FileUpload`).

## Decisiones de backing (cerradas)

| Wrapper | Motor elegido | Razón / trade-off aceptado |
|---|---|---|
| `chart` | **Recharts (SVG)** | React-native, themea con tokens. Trade-off: las configs chart.js de Verona NO portan verbatim — se mitiga conservando el *data-shape* (ver §chart). |
| `rich-text` | **TipTap v2** (ProseMirror) | Headless, React-first, themeable con tokens, mantenido. |
| `event-calendar` | **@fullcalendar/react** | events/plugins/headerToolbar de Verona portan verbatim. Trade-off: ~100kb + su CSS pelea con tokens → capa de override. |
| `tree` | **RAC Tree** (react-aria-components) | A11y incluida, themeable con tokens. A verificar: que `Tree`/`TreeItem` salgan de `@heroui/react`; si no, dep explícita `react-aria-components`. |
| `timeline` | **bespoke** | Presentacional puro con render-props; sin lib externa. |
| `file-upload` | **bespoke** sobre RAC `DropZone` + `FileTrigger` | Preview e item-template propios; sin lib externa. |

## Arquitectura común (todos los wrappers)

- 1 archivo `packages/ui/src/<x>.tsx` + `<x>.test.tsx` co-locado. 1 entry por archivo.
- `"use client";` primera línea (todos son interactivos / usan hooks de cliente).
- Entry nueva en `packages/ui/package.json` → `exports` map:
  `"./x": { "types": "./dist/x.d.ts", "import": "./dist/x.js" }`. bunchee descubre las
  entries desde ese map.
- **Cuarta categoría de wrapper** (no existe hoy en CLAUDE.md): *wrapper sobre lib externa*.
  Regla: la API pública es **propia**, no se filtran types de la lib externa (igual criterio
  que con HeroUI donde hay wrapper ergonómico). Al cerrar la fase, agregar esta categoría a
  la sección "estilos de wrapper" de CLAUDE.md.
- Deps nuevas reales de `@ts/ui` (van a `dependencies`, como `@heroui/react`):
  - `recharts`
  - `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/pm`
  - `@fullcalendar/react`, `@fullcalendar/daygrid`, `@fullcalendar/timegrid`, `@fullcalendar/interaction`
  - `react-aria-components` **explícito** sólo si el `Tree` no sale de `@heroui/react`
    (resolver en el plan, leyendo el `.d.ts` real).
- Build de dos pasos **sin cambios**: bunchee externaliza las libs (JS fino, no las bundlea),
  tsc emite los `.d.ts`. Riesgo a vigilar: grafos de tipos pesados (TipTap/FC/Recharts) en el
  paso `tsc --emitDeclarationOnly`; sigue siendo el path estable de memoria (ver Anti-regresión
  #1 de CLAUDE.md). bunchee no toca dts.

## APIs públicas (propias, flat)

### chart

Diseño clave: la API pública conserva el **data-shape de chart.js** (`{ labels, datasets }`)
pero renderiza con Recharts. Así los objetos `data` de Verona portan casi verbatim en Fase 2/4;
sólo el `options` chart.js-específico se descarta a favor de defaults theme-driven (colores
leídos de tokens CSS, no de `getComputedStyle(document.documentElement)`).

```tsx
type ChartType = "line" | "bar" | "pie" | "doughnut" | "radar" | "area";
interface ChartDataset { label?: string; data: number[]; backgroundColor?: string | string[]; borderColor?: string | string[]; }
interface ChartData { labels: string[]; datasets: ChartDataset[]; }
interface ChartProps { type: ChartType; data: ChartData; height?: number; className?: string; }
<Chart type="line" data={{ labels, datasets }} height={300} />
```

- Internamente: adapta `{labels, datasets}` → series Recharts y elige el componente
  (`LineChart`/`BarChart`/`PieChart`/`RadarChart`/`AreaChart`) según `type`. `doughnut` = `pie`
  con `innerRadius`. Colores default desde tokens si el dataset no trae color.
- `ResponsiveContainer` con `height` (default 300). `width="100%"`.

### tree

Esconde la composición RAC `Tree`/`TreeItem`/`TreeItemContent`.

```tsx
interface TreeItemData { key: string; label: ReactNode; children?: TreeItemData[]; }
interface TreeProps {
  items: TreeItemData[];
  selectionMode?: "none" | "single" | "multiple";
  selectedKeys?: Iterable<string>;
  defaultSelectedKeys?: Iterable<string>;
  onSelectionChange?: (keys: Set<string>) => void;
  "aria-label"?: string;
}
<Tree items={nodes} selectionMode="multiple" selectedKeys={sel} onSelectionChange={setSel} aria-label="Files" />
```

- Render recursivo de `items` → `TreeItem` con `TreeItemContent`. Mapea
  `onSelectionChange` de RAC (`Selection`) → `Set<string>`. Verona usaba `selectionMode="checkbox"`;
  acá `multiple` (RAC no tiene "checkbox" como modo — el checkbox es presentación; se difiere el
  render de checkbox visual a quien consuma, o se agrega slot en Fase 2 si hace falta).

### rich-text

Controlado, valor = HTML string, toolbar default (bold, italic, listas ordenada/desordenada, link).

```tsx
interface RichTextProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  className?: string;
}
<RichText value={html} onChange={setHtml} minHeight={250} />
```

- TipTap `useEditor` con `StarterKit`. `content` inicial = `value`; `onUpdate` → `onChange(editor.getHTML())`.
- Toolbar propia (botones `@ts/ui/button` toggle) sobre el `EditorContent`.
- Esconde la instancia de editor; no se expone el objeto TipTap.

### event-calendar

Esconde el wiring de plugins FC (bundle interno de dayGrid/timeGrid/interaction). Ship de una
hoja de override CSS que mapea las vars de FullCalendar a tokens de `@ts/tokens`.

```tsx
interface CalendarEvent { id?: string; title: string; start: string | Date; end?: string | Date; allDay?: boolean; backgroundColor?: string; borderColor?: string; textColor?: string; }
interface EventCalendarProps {
  events: CalendarEvent[];
  initialView?: "dayGridMonth" | "timeGridWeek" | "timeGridDay";
  initialDate?: string | Date;
  editable?: boolean;
  selectable?: boolean;
  height?: number;
  headerToolbar?: { left?: string; center?: string; right?: string };
  onEventClick?: (eventId: string) => void;
  onSelect?: (range: { start: Date; end: Date; allDay: boolean }) => void;
}
<EventCalendar events={evts} initialView="dayGridMonth" editable selectable onEventClick={...} onSelect={...} />
```

- Internamente arma `plugins=[dayGridPlugin, timeGridPlugin, interactionPlugin]`,
  `selectMirror`, `dayMaxEvents` defaults on. `eventClick`/`select` se simplifican al callback propio.
- CSS override co-located (import en el wrapper o en `@ts/tokens`; resolver en el plan).

### timeline

Bespoke, render-props (calca la API de Verona). Sin estado, sin handlers.

```tsx
interface TimelineProps<T = unknown> {
  value: T[];
  content: (item: T, index: number) => ReactNode;
  opposite?: (item: T, index: number) => ReactNode;
  marker?: (item: T, index: number) => ReactNode;
  align?: "left" | "right" | "alternate";
  layout?: "vertical" | "horizontal";
  className?: string;
}
<Timeline value={events} align="alternate" marker={(i)=>...} content={(i)=>...} opposite={(i)=>...} />
```

- Estructura accesible: lista (`<ol>`/`role="list"`) de items; conector + marker + contenido.
- Default marker = punto con color de token. `align`/`layout` controlan layout via clases Tailwind.

### file-upload

Bespoke sobre RAC `DropZone` + `FileTrigger`. Preview e item-template propios.

```tsx
interface FileUploadProps {
  onSelect?: (files: File[]) => void;
  onUpload?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;            // bytes
  mode?: "basic" | "advanced"; // basic = botón; advanced = dropzone + previews
  itemTemplate?: (file: File, onRemove: () => void) => ReactNode;
  emptyTemplate?: () => ReactNode;
  className?: string;
}
<FileUpload mode="advanced" multiple accept="image/*" maxSize={1_000_000} onSelect={...} />
```

- `mode="basic"` = `FileTrigger` + botón (`@ts/ui/button`). `mode="advanced"` = `DropZone`
  con `FileTrigger` interno + lista de previews (item-template default o custom).
- `maxSize`/`accept` filtran antes de emitir `onSelect`. `onUpload` opcional (no hay backend en
  el template — queda como hook para el consumidor; sin auto-upload por default).
- Sin `ref.getInput()` PrimeReact-style; el control es por callbacks.

## Testing (límites jsdom)

Sin `getByTestId`. Co-locados. Profundidad por wrapper según qué corre en jsdom:

| Wrapper | Estrategia de test |
|---|---|
| `timeline` | Render completo: assert items presentes por `getByRole`/texto del render-prop. |
| `file-upload` | Render del trigger (`getByRole("button")`); `onSelect` disparado por cambio del input file (programático); filtrado por `maxSize`/`accept`. |
| `chart` | Recharts necesita tamaño > 0 → render con `width`/`height` fijos (mock de `ResponsiveContainer` o contenedor dimensionado). Assert que renderiza un `<svg>` y N series. Si jsdom no da layout, degradar a: export resuelve + render sin throw. |
| `tree` | Render de `items`; assert `role="treeitem"` por nodo; selección por interacción si RAC corre en jsdom; si no, smoke de estructura. |
| `rich-text` | TipTap necesita Range/Selection (jsdom parcial). Assert: editor monta (`role="textbox"`/contenteditable presente), toolbar presente. Interacción de tipeo si jsdom lo soporta; si no, smoke + export resuelve. |
| `event-calendar` | FC renderiza DOM en jsdom: assert grid presente y que los `events` aparecen por título (`getByText`). Click/select si el plugin de interacción corre; si no, smoke de render. |

Regla de degradación (consistente con CLAUDE.md "Convenciones de tests"): donde la lib no
renderiza en jsdom, el test asserta que el export resuelve (`toBeDefined`) + render mínimo sin
throw, en vez de testear media composición. El plan fija el nivel exacto por wrapper tras
probar el render real en jsdom.

## Orden de entrega (6 tasks independientes)

De menor a mayor riesgo de lib externa:

1. `timeline` — bespoke, cero deps nuevas.
2. `file-upload` — bespoke sobre RAC, cero deps externas nuevas (RAC ya presente).
3. `chart` — Recharts (dep nueva, adapter data-shape).
4. `tree` — RAC Tree (verificar origen del export).
5. `rich-text` — TipTap (deps nuevas, montaje en jsdom delicado).
6. `event-calendar` — FullCalendar (la más pesada: deps + CSS override + interacción).

Cada task: dep(s) → `.d.ts`/doc real de la lib → test que falla → wrapper → test pasa →
entry en exports map → build (`bunchee --no-dts && tsc`) → commit.

## Fuera de alcance (Fase 1)

- Páginas que consumen los wrappers (Fase 2/3).
- Theming fino de FullCalendar más allá del override base de tokens (pulido → Fase 4).
- Stories de Storybook de estos wrappers (el codegen del storybook las levanta de exports;
  validar que compilan se difiere a cuando haya páginas que las usen).
- Variantes avanzadas: zoom/export de charts, drag-resize custom de timeline, multi-toolbar
  config de rich-text — YAGNI hasta que una página las pida.

## Criterio de hecho

`pnpm build` pasa (bunchee + gate `tsc`) con las 6 entries nuevas; `pnpm test` verde
(suite vitest de `@ts/ui` incluye los 6 `.test.tsx`); cada wrapper exporta desde su entry
del map; CLAUDE.md actualizado con la 4ª categoría de wrapper y cualquier trampa nueva.
