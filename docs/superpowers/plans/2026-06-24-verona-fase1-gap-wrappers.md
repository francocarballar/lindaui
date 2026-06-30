# Verona Fase 1 — Gap wrappers en @lindaui/ui — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir en `@lindaui/ui` los 6 componentes que Verona usa y HeroUI v3 no provee (`timeline`, `file-upload`, `chart`, `tree`, `rich-text`, `event-calendar`), cada uno con API pública propia, TDD y entry en el `exports` map.

**Architecture:** Cada wrapper es un archivo `packages/ui/src/<x>.tsx` (+ `<x>.test.tsx` co-locado), `"use client"` primera línea, una entry en `package.json` `exports`. Dos son bespoke (timeline, file-upload sobre primitivos RAC); cuatro envuelven una lib externa (Recharts, react-aria-components Tree, TipTap, FullCalendar) detrás de API propia que **no filtra los types de la lib externa**.

**Tech Stack:** React 19, TypeScript 5.5, vitest + jsdom + @testing-library, bunchee (JS) + tsc (dts). Libs nuevas: `recharts`, `@tiptap/react`+`@tiptap/starter-kit`+`@tiptap/pm`, `@fullcalendar/react`+`daygrid`+`timegrid`+`interaction`, `react-aria-components` (explícito).

## Global Constraints

- **Monorepo pnpm@11.7.0 + Turborepo.** Node ≥20 (entorno: v26). ESM only (`"type":"module"`). pnpm only.
- **`@lindaui/ui` envuelve HeroUI v3 = react-aria-components (RAC).** Para gaps sin HeroUI, se envuelve la lib externa, pero **la API pública es propia** — no se re-exportan ni filtran types de la lib externa.
- **`"use client";` primera línea** en los 6 (todos usan hooks/interacción de cliente).
- **Tests co-locados, solo queries semánticas** (`getByRole`/`getByLabelText`/`findByRole`/`getByText`). **Prohibido `getByTestId`.** Excepción documentada: inputs de archivo (RAC `FileTrigger`) y nodos SVG de Recharts no tienen rol ARIA → se permite `container.querySelector('input[type="file"]')` / `container.querySelector("svg…")` solo para esos casos, nunca `data-testid`.
- **Toda entry nueva va al `exports` map** de `packages/ui/package.json`: `"./x": { "types": "./dist/x.d.ts", "import": "./dist/x.js" }`. bunchee descubre las entries desde ahí.
- **Build de dos pasos, no se toca:** `bunchee --no-dts && tsc -p tsconfig.build.json`. bunchee externaliza las deps (JS fino); tsc emite los `.d.ts`.
- **Deps nuevas van a `dependencies` de `packages/ui/package.json`** (como `@heroui/react`), no a peer ni dev. Versiones pin: `recharts@^2.15.0`, `@tiptap/react@^2.11.0`, `@tiptap/starter-kit@^2.11.0`, `@tiptap/pm@^2.11.0`, `@fullcalendar/react@^6.1.15`, `@fullcalendar/daygrid@^6.1.15`, `@fullcalendar/timegrid@^6.1.15`, `@fullcalendar/interaction@^6.1.15`, `react-aria-components@^1.18.0`.
- **Si `pnpm install`/`pnpm add` deja un placeholder `set this to true or false` en `pnpm-workspace.yaml` → `allowBuilds`**, resolverlo (poner `false` salvo que el paquete necesite su build script). Ninguna de estas libs requiere build script conocido; si pnpm pregunta, default `false`.
- **`react-aria-components` NO sale de `@heroui/react`** (verificado: `@heroui/react@3.2.1` no exporta `Tree`). Se agrega como dep explícita y se importa directo de `react-aria-components`.
- **Esta fase NO crea páginas** que consuman los wrappers (eso es Fase 2/3). Entrega solo wrappers + tests + entries + actualización de CLAUDE.md.
- **Desviación intencional del spec:** el prop `onUpload` de `file-upload` se descarta (YAGNI: el template no tiene backend; el consumidor dispara su upload dentro de `onSelect`). Un prop nunca invocado sería código muerto.
- **No publish / no push** sin pedido explícito (estado de release diferido).

---

## File Structure

| Archivo | Responsabilidad |
|---|---|
| `packages/ui/src/timeline.tsx` + `.test.tsx` | Timeline presentacional, render-props. Bespoke. |
| `packages/ui/src/file-upload.tsx` + `.test.tsx` | Selección/preview de archivos sobre RAC `DropZone`+`FileTrigger`. Bespoke. |
| `packages/ui/src/chart.tsx` + `.test.tsx` | Adapter data-shape chart.js → Recharts. |
| `packages/ui/src/tree.tsx` + `.test.tsx` | Árbol jerárquico sobre RAC `Tree`. |
| `packages/ui/src/rich-text.tsx` + `.test.tsx` | Editor HTML sobre TipTap v2. |
| `packages/ui/src/event-calendar.tsx` + `.test.tsx` | Calendario de eventos sobre FullCalendar. |
| `packages/ui/package.json` | +9 deps, +6 entries en `exports`. |
| `CLAUDE.md` | 4ª categoría de wrapper + entries + anti-regresiones nuevas. |

Orden de tasks (menor a mayor riesgo de lib): timeline → file-upload → chart → tree → rich-text → event-calendar → CLAUDE.md.

---

### Task 1: timeline (bespoke)

**Files:**
- Create: `packages/ui/src/timeline.tsx`
- Test: `packages/ui/src/timeline.test.tsx`
- Modify: `packages/ui/package.json` (exports map: add `./timeline`)

**Interfaces:**
- Consumes: nada (bespoke, sin deps nuevas).
- Produces:
  ```ts
  interface TimelineProps<T = unknown> {
    value: T[];
    content: (item: T, index: number) => ReactNode;
    opposite?: (item: T, index: number) => ReactNode;
    marker?: (item: T, index: number) => ReactNode;
    align?: "left" | "right" | "alternate";
    layout?: "vertical" | "horizontal";
    className?: string;
  }
  function Timeline<T>(props: TimelineProps<T>): JSX.Element
  ```

- [ ] **Step 1: Write the failing test**

`packages/ui/src/timeline.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { Timeline } from "./timeline";
import { describe, test, expect } from "vitest";

const items = [
  { status: "Ordered", date: "15:00" },
  { status: "Shipped", date: "16:30" },
  { status: "Delivered", date: "18:00" },
];

describe("Timeline", () => {
  test("renders one list item per value with content", () => {
    render(<Timeline value={items} content={(i) => <span>{i.status}</span>} />);
    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByText("Ordered")).toBeInTheDocument();
    expect(screen.getByText("Delivered")).toBeInTheDocument();
  });

  test("renders opposite content when provided", () => {
    render(
      <Timeline
        value={items}
        content={(i) => <span>{i.status}</span>}
        opposite={(i) => <span>{i.date}</span>}
      />,
    );
    expect(screen.getByText("15:00")).toBeInTheDocument();
  });

  test("renders a custom marker", () => {
    render(
      <Timeline
        value={items}
        content={(i) => <span>{i.status}</span>}
        marker={(i) => <span aria-label={`marker-${i.status}`} />}
      />,
    );
    expect(screen.getByLabelText("marker-Ordered")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/ui && pnpm test src/timeline.test.tsx`
Expected: FAIL — `Failed to resolve import "./timeline"` / `Timeline is not defined`.

- [ ] **Step 3: Write minimal implementation**

`packages/ui/src/timeline.tsx`:
```tsx
"use client";
import type { ReactNode } from "react";

export interface TimelineProps<T = unknown> {
  value: T[];
  content: (item: T, index: number) => ReactNode;
  opposite?: (item: T, index: number) => ReactNode;
  marker?: (item: T, index: number) => ReactNode;
  align?: "left" | "right" | "alternate";
  layout?: "vertical" | "horizontal";
  className?: string;
}

export function Timeline<T>({
  value,
  content,
  opposite,
  marker,
  align = "left",
  layout = "vertical",
  className = "",
}: TimelineProps<T>) {
  const horizontal = layout === "horizontal";
  return (
    <ol className={`flex ${horizontal ? "flex-row" : "flex-col"} ${className}`.trim()}>
      {value.map((item, index) => {
        const flip = align === "alternate" ? index % 2 === 1 : align === "right";
        return (
          <li
            key={index}
            className={`flex gap-4 ${horizontal ? "flex-col" : "flex-row"} ${
              !horizontal && flip ? "flex-row-reverse" : ""
            }`.trim()}
          >
            {opposite && (
              <div className="flex-1 text-[var(--text-color-secondary)]">
                {opposite(item, index)}
              </div>
            )}
            <div className="flex flex-col items-center">
              {marker ? (
                marker(item, index)
              ) : (
                <span className="h-3 w-3 rounded-full bg-[var(--accent)]" aria-hidden="true" />
              )}
              {index < value.length - 1 && (
                <span
                  className={`bg-[var(--surface-border)] ${horizontal ? "h-px w-full" : "w-px flex-1"}`}
                  aria-hidden="true"
                />
              )}
            </div>
            <div className="flex-1">{content(item, index)}</div>
          </li>
        );
      })}
    </ol>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/ui && pnpm test src/timeline.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Add the exports entry**

In `packages/ui/package.json`, add to the `exports` object (alphabetical-ish, near other entries):
```json
"./timeline": { "types": "./dist/timeline.d.ts", "import": "./dist/timeline.js" },
```

- [ ] **Step 6: Verify the build (types + JS)**

Run: `cd packages/ui && pnpm build`
Expected: bunchee emits `dist/timeline.js`, tsc emits `dist/timeline.d.ts`, no type errors.

- [ ] **Step 7: Commit**

```bash
git add packages/ui/src/timeline.tsx packages/ui/src/timeline.test.tsx packages/ui/package.json
git commit -m "feat(ui): add timeline wrapper (bespoke, render-props)"
```

---

### Task 2: file-upload (bespoke sobre RAC DropZone + FileTrigger)

**Files:**
- Create: `packages/ui/src/file-upload.tsx`
- Test: `packages/ui/src/file-upload.test.tsx`
- Modify: `packages/ui/package.json` (dep `react-aria-components`; exports `./file-upload`)

**Interfaces:**
- Consumes: `react-aria-components` → `DropZone`, `FileTrigger` (RAC 1.18.0). `DropZone.onDrop(e)` con `e.items: DropItem[]` (`item.kind === "file"` → `await item.getFile()`). `FileTrigger` props: `allowsMultiple`, `acceptedFileTypes?: string[]`, `onSelect(files: FileList | null)`.
- Produces:
  ```ts
  interface FileUploadProps {
    onSelect?: (files: File[]) => void;
    accept?: string;            // CSV de mime/ext, ej "image/*,.pdf"
    multiple?: boolean;
    maxSize?: number;           // bytes
    mode?: "basic" | "advanced";
    itemTemplate?: (file: File, onRemove: () => void) => ReactNode;
    emptyTemplate?: () => ReactNode;
    className?: string;
  }
  function FileUpload(props: FileUploadProps): JSX.Element
  ```

- [ ] **Step 1: Add the dependency**

Run: `cd packages/ui && pnpm add react-aria-components@^1.18.0`
Expected: `react-aria-components` aparece en `dependencies`. Si pnpm pregunta por build scripts, default `false`. (Ya está en el árbol como transitivo de HeroUI; esto la hace explícita.)

- [ ] **Step 2: Write the failing test**

`packages/ui/src/file-upload.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileUpload } from "./file-upload";
import { describe, test, expect, vi } from "vitest";

describe("FileUpload", () => {
  test("renders a choose button in basic mode", () => {
    render(<FileUpload mode="basic" />);
    expect(screen.getByRole("button", { name: /choose/i })).toBeInTheDocument();
  });

  test("renders empty template message in advanced mode", () => {
    render(<FileUpload mode="advanced" />);
    expect(screen.getByText(/drag and drop/i)).toBeInTheDocument();
  });

  test("calls onSelect with the selected file", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const { container } = render(<FileUpload multiple onSelect={onSelect} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["x"], "a.png", { type: "image/png" });
    await user.upload(input, file);
    expect(onSelect).toHaveBeenCalledWith([
      expect.objectContaining({ name: "a.png" }),
    ]);
  });

  test("filters out files larger than maxSize", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const { container } = render(<FileUpload maxSize={2} onSelect={onSelect} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const big = new File(["toolarge"], "big.txt", { type: "text/plain" });
    await user.upload(input, big);
    expect(onSelect).not.toHaveBeenCalled();
  });

  test("removes a selected file via the remove button", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const { container } = render(<FileUpload multiple onSelect={onSelect} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, new File(["x"], "a.png", { type: "image/png" }));
    await user.click(screen.getByRole("button", { name: /remove a\.png/i }));
    expect(onSelect).toHaveBeenLastCalledWith([]);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd packages/ui && pnpm test src/file-upload.test.tsx`
Expected: FAIL — `Failed to resolve import "./file-upload"`.

- [ ] **Step 4: Write minimal implementation**

`packages/ui/src/file-upload.tsx`:
```tsx
"use client";
import { DropZone, FileTrigger } from "react-aria-components";
import { useState, type ReactNode } from "react";

export interface FileUploadProps {
  onSelect?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  mode?: "basic" | "advanced";
  itemTemplate?: (file: File, onRemove: () => void) => ReactNode;
  emptyTemplate?: () => ReactNode;
  className?: string;
}

function filterFiles(list: File[], accept: string | undefined, maxSize: number | undefined): File[] {
  return list.filter((f) => {
    if (maxSize != null && f.size > maxSize) return false;
    if (accept) {
      const patterns = accept.split(",").map((s) => s.trim());
      const ok = patterns.some((p) => {
        if (p.endsWith("/*")) return f.type.startsWith(p.slice(0, -1));
        if (p.startsWith(".")) return f.name.toLowerCase().endsWith(p.toLowerCase());
        return f.type === p;
      });
      if (!ok) return false;
    }
    return true;
  });
}

export function FileUpload({
  onSelect,
  accept,
  multiple = false,
  maxSize,
  mode = "advanced",
  itemTemplate,
  emptyTemplate,
  className = "",
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const acceptList = accept ? accept.split(",").map((s) => s.trim()) : undefined;

  function addFiles(incoming: File[]) {
    const valid = filterFiles(incoming, accept, maxSize);
    if (valid.length === 0) return;
    const next = multiple ? [...files, ...valid] : valid.slice(0, 1);
    setFiles(next);
    onSelect?.(next);
  }

  function removeAt(index: number) {
    const next = files.filter((_, i) => i !== index);
    setFiles(next);
    onSelect?.(next);
  }

  const trigger = (
    <FileTrigger
      allowsMultiple={multiple}
      acceptedFileTypes={acceptList}
      onSelect={(fl) => {
        if (fl) addFiles(Array.from(fl));
      }}
    >
      <button
        type="button"
        className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white"
      >
        Choose
      </button>
    </FileTrigger>
  );

  if (mode === "basic") {
    return <div className={className}>{trigger}</div>;
  }

  return (
    <div className={className}>
      <DropZone
        aria-label="File upload dropzone"
        onDrop={async (e) => {
          const dropped: File[] = [];
          for (const item of e.items) {
            if (item.kind === "file") dropped.push(await item.getFile());
          }
          addFiles(dropped);
        }}
        className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-[var(--surface-border)] p-6"
      >
        {trigger}
        {files.length === 0 &&
          (emptyTemplate ? (
            emptyTemplate()
          ) : (
            <p className="text-sm text-[var(--text-color-secondary)]">
              Drag and drop files here
            </p>
          ))}
      </DropZone>
      {files.length > 0 && (
        <ul className="mt-3 flex flex-col gap-2">
          {files.map((file, index) => (
            <li key={`${file.name}-${index}`}>
              {itemTemplate ? (
                itemTemplate(file, () => removeAt(index))
              ) : (
                <span className="flex items-center justify-between gap-3">
                  <span>{file.name}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${file.name}`}
                    onClick={() => removeAt(index)}
                    className="text-[var(--text-color-secondary)]"
                  >
                    Remove
                  </button>
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd packages/ui && pnpm test src/file-upload.test.tsx`
Expected: PASS (5 tests). Si `user.upload` no encuentra el input, confirmá con `console.log(container.innerHTML)` que `FileTrigger` renderiza `<input type="file">` (lo hace, oculto).

- [ ] **Step 6: Add the exports entry**

In `packages/ui/package.json` `exports`:
```json
"./file-upload": { "types": "./dist/file-upload.d.ts", "import": "./dist/file-upload.js" },
```

- [ ] **Step 7: Verify the build**

Run: `cd packages/ui && pnpm build`
Expected: `dist/file-upload.js` + `dist/file-upload.d.ts`, no type errors.

- [ ] **Step 8: Commit**

```bash
git add packages/ui/src/file-upload.tsx packages/ui/src/file-upload.test.tsx packages/ui/package.json
git commit -m "feat(ui): add file-upload wrapper (RAC DropZone + FileTrigger)"
```

---

### Task 3: chart (Recharts)

**Files:**
- Create: `packages/ui/src/chart.tsx`
- Test: `packages/ui/src/chart.test.tsx`
- Modify: `packages/ui/package.json` (dep `recharts`; exports `./chart`)

**Interfaces:**
- Consumes: `recharts@^2.15.0` → `ResponsiveContainer`, `LineChart/Line`, `BarChart/Bar`, `AreaChart/Area`, `PieChart/Pie/Cell`, `RadarChart/Radar/PolarGrid/PolarAngleAxis/PolarRadiusAxis`, `XAxis/YAxis/CartesianGrid/Tooltip/Legend`.
- Produces:
  ```ts
  type ChartType = "line" | "bar" | "area" | "pie" | "doughnut" | "radar";
  interface ChartDataset { label?: string; data: number[]; backgroundColor?: string | string[]; borderColor?: string | string[]; }
  interface ChartData { labels: string[]; datasets: ChartDataset[]; }
  interface ChartProps { type: ChartType; data: ChartData; height?: number; className?: string; }
  function Chart(props: ChartProps): JSX.Element
  ```
  Diseño: API mantiene el data-shape de chart.js (`{labels, datasets}`); internamente adapta a filas Recharts `[{name, <serie>: n, ...}]`. Colores default desde tokens si el dataset no trae color.

- [ ] **Step 1: Add the dependency**

Run: `cd packages/ui && pnpm add recharts@^2.15.0`
Expected: `recharts` en `dependencies` (soporta React 19 desde 2.13).

- [ ] **Step 2: Write the failing test**

`packages/ui/src/chart.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import { cloneElement, type ReactElement } from "react";

// Recharts ResponsiveContainer mide el padre con ResizeObserver; en jsdom es 0x0
// y no dibuja. Lo reemplazamos para inyectar tamaño fijo al chart hijo.
vi.mock("recharts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("recharts")>();
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: ReactElement }) =>
      cloneElement(children, { width: 400, height: 300 }),
  };
});

import { Chart } from "./chart";

const data = {
  labels: ["Q1", "Q2", "Q3"],
  datasets: [{ label: "Sales", data: [10, 20, 30], borderColor: "#f00" }],
};

describe("Chart", () => {
  test("renders a line chart svg surface", () => {
    const { container } = render(<Chart type="line" data={data} />);
    expect(container.querySelector("svg.recharts-surface")).toBeTruthy();
  });

  test("renders a legend entry with the dataset label", () => {
    render(<Chart type="bar" data={data} />);
    expect(screen.getByText("Sales")).toBeInTheDocument();
  });

  test("renders pie slices from the first dataset", () => {
    const { container } = render(
      <Chart
        type="pie"
        data={{ labels: ["A", "B"], datasets: [{ data: [1, 2], backgroundColor: ["#f00", "#0f0"] }] }}
      />,
    );
    expect(container.querySelectorAll(".recharts-pie-sector").length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd packages/ui && pnpm test src/chart.test.tsx`
Expected: FAIL — `Failed to resolve import "./chart"`.

- [ ] **Step 4: Write minimal implementation**

`packages/ui/src/chart.tsx`:
```tsx
"use client";
import {
  ResponsiveContainer,
  LineChart, Line,
  BarChart, Bar,
  AreaChart, Area,
  PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import type { ReactElement } from "react";

export type ChartType = "line" | "bar" | "area" | "pie" | "doughnut" | "radar";
export interface ChartDataset {
  label?: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
}
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}
export interface ChartProps {
  type: ChartType;
  data: ChartData;
  height?: number;
  className?: string;
}

const FALLBACK_COLORS = [
  "var(--accent)",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#a855f7",
];

function toRows(data: ChartData) {
  return data.labels.map((label, i) => {
    const row: Record<string, string | number> = { name: label };
    data.datasets.forEach((ds, di) => {
      row[ds.label ?? `series-${di}`] = ds.data[i];
    });
    return row;
  });
}

function pick(c: string | string[] | undefined): string | undefined {
  return Array.isArray(c) ? c[0] : c;
}

function colorOf(ds: ChartDataset | undefined, i: number, prefer: "border" | "bg"): string {
  if (!ds) return FALLBACK_COLORS[i % FALLBACK_COLORS.length];
  const primary = prefer === "border" ? pick(ds.borderColor) : pick(ds.backgroundColor);
  const secondary = prefer === "border" ? pick(ds.backgroundColor) : pick(ds.borderColor);
  return primary ?? secondary ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length];
}

export function Chart({ type, data, height = 300, className }: ChartProps) {
  const rows = toRows(data);
  const keys = data.datasets.map((ds, i) => ds.label ?? `series-${i}`);

  let chart: ReactElement;
  if (type === "pie" || type === "doughnut") {
    const ds = data.datasets[0];
    const pieData = data.labels.map((label, i) => ({ name: label, value: ds?.data[i] ?? 0 }));
    const colors = Array.isArray(ds?.backgroundColor) ? ds!.backgroundColor : FALLBACK_COLORS;
    chart = (
      <PieChart>
        <Pie
          data={pieData}
          dataKey="value"
          nameKey="name"
          innerRadius={type === "doughnut" ? "55%" : 0}
          outerRadius="80%"
        >
          {pieData.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    );
  } else if (type === "radar") {
    chart = (
      <RadarChart data={rows}>
        <PolarGrid />
        <PolarAngleAxis dataKey="name" />
        <PolarRadiusAxis />
        {keys.map((k, i) => (
          <Radar
            key={k}
            dataKey={k}
            stroke={colorOf(data.datasets[i], i, "border")}
            fill={colorOf(data.datasets[i], i, "bg")}
            fillOpacity={0.4}
          />
        ))}
        <Tooltip />
        <Legend />
      </RadarChart>
    );
  } else if (type === "bar") {
    chart = (
      <BarChart data={rows}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        {keys.map((k, i) => (
          <Bar key={k} dataKey={k} fill={colorOf(data.datasets[i], i, "bg")} />
        ))}
      </BarChart>
    );
  } else if (type === "area") {
    chart = (
      <AreaChart data={rows}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        {keys.map((k, i) => (
          <Area
            key={k}
            type="monotone"
            dataKey={k}
            stroke={colorOf(data.datasets[i], i, "border")}
            fill={colorOf(data.datasets[i], i, "bg")}
            fillOpacity={0.3}
          />
        ))}
      </AreaChart>
    );
  } else {
    chart = (
      <LineChart data={rows}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        {keys.map((k, i) => (
          <Line key={k} type="monotone" dataKey={k} stroke={colorOf(data.datasets[i], i, "border")} />
        ))}
      </LineChart>
    );
  }

  return (
    <div className={className} style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        {chart}
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd packages/ui && pnpm test src/chart.test.tsx`
Expected: PASS (3 tests). Si una serie no aparece, `console.log(container.innerHTML)` para ver la estructura Recharts.

- [ ] **Step 6: Add the exports entry**

In `packages/ui/package.json` `exports`:
```json
"./chart": { "types": "./dist/chart.d.ts", "import": "./dist/chart.js" },
```

- [ ] **Step 7: Verify the build**

Run: `cd packages/ui && pnpm build`
Expected: `dist/chart.js` + `dist/chart.d.ts`, no type errors.

- [ ] **Step 8: Commit**

```bash
git add packages/ui/src/chart.tsx packages/ui/src/chart.test.tsx packages/ui/package.json
git commit -m "feat(ui): add chart wrapper (Recharts, chart.js data-shape adapter)"
```

---

### Task 4: tree (RAC Tree)

**Files:**
- Create: `packages/ui/src/tree.tsx`
- Test: `packages/ui/src/tree.test.tsx`
- Modify: `packages/ui/package.json` (exports `./tree`; dep `react-aria-components` ya agregada en Task 2)

**Interfaces:**
- Consumes: `react-aria-components` → `Tree`, `TreeItem`, `TreeItemContent`, `Collection`, `Button`, `Checkbox`, type `Selection`. `Tree` es `CollectionProps` (render dinámico con `items` + función). `TreeItem` requiere `textValue: string` y usa `item.id` como key. `TreeItemContent` acepta children como función con render-props `{ hasChildItems, ... }`. `onSelectionChange(keys: Selection)` donde `Selection = "all" | Set<Key>`.
- Produces:
  ```ts
  interface TreeItemData { id: string; label: ReactNode; textValue?: string; children?: TreeItemData[]; }
  interface TreeProps {
    items: TreeItemData[];
    selectionMode?: "none" | "single" | "multiple";
    selectedKeys?: Iterable<string>;
    defaultSelectedKeys?: Iterable<string>;
    onSelectionChange?: (keys: Set<string>) => void;
    "aria-label": string;
    className?: string;
  }
  function Tree(props: TreeProps): JSX.Element
  ```
  Nota: la API usa `id` (no `key`), porque RAC keyea las colecciones dinámicas por `item.id`.

- [ ] **Step 1: Write the failing test**

`packages/ui/src/tree.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi } from "vitest";
import { Tree } from "./tree";

const items = [
  {
    id: "docs",
    label: "Documents",
    children: [
      { id: "work", label: "Work" },
      { id: "home", label: "Home" },
    ],
  },
  { id: "pics", label: "Pictures" },
];

describe("Tree", () => {
  test("renders top-level items", () => {
    render(<Tree items={items} aria-label="Files" />);
    expect(screen.getByText("Documents")).toBeInTheDocument();
    expect(screen.getByText("Pictures")).toBeInTheDocument();
  });

  test("calls onSelectionChange with the selected key", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(
      <Tree
        items={items}
        aria-label="Files"
        selectionMode="multiple"
        onSelectionChange={onSelectionChange}
      />,
    );
    const checkbox = screen.getByRole("checkbox", { name: /select pictures/i });
    await user.click(checkbox);
    expect(onSelectionChange).toHaveBeenCalledWith(new Set(["pics"]));
  });
});
```

> **Nota RAC para el implementer:** los nodos hijos (`Work`/`Home`) NO están en el DOM hasta expandir el nodo padre (RAC arranca colapsado), por eso el primer test solo asserta los top-level. Antes de dar por verde, confirmá la estructura real con `console.log(container.innerHTML)` (convención CLAUDE.md para RAC en jsdom): verificá que `Checkbox slot="selection"` emite un `role="checkbox"` con el `aria-label` esperado. Si RAC no expone el checkbox como `role=checkbox` en jsdom, ajustá el render del `Checkbox` (no el contrato del wrapper) para que el assert semántico funcione.

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/ui && pnpm test src/tree.test.tsx`
Expected: FAIL — `Failed to resolve import "./tree"`.

- [ ] **Step 3: Write minimal implementation**

`packages/ui/src/tree.tsx`:
```tsx
"use client";
import {
  Tree as RACTree,
  TreeItem,
  TreeItemContent,
  Collection,
  Button,
  Checkbox,
  type Selection,
} from "react-aria-components";
import type { ReactNode } from "react";

export interface TreeItemData {
  id: string;
  label: ReactNode;
  textValue?: string;
  children?: TreeItemData[];
}

export interface TreeProps {
  items: TreeItemData[];
  selectionMode?: "none" | "single" | "multiple";
  selectedKeys?: Iterable<string>;
  defaultSelectedKeys?: Iterable<string>;
  onSelectionChange?: (keys: Set<string>) => void;
  "aria-label": string;
  className?: string;
}

function allIds(nodes: TreeItemData[]): string[] {
  return nodes.flatMap((n) => [n.id, ...(n.children ? allIds(n.children) : [])]);
}

export function Tree({
  items,
  selectionMode = "none",
  selectedKeys,
  defaultSelectedKeys,
  onSelectionChange,
  className,
  ...rest
}: TreeProps) {
  const ariaLabel = rest["aria-label"];

  function handle(keys: Selection) {
    if (!onSelectionChange) return;
    if (keys === "all") onSelectionChange(new Set(allIds(items)));
    else onSelectionChange(new Set(Array.from(keys, String)));
  }

  function renderItem(item: TreeItemData): ReactNode {
    const text = item.textValue ?? (typeof item.label === "string" ? item.label : item.id);
    return (
      <TreeItem id={item.id} textValue={text}>
        <TreeItemContent>
          {({ hasChildItems }) => (
            <div className="flex items-center gap-2 py-1">
              {hasChildItems ? (
                <Button slot="chevron" aria-label="Toggle" className="cursor-pointer px-1">
                  ▸
                </Button>
              ) : (
                <span className="inline-block w-4" aria-hidden="true" />
              )}
              {selectionMode !== "none" && (
                <Checkbox slot="selection" aria-label={`Select ${text}`} />
              )}
              <span>{item.label}</span>
            </div>
          )}
        </TreeItemContent>
        <Collection items={item.children ?? []}>
          {(child) => renderItem(child as TreeItemData)}
        </Collection>
      </TreeItem>
    );
  }

  return (
    <RACTree
      aria-label={ariaLabel}
      selectionMode={selectionMode}
      selectedKeys={selectedKeys as Selection | undefined}
      defaultSelectedKeys={defaultSelectedKeys as Selection | undefined}
      onSelectionChange={handle}
      items={items}
      className={className}
    >
      {(item) => renderItem(item as TreeItemData)}
    </RACTree>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/ui && pnpm test src/tree.test.tsx`
Expected: PASS (2 tests). Si el checkbox no aparece con `role=checkbox`, inspeccioná `container.innerHTML` y ajustá el render del `Checkbox` (slot/children) para que sea accesible.

- [ ] **Step 5: Add the exports entry**

In `packages/ui/package.json` `exports`:
```json
"./tree": { "types": "./dist/tree.d.ts", "import": "./dist/tree.js" },
```

- [ ] **Step 6: Verify the build**

Run: `cd packages/ui && pnpm build`
Expected: `dist/tree.js` + `dist/tree.d.ts`, no type errors.

- [ ] **Step 7: Commit**

```bash
git add packages/ui/src/tree.tsx packages/ui/src/tree.test.tsx packages/ui/package.json
git commit -m "feat(ui): add tree wrapper (RAC Tree, hierarchical + checkbox selection)"
```

---

### Task 5: rich-text (TipTap v2)

**Files:**
- Create: `packages/ui/src/rich-text.tsx`
- Test: `packages/ui/src/rich-text.test.tsx`
- Modify: `packages/ui/package.json` (deps `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/pm`; exports `./rich-text`)

**Interfaces:**
- Consumes: `@tiptap/react` → `useEditor`, `EditorContent`; `@tiptap/starter-kit` → `StarterKit`. `useEditor({ extensions, content, onUpdate, editorProps, immediatelyRender })`. `editor.chain().focus().toggleBold().run()`, `editor.isActive("bold")`, `editor.getHTML()`, `editor.commands.setContent(html, false)`.
- Produces:
  ```ts
  interface RichTextProps {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
    minHeight?: number;
    className?: string;
  }
  function RichText(props: RichTextProps): JSX.Element | null
  ```

- [ ] **Step 1: Add the dependencies**

Run: `cd packages/ui && pnpm add @tiptap/react@^2.11.0 @tiptap/starter-kit@^2.11.0 @tiptap/pm@^2.11.0`
Expected: las 3 en `dependencies` (peer react >=17, OK con React 19).

- [ ] **Step 2: Write the failing test**

`packages/ui/src/rich-text.test.tsx`:
```tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect } from "vitest";
import { RichText } from "./rich-text";

describe("RichText", () => {
  test("renders the toolbar and the editable region with initial content", async () => {
    render(<RichText value="<p>Hello</p>" onChange={() => {}} />);
    expect(await screen.findByRole("toolbar", { name: /formatting/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Bold" })).toBeInTheDocument();
    expect(await screen.findByRole("textbox")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("Hello")).toBeInTheDocument());
  });

  test("toggles bold via the toolbar button", async () => {
    const user = userEvent.setup();
    render(<RichText value="<p>Hi</p>" onChange={() => {}} />);
    const bold = await screen.findByRole("button", { name: "Bold" });
    await user.click(bold);
    await waitFor(() => expect(bold).toHaveAttribute("aria-pressed", "true"));
  });
});
```

> **Nota TipTap/jsdom para el implementer:** TipTap monta ProseMirror sobre un `contenteditable` (rol implícito `textbox`). Con `immediatelyRender: false` el primer render devuelve `null` y el editor aparece tras el efecto — por eso `findByRole`/`waitFor`. Si ProseMirror tira en jsdom por APIs de DOM ausentes (`getClientRects`, Range) y el segundo test (toggle bold) resulta inestable, **degradá**: mantené el primer test (toolbar + textbox montan, contenido inicial visible) y reemplazá el toggle por un smoke (`expect(RichText).toBeDefined()`), documentando en el commit/reporte que el toggle no es testeable en jsdom. No degradar el primer test salvo que ProseMirror no monte en absoluto.

- [ ] **Step 3: Run test to verify it fails**

Run: `cd packages/ui && pnpm test src/rich-text.test.tsx`
Expected: FAIL — `Failed to resolve import "./rich-text"`.

- [ ] **Step 4: Write minimal implementation**

`packages/ui/src/rich-text.tsx`:
```tsx
"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

export interface RichTextProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  className?: string;
}

export function RichText({ value, onChange, minHeight = 200, className = "" }: RichTextProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "max-w-none focus:outline-none",
        style: `min-height:${minHeight}px`,
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  if (!editor) return null;

  const btnClass = (active: boolean) =>
    `px-2 py-1 text-sm rounded ${active ? "bg-[var(--accent)] text-white" : "text-[var(--text-color)]"}`;

  return (
    <div className={`rounded-md border border-[var(--surface-border)] ${className}`}>
      <div
        className="flex gap-1 border-b border-[var(--surface-border)] p-1"
        role="toolbar"
        aria-label="Formatting"
      >
        <button
          type="button"
          aria-label="Bold"
          aria-pressed={editor.isActive("bold")}
          className={btnClass(editor.isActive("bold"))}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          B
        </button>
        <button
          type="button"
          aria-label="Italic"
          aria-pressed={editor.isActive("italic")}
          className={btnClass(editor.isActive("italic"))}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          I
        </button>
        <button
          type="button"
          aria-label="Bullet list"
          aria-pressed={editor.isActive("bulletList")}
          className={btnClass(editor.isActive("bulletList"))}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          •
        </button>
        <button
          type="button"
          aria-label="Ordered list"
          aria-pressed={editor.isActive("orderedList")}
          className={btnClass(editor.isActive("orderedList"))}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1.
        </button>
      </div>
      <EditorContent editor={editor} className="p-3" />
    </div>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd packages/ui && pnpm test src/rich-text.test.tsx`
Expected: PASS (2 tests, o 1 test + 1 smoke si se degradó el toggle per la nota).

- [ ] **Step 6: Add the exports entry**

In `packages/ui/package.json` `exports`:
```json
"./rich-text": { "types": "./dist/rich-text.d.ts", "import": "./dist/rich-text.js" },
```

- [ ] **Step 7: Verify the build**

Run: `cd packages/ui && pnpm build`
Expected: `dist/rich-text.js` + `dist/rich-text.d.ts`, no type errors.

- [ ] **Step 8: Commit**

```bash
git add packages/ui/src/rich-text.tsx packages/ui/src/rich-text.test.tsx packages/ui/package.json
git commit -m "feat(ui): add rich-text wrapper (TipTap v2, HTML value)"
```

---

### Task 6: event-calendar (FullCalendar)

**Files:**
- Create: `packages/ui/src/event-calendar.tsx`
- Test: `packages/ui/src/event-calendar.test.tsx`
- Modify: `packages/ui/package.json` (deps `@fullcalendar/*`; exports `./event-calendar`)

**Interfaces:**
- Consumes: `@fullcalendar/react` (default export `FullCalendar`), `@fullcalendar/daygrid` (`dayGridPlugin`), `@fullcalendar/timegrid` (`timeGridPlugin`), `@fullcalendar/interaction` (`interactionPlugin`). Props FC: `plugins`, `initialView`, `initialDate`, `events`, `editable`, `selectable`, `selectMirror`, `dayMaxEvents`, `height`, `headerToolbar`, `eventClick(arg)` (`arg.event.id`), `select(arg)` (`arg.start/end/allDay`). FC v6 inyecta sus estilos vía JS (sin import CSS). Theming por CSS vars `--fc-*` seteadas inline en un wrapper div.
- Produces:
  ```ts
  interface CalendarEvent { id?: string; title: string; start: string | Date; end?: string | Date; allDay?: boolean; backgroundColor?: string; borderColor?: string; textColor?: string; }
  interface EventCalendarProps {
    events: CalendarEvent[];
    initialView?: "dayGridMonth" | "timeGridWeek" | "timeGridDay";
    initialDate?: string | Date;
    editable?: boolean;
    selectable?: boolean;
    height?: number;
    headerToolbar?: { left?: string; center?: string; right?: string } | false;
    onEventClick?: (eventId: string) => void;
    onSelect?: (range: { start: Date; end: Date; allDay: boolean }) => void;
  }
  function EventCalendar(props: EventCalendarProps): JSX.Element
  ```

- [ ] **Step 1: Add the dependencies**

Run: `cd packages/ui && pnpm add @fullcalendar/react@^6.1.15 @fullcalendar/daygrid@^6.1.15 @fullcalendar/timegrid@^6.1.15 @fullcalendar/interaction@^6.1.15`
Expected: las 4 en `dependencies`.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/event-calendar.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { describe, test, expect, beforeAll } from "vitest";
import { EventCalendar } from "./event-calendar";

// FullCalendar usa APIs de browser ausentes en jsdom.
beforeAll(() => {
  if (!window.matchMedia) {
    // @ts-expect-error minimal polyfill
    window.matchMedia = () => ({
      matches: false,
      media: "",
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    });
  }
  if (!globalThis.ResizeObserver) {
    // @ts-expect-error minimal polyfill
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
});

const events = [{ id: "1", title: "Launch Party", start: "2026-06-15" }];

describe("EventCalendar", () => {
  test("renders events for the initial date", () => {
    render(<EventCalendar events={events} initialDate="2026-06-01" />);
    expect(screen.getByText("Launch Party")).toBeInTheDocument();
  });

  test("renders the toolbar title for the month", () => {
    render(<EventCalendar events={events} initialDate="2026-06-01" />);
    expect(screen.getByText(/June 2026/i)).toBeInTheDocument();
  });
});
```

> **Nota FC/jsdom para el implementer:** FullCalendar v6 renderiza una tabla DOM y debería montar en jsdom con los polyfills de arriba. Si aun así tira al montar (p.ej. layout/measure), **degradá** a un smoke: `expect(EventCalendar).toBeDefined()` + render sin throw dentro de `try/catch` no — en su lugar, un único test que renderiza y asserta que NO lanza y que el contenedor `.fc` existe (`container.querySelector(".fc")`). Documentá la degradación en el reporte. Mantené los polyfills en el archivo de test (no tocar `test-setup.ts` global salvo que otro test los necesite).

- [ ] **Step 3: Run test to verify it fails**

Run: `cd packages/ui && pnpm test src/event-calendar.test.tsx`
Expected: FAIL — `Failed to resolve import "./event-calendar"`.

- [ ] **Step 4: Write minimal implementation**

`packages/ui/src/event-calendar.tsx`:
```tsx
"use client";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { CSSProperties } from "react";

export interface CalendarEvent {
  id?: string;
  title: string;
  start: string | Date;
  end?: string | Date;
  allDay?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
}

export interface EventCalendarProps {
  events: CalendarEvent[];
  initialView?: "dayGridMonth" | "timeGridWeek" | "timeGridDay";
  initialDate?: string | Date;
  editable?: boolean;
  selectable?: boolean;
  height?: number;
  headerToolbar?: { left?: string; center?: string; right?: string } | false;
  onEventClick?: (eventId: string) => void;
  onSelect?: (range: { start: Date; end: Date; allDay: boolean }) => void;
}

const DEFAULT_TOOLBAR = {
  left: "prev,next today",
  center: "title",
  right: "dayGridMonth,timeGridWeek,timeGridDay",
};

// Mapea las CSS vars de FullCalendar v6 a los tokens de @lindaui/tokens.
const fcVars = {
  "--fc-border-color": "var(--surface-border)",
  "--fc-button-bg-color": "var(--accent)",
  "--fc-button-border-color": "var(--accent)",
  "--fc-button-hover-bg-color": "var(--accent)",
  "--fc-button-hover-border-color": "var(--accent)",
  "--fc-button-active-bg-color": "var(--accent)",
  "--fc-button-active-border-color": "var(--accent)",
  "--fc-today-bg-color": "color-mix(in oklch, var(--accent) 12%, transparent)",
  "--fc-neutral-bg-color": "var(--overlay)",
  "--fc-event-bg-color": "var(--accent)",
  "--fc-event-border-color": "var(--accent)",
} as CSSProperties;

export function EventCalendar({
  events,
  initialView = "dayGridMonth",
  initialDate,
  editable = false,
  selectable = false,
  height = 720,
  headerToolbar = DEFAULT_TOOLBAR,
  onEventClick,
  onSelect,
}: EventCalendarProps) {
  return (
    <div style={fcVars}>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={initialView}
        initialDate={initialDate}
        events={events}
        editable={editable}
        selectable={selectable}
        selectMirror
        dayMaxEvents
        height={height}
        headerToolbar={headerToolbar}
        eventClick={(arg) => onEventClick?.(arg.event.id)}
        select={(arg) => onSelect?.({ start: arg.start, end: arg.end, allDay: arg.allDay })}
      />
    </div>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd packages/ui && pnpm test src/event-calendar.test.tsx`
Expected: PASS (2 tests, o 1 smoke si se degradó per la nota).

- [ ] **Step 6: Add the exports entry**

In `packages/ui/package.json` `exports`:
```json
"./event-calendar": { "types": "./dist/event-calendar.d.ts", "import": "./dist/event-calendar.js" },
```

- [ ] **Step 7: Verify the full build + whole suite**

Run: `cd packages/ui && pnpm build && pnpm test`
Expected: bunchee + tsc limpios con las 6 entries nuevas; toda la suite vitest verde.

- [ ] **Step 8: Commit**

```bash
git add packages/ui/src/event-calendar.tsx packages/ui/src/event-calendar.test.tsx packages/ui/package.json
git commit -m "feat(ui): add event-calendar wrapper (FullCalendar, token CSS vars)"
```

---

### Task 7: Actualizar CLAUDE.md (protocolo de auto-actualización)

**Files:**
- Modify: `CLAUDE.md`

No tiene test (es documentación), pero es deliverable obligatorio del "Protocolo de auto-actualización" de CLAUDE.md: se descubrieron una categoría de wrapper nueva, 6 entries nuevas y varias trampas.

- [ ] **Step 1: Agregar la 4ª categoría de wrapper**

En la sección **"`@lindaui/ui` — estilos de wrapper"**, después de "3. Compound re-export", agregar:
```markdown
### 4. Wrapper sobre lib externa (no HeroUI)

Para gaps que HeroUI v3 no cubre, se envuelve una lib externa detrás de API propia
(misma regla que el wrapper ergonómico: NO se filtran los types de la lib externa).
Casos actuales:
- `chart` → **Recharts** (SVG). API pública mantiene el data-shape de chart.js
  (`{labels, datasets}`); internamente adapta a filas Recharts. Colores default desde tokens.
- `tree` → **RAC `Tree`** de `react-aria-components` (NO sale de `@heroui/react`; dep explícita).
  API `items`/`selectionMode`/`selectedKeys`/`onSelectionChange(Set<string>)`. Usa `id` por nodo.
- `rich-text` → **TipTap v2** (ProseMirror). API `value`/`onChange(html)`. `immediatelyRender:false` (SSR Next).
- `event-calendar` → **@fullcalendar/react** (v6, estilos vía JS). Theming por CSS vars `--fc-*` inline a tokens.
- `timeline` → **bespoke** (render-props, sin lib).
- `file-upload` → **bespoke** sobre RAC `DropZone` + `FileTrigger` (sin auto-upload; el consumidor sube en `onSelect`).
```

- [ ] **Step 2: Actualizar el conteo de entries y deps en "Arquitectura"**

En el diagrama/línea de Arquitectura, cambiar el conteo de entries de `@lindaui/ui` de **66** a **72**. En las dependencies reales de `@lindaui/ui`, agregar: `recharts`, `@tiptap/react`+`@tiptap/starter-kit`+`@tiptap/pm`, `@fullcalendar/react`+`daygrid`+`timegrid`+`interaction`, `react-aria-components`.

- [ ] **Step 3: Agregar anti-regresiones nuevas**

En **"Anti-regresiones"**, agregar:
```markdown
10. **`react-aria-components` no sale de `@heroui/react`** → para `tree` (RAC `Tree`) y
    `file-upload` (RAC `DropZone`/`FileTrigger`) se importa directo de `react-aria-components`
    (dep explícita `^1.18.0`). No asumir que HeroUI re-exporta toda la superficie RAC.
11. **Recharts en jsdom** → `ResponsiveContainer` mide el padre con ResizeObserver y en jsdom
    da 0x0 (no dibuja). En tests, mockear `ResponsiveContainer` clonando el hijo con
    `width`/`height` fijos (ver `chart.test.tsx`).
12. **TipTap + Next SSR** → `useEditor({ immediatelyRender: false })` o rompe la hidratación.
    El primer render devuelve `null`; el editor aparece tras el efecto (tests con `findByRole`).
13. **FullCalendar v6** → no se importa CSS (estilos vía JS). Theming por CSS vars `--fc-*`
    seteadas inline en un wrapper div → tokens. En jsdom necesita polyfills de `matchMedia` y
    `ResizeObserver` (en el archivo de test, no global).
```

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: CLAUDE.md — 4ª categoría de wrapper + 6 entries Fase 1 + anti-regresiones"
```

---

## Self-Review

**1. Spec coverage:**
- 6 wrappers del spec → Tasks 1-6. ✅
- API propia sin filtrar types externos → constraint global + cada wrapper expone interface propia. ✅
- Entry en exports map por wrapper → Step "Add the exports entry" en cada task. ✅
- Deps reales en `dependencies` → constraint global + Step "Add the dependency". ✅
- Testing con degradación jsdom → notas por task (chart mock, tree DOM-inspect, rich-text degrade, FC polyfills/degrade). ✅
- 4ª categoría de wrapper en CLAUDE.md → Task 7. ✅
- `onUpload` descartado (YAGNI) → documentado en constraints + interface de Task 2 sin él. Desviación intencional del spec, marcada.
- Orden de entrega (timeline→…→event-calendar) → respetado. ✅

**2. Placeholder scan:** sin TBD/TODO. Las "notas para el implementer" dan código completo + criterio de degradación concreto (qué test cae, a qué smoke), no son placeholders.

**3. Type consistency:** `TreeItemData` usa `id` consistente entre interface, render y test. `ChartData`/`ChartDataset` consistentes entre adapter y test. `CalendarEvent` consistente. `Set<string>` en `onSelectionChange` consistente (wrapper convierte `Selection` de RAC). Nombres de export (`Timeline`, `FileUpload`, `Chart`, `Tree`, `RichText`, `EventCalendar`) consistentes con sus entries del map.
