# Test Coverage Gap (@lindaui/ui) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Llevar a 0 los módulos de `@lindaui/ui` sin test: tests de render reales para los 9 thin-wrap y una suite `toBeDefined` para los 22 compound re-export.

**Architecture:** Tests co-locados Vitest + jsdom + Testing Library. Los 9 thin-wrap llevan archivo `*.test.tsx` propio con una aserción de render. Los 22 re-export se cubren en una sola suite nueva `src/compound-exports.test.tsx` (mismo patrón que el `date-time-color.test.tsx` existente). **Nota TDD:** la implementación (los wrappers) ya existe; estos son tests de caracterización, así que el ciclo es write → run → PASS (si un test falla, la aserción/rol asumido es incorrecto → corregir la aserción, no el wrapper).

**Tech Stack:** Vitest 2, jsdom, @testing-library/react 16, @testing-library/user-event 14, @testing-library/jest-dom 6.

## Global Constraints

- Tests co-locados: `src/x.tsx` ↔ `src/x.test.tsx`.
- Solo queries semánticas (`getByRole`/`getByLabelText`/`getByText`). **Prohibido `getByTestId`.**
- Para compound re-exports que requieren composición pesada, afirmar que el export resuelve (`toBeDefined`), no renderizar media composición — precedente: `src/date-time-color.test.tsx`.
- `container.firstChild` toBeInTheDocument es aserción válida de "renderizó DOM sin throw" (no es un test-id query) para thin-wraps cuyo rol ARIA no es estable/conocido en jsdom; no adivinar roles.
- Comando de test: `pnpm --filter @lindaui/ui test` (o `cd packages/ui && pnpm test`). Un archivo: `pnpm --filter @lindaui/ui test src/<file>.test.tsx`.

---

### Task 1: Tests de render para display thin-wraps (avatar, chip, spinner, skeleton)

**Files:**
- Create: `packages/ui/src/avatar.test.tsx`
- Create: `packages/ui/src/chip.test.tsx`
- Create: `packages/ui/src/spinner.test.tsx`
- Create: `packages/ui/src/skeleton.test.tsx`

**Interfaces:**
- Consumes: exports reales — `Avatar` (`./avatar`), `Chip` (`./chip`), `Spinner` (`./spinner`), `Skeleton` (`./skeleton`). Todos son `function X(props){ return <HeroX {...props}/> }`.
- Produces: 4 módulos salen del gap.

- [ ] **Step 1: Escribir los 4 tests**

`packages/ui/src/avatar.test.tsx`:
```tsx
import { render } from "@testing-library/react";
import { Avatar } from "./avatar";
import { describe, test, expect } from "vitest";

describe("Avatar", () => {
  test("renders DOM", () => {
    const { container } = render(<Avatar />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
```

`packages/ui/src/chip.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { Chip } from "./chip";
import { describe, test, expect } from "vitest";

describe("Chip", () => {
  test("renders children", () => {
    render(<Chip>Activo</Chip>);
    expect(screen.getByText("Activo")).toBeInTheDocument();
  });
});
```

`packages/ui/src/spinner.test.tsx`:
```tsx
import { render } from "@testing-library/react";
import { Spinner } from "./spinner";
import { describe, test, expect } from "vitest";

describe("Spinner", () => {
  test("renders DOM", () => {
    const { container } = render(<Spinner />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
```

`packages/ui/src/skeleton.test.tsx`:
```tsx
import { render } from "@testing-library/react";
import { Skeleton } from "./skeleton";
import { describe, test, expect } from "vitest";

describe("Skeleton", () => {
  test("renders DOM", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Correr los 4**

Run: `pnpm --filter @lindaui/ui test src/avatar.test.tsx src/chip.test.tsx src/spinner.test.tsx src/skeleton.test.tsx`
Expected: PASS los 4. Si `Chip` no renderiza el texto plano como nodo de texto (poco probable), cambiar a la aserción `container.firstChild` como en los otros y dejar comentario del porqué.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/avatar.test.tsx packages/ui/src/chip.test.tsx packages/ui/src/spinner.test.tsx packages/ui/src/skeleton.test.tsx
git commit -m "test(ui): render tests for avatar/chip/spinner/skeleton"
```

---

### Task 2: Tests de render para los *-group (checkbox-group, switch-group, toggle-button-group)

**Files:**
- Create: `packages/ui/src/checkbox-group.test.tsx`
- Create: `packages/ui/src/switch-group.test.tsx`
- Create: `packages/ui/src/toggle-button-group.test.tsx`

**Interfaces:**
- Consumes: `CheckboxGroup` (`./checkbox-group`), `SwitchGroup` (`./switch-group`), `ToggleButtonGroup` (`./toggle-button-group`). Todos thin-wrap `return <HeroX {...props}/>`.
- Produces: 3 módulos salen del gap.

**Nota:** el rol ARIA exacto de estos contenedores RAC en jsdom no es seguro de adivinar (group/toolbar/radiogroup según variante). Se usa `container.firstChild` para no acoplar a un rol incierto. Si al correr se confirma un rol estable, el ejecutor puede fortalecer a `getByRole`.

- [ ] **Step 1: Escribir los 3 tests**

`packages/ui/src/checkbox-group.test.tsx`:
```tsx
import { render } from "@testing-library/react";
import { CheckboxGroup } from "./checkbox-group";
import { describe, test, expect } from "vitest";

describe("CheckboxGroup", () => {
  test("renders DOM", () => {
    const { container } = render(<CheckboxGroup aria-label="opciones" />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
```

`packages/ui/src/switch-group.test.tsx`:
```tsx
import { render } from "@testing-library/react";
import { SwitchGroup } from "./switch-group";
import { describe, test, expect } from "vitest";

describe("SwitchGroup", () => {
  test("renders DOM", () => {
    const { container } = render(<SwitchGroup aria-label="ajustes" />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
```

`packages/ui/src/toggle-button-group.test.tsx`:
```tsx
import { render } from "@testing-library/react";
import { ToggleButtonGroup } from "./toggle-button-group";
import { describe, test, expect } from "vitest";

describe("ToggleButtonGroup", () => {
  test("renders DOM", () => {
    const { container } = render(<ToggleButtonGroup aria-label="vista" />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Correr los 3**

Run: `pnpm --filter @lindaui/ui test src/checkbox-group.test.tsx src/switch-group.test.tsx src/toggle-button-group.test.tsx`
Expected: PASS los 3. Si alguno tira por requerir items hijos para montar, envolver con un hijo mínimo válido del compound de HeroUI (revisar el `.d.ts` real del componente) o degradar a `expect(Componente).toBeDefined()` con comentario, como en `date-time-color.test.tsx`.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/checkbox-group.test.tsx packages/ui/src/switch-group.test.tsx packages/ui/src/toggle-button-group.test.tsx
git commit -m "test(ui): render tests for checkbox/switch/toggle-button groups"
```

---

### Task 3: Tests para input thin-wraps (input-group, otp-input)

**Files:**
- Create: `packages/ui/src/input-group.test.tsx`
- Create: `packages/ui/src/otp-input.test.tsx`

**Interfaces:**
- Consumes: `InputGroup` (`./input-group`, layout container), `OtpInput` (`./otp-input`, wrap de `InputOTP` que renderiza sus propios slots).
- Produces: 2 módulos salen del gap.

- [ ] **Step 1: Escribir los 2 tests**

`packages/ui/src/input-group.test.tsx`:
```tsx
import { render } from "@testing-library/react";
import { InputGroup } from "./input-group";
import { describe, test, expect } from "vitest";

describe("InputGroup", () => {
  test("renders DOM", () => {
    const { container } = render(<InputGroup />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
```

`packages/ui/src/otp-input.test.tsx`:
```tsx
import { render } from "@testing-library/react";
import { OtpInput } from "./otp-input";
import { describe, test, expect } from "vitest";

describe("OtpInput", () => {
  test("renders DOM", () => {
    const { container } = render(<OtpInput />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Correr los 2**

Run: `pnpm --filter @lindaui/ui test src/input-group.test.tsx src/otp-input.test.tsx`
Expected: PASS. Si `OtpInput` requiere props obligatorias (ej. `length`/`maxLength`), abrir `node_modules/.pnpm/@heroui+react@*/node_modules/@heroui/react/dist/components/input-otp/index.d.ts`, pasar el prop mínimo requerido, y re-correr.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/input-group.test.tsx packages/ui/src/otp-input.test.tsx
git commit -m "test(ui): render tests for input-group and otp-input"
```

---

### Task 4: Suite `toBeDefined` para los 22 compound re-export

**Files:**
- Create: `packages/ui/src/compound-exports.test.tsx`

**Interfaces:**
- Consumes: el export principal de cada uno de los 22 módulos re-export (nombres verificados contra la fuente):
  `Accordion`/accordion, `Breadcrumbs`/breadcrumbs, `Card`/card, `Disclosure`/disclosure, `DisclosureGroup`/disclosure-group, `Divider`/divider, `Drawer`/drawer, `Kbd`/kbd, `Link`/link, `ListBox`/listbox, `Meter`/meter, `Pagination`/pagination, `Popover`/popover, `Progress`/progress, `ProgressCircle`/progress-circle, `ScrollShadow`/scroll-shadow, `Surface`/surface, `Tag`/tag, `TagGroup`/tag-group, `Text`/text, `ToastProvider`+`toast`/toast, `Tooltip`/tooltip.
- Produces: 22 módulos salen del gap.

- [ ] **Step 1: Escribir la suite**

`packages/ui/src/compound-exports.test.tsx`:
```tsx
import { describe, test, expect } from "vitest";
import { Accordion } from "./accordion";
import { Breadcrumbs } from "./breadcrumbs";
import { Card } from "./card";
import { Disclosure } from "./disclosure";
import { DisclosureGroup } from "./disclosure-group";
import { Divider } from "./divider";
import { Drawer } from "./drawer";
import { Kbd } from "./kbd";
import { Link } from "./link";
import { ListBox } from "./listbox";
import { Meter } from "./meter";
import { Pagination } from "./pagination";
import { Popover } from "./popover";
import { Progress } from "./progress";
import { ProgressCircle } from "./progress-circle";
import { ScrollShadow } from "./scroll-shadow";
import { Surface } from "./surface";
import { Tag } from "./tag";
import { TagGroup } from "./tag-group";
import { Text } from "./text";
import { toast, ToastProvider } from "./toast";
import { Tooltip } from "./tooltip";

// These HeroUI v3 components are compound RAC compositions (Root/Content/...)
// that need sub-component assembly to render meaningfully; the wrappers
// re-export them, so we assert the public surface resolves rather than
// rendering a half-composition. Same approach as date-time-color.test.tsx.
describe("Compound re-export surface", () => {
  test.each([
    ["Accordion", Accordion],
    ["Breadcrumbs", Breadcrumbs],
    ["Card", Card],
    ["Disclosure", Disclosure],
    ["DisclosureGroup", DisclosureGroup],
    ["Divider", Divider],
    ["Drawer", Drawer],
    ["Kbd", Kbd],
    ["Link", Link],
    ["ListBox", ListBox],
    ["Meter", Meter],
    ["Pagination", Pagination],
    ["Popover", Popover],
    ["Progress", Progress],
    ["ProgressCircle", ProgressCircle],
    ["ScrollShadow", ScrollShadow],
    ["Surface", Surface],
    ["Tag", Tag],
    ["TagGroup", TagGroup],
    ["Text", Text],
    ["toast", toast],
    ["ToastProvider", ToastProvider],
    ["Tooltip", Tooltip],
  ])("%s is exported", (_name, exported) => {
    expect(exported).toBeDefined();
  });
});
```

- [ ] **Step 2: Correr la suite**

Run: `pnpm --filter @lindaui/ui test src/compound-exports.test.tsx`
Expected: PASS (23 casos). Si un import falla por nombre incorrecto, corregir el named import contra la fuente del módulo (`packages/ui/src/<x>.tsx`) — no contra memoria.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/compound-exports.test.tsx
git commit -m "test(ui): assert compound re-export surface resolves (22 modules)"
```

---

### Task 5: Verificar gap = 0 y suite completa verde

**Files:**
- Modify: ninguno.

**Interfaces:**
- Consumes: Tasks 1-4.
- Produces: evidencia de que el gap está cerrado.

- [ ] **Step 1: Re-correr el chequeo de gap**

Run:
```bash
cd packages/ui && comps=$(ls src/*.tsx src/*.ts | grep -vE '\.test\.|test-setup' | xargs -n1 basename | sed -E 's/\.(tsx|ts)$//' | sort -u); refd=$(grep -rhoE 'from "\./[a-z0-9-]+"' src/*.test.tsx src/*.test.ts | sed -E 's/from "\.\/([a-z0-9-]+)"/\1/' | sort -u); n=0; for c in $comps; do echo "$refd" | grep -qx "$c" || { echo "GAP: $c"; n=$((n+1)); }; done; echo "TOTAL gap real: $n"
```
Expected: `TOTAL gap real: 0` (sin líneas `GAP:`).

- [ ] **Step 2: Suite completa de `@lindaui/ui`**

Run: `pnpm --filter @lindaui/ui test`
Expected: todos los tests pasan, 0 skipped.

- [ ] **Step 3: Verificar ausencia de `getByTestId`**

Run: `grep -rn "getByTestId" packages/ui/src || echo "no testid"`
Expected: `no testid`.

- [ ] **Step 4: No hay commit (solo verificación). Registrar gap=0 en el reporte.**

---

## Self-Review

- **Cobertura del spec:** R1 (9 thin-wrap reales) → Tasks 1-3 (4+3+2 = 9 módulos). R2 (suite 22 re-export) → Task 4. R3 (regla honrada, gap=0) → Task 5. Criterios 1-6 → Tasks 1-5 (criterio 5 `no getByTestId` → Task 5 Step 3; criterio 6 `gap=0` → Task 5 Step 1).
- **Conteo:** 9 (Grupo 1) + 22 (Grupo 2) = 31, coincide con el gap medido. Módulos del Grupo 1: avatar, chip, spinner, skeleton (Task 1) + checkbox-group, switch-group, toggle-button-group (Task 2) + input-group, otp-input (Task 3). Grupo 2: los 22 de Task 4.
- **Placeholders:** ninguno — todo el código de test está completo inline.
- **Consistencia de nombres:** los named imports de la suite (Task 4) salen de los exports reales verificados en la fuente (`Separator as Divider` → `Divider`; `ProgressBar as Progress` → `Progress`; `Typography as Text` → `Text`; toast expone `toast` + `ToastProvider`). Los nombres de archivo de test = nombre de módulo + `.test.tsx`, co-locados.
- **Riesgo conocido:** los thin-wrap usan `container.firstChild` en vez de `getByRole` donde el rol RAC no es seguro; es deliberado (no adivinar roles), documentado en cada task, y fortalecible si el ejecutor confirma el rol al correr.
```
