# Behavioral Test Coverage (@ts/ui) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Subir de humo a comportamiento los tests de `checkbox-group` y `toggle-button-group` (selección, onChange, controlado, disabled) y endurecer `chip` con aceptación de props — sin tocar los módulos sin comportamiento real (switch-group/avatar/spinner/skeleton).

**Architecture:** Reescritura de 2 tests de humo existentes (`checkbox-group.test.tsx`, `toggle-button-group.test.tsx`) por tests de interacción que componen los wrappers hijos reales (`@ts/ui/checkbox`, `@ts/ui/toggle-button`); ampliación de `chip.test.tsx`. Vitest + jsdom + user-event. Las firmas (onChange `string[]`, onSelectionChange `Set`) y los roles ARIA se verifican al correr (TDD characterization sobre impl existente).

**Tech Stack:** Vitest 2, jsdom, @testing-library/react 16, @testing-library/user-event 14, @testing-library/jest-dom 6.

## Global Constraints

- Tests co-locados; solo queries semánticas (`getByRole`/`getByLabelText`/`getByText`). **Prohibido `getByTestId`.**
- Interacción vía `user-event`, no `fireEvent` crudo.
- HeroUI v3 es RAC: `CheckboxGroup` emite `onChange(string[])`; `ToggleButtonGroup` emite `onSelectionChange(Set<Key>)`. Verificado en los `.d.ts`. Si el rol/firma observado difiere al correr, ajustar la query/aserción a la realidad (no forzar el wrapper).
- No tocar `switch-group`, `avatar`, `spinner`, `skeleton` (sin comportamiento real — ver spec, rationale de exclusión).
- Mantener gap de cobertura en 0: estas reescrituras siguen referenciando sus módulos.
- Comando: `pnpm --filter @ts/ui test src/<file>.test.tsx`.

---

### Task 1: `checkbox-group` — tests de selección

**Files:**
- Modify (overwrite): `packages/ui/src/checkbox-group.test.tsx`

**Interfaces:**
- Consumes: `CheckboxGroup` (`./checkbox-group`, extiende RAC `CheckboxGroup`: `value`/`defaultValue`/`onChange(string[])`/`aria-label`), `Checkbox` (`./checkbox`, ergonomic wrapper que pasa `value` por spread y rinde `role=checkbox`).
- Produces: `checkbox-group` cubierto con comportamiento (reemplaza el smoke).

- [ ] **Step 1: Reescribir el test**

`packages/ui/src/checkbox-group.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CheckboxGroup } from "./checkbox-group";
import { Checkbox } from "./checkbox";
import { describe, test, expect, vi } from "vitest";

describe("CheckboxGroup", () => {
  test("renders child checkboxes under a group label", () => {
    render(
      <CheckboxGroup aria-label="frutas">
        <Checkbox value="a">Manzana</Checkbox>
        <Checkbox value="b">Banana</Checkbox>
      </CheckboxGroup>,
    );
    expect(screen.getByRole("checkbox", { name: "Manzana" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Banana" })).toBeInTheDocument();
  });

  test("onChange reports the selected values", async () => {
    const fn = vi.fn();
    render(
      <CheckboxGroup aria-label="frutas" onChange={fn}>
        <Checkbox value="a">Manzana</Checkbox>
        <Checkbox value="b">Banana</Checkbox>
      </CheckboxGroup>,
    );
    await userEvent.click(screen.getByRole("checkbox", { name: "Manzana" }));
    expect(fn).toHaveBeenCalledWith(["a"]);
  });

  test("controlled value renders the checked state", () => {
    render(
      <CheckboxGroup aria-label="frutas" value={["b"]}>
        <Checkbox value="a">Manzana</Checkbox>
        <Checkbox value="b">Banana</Checkbox>
      </CheckboxGroup>,
    );
    expect(screen.getByRole("checkbox", { name: "Banana" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Manzana" })).not.toBeChecked();
  });
});
```

- [ ] **Step 2: Correr**

Run: `pnpm --filter @ts/ui test src/checkbox-group.test.tsx`
Expected: 3 PASS. Si el rol no es `checkbox` (improbable — el wrapper Checkbox ya rinde `role=checkbox`, ver `checkbox.test.tsx`), o `onChange` no emite `["a"]`, abrir `console.log(container.innerHTML)` y ajustar a lo observado (RAC siempre emite `string[]` para CheckboxGroup).

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/checkbox-group.test.tsx
git commit -m "test(ui): behavioral tests for CheckboxGroup (selection/controlled)"
```

---

### Task 2: `toggle-button-group` — tests de selección + disabled

**Files:**
- Modify (overwrite): `packages/ui/src/toggle-button-group.test.tsx`

**Interfaces:**
- Consumes: `ToggleButtonGroup` (`./toggle-button-group`, extiende RAC `ToggleButtonGroup`: `selectionMode`/`onSelectionChange(Set<Key>)`/`isDisabled`/`aria-label`), `ToggleButton` (`./toggle-button`, pasa `id` por spread).
- Produces: `toggle-button-group` cubierto con comportamiento (reemplaza el smoke).

- [ ] **Step 1: Reescribir el test**

`packages/ui/src/toggle-button-group.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToggleButtonGroup } from "./toggle-button-group";
import { ToggleButton } from "./toggle-button";
import { describe, test, expect, vi } from "vitest";

describe("ToggleButtonGroup", () => {
  test("renders its toggle buttons", () => {
    render(
      <ToggleButtonGroup aria-label="alineación" selectionMode="single">
        <ToggleButton id="left">Izquierda</ToggleButton>
        <ToggleButton id="right">Derecha</ToggleButton>
      </ToggleButtonGroup>,
    );
    expect(screen.getByRole("button", { name: "Izquierda" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Derecha" })).toBeInTheDocument();
  });

  test("onSelectionChange reports the clicked key", async () => {
    const fn = vi.fn();
    render(
      <ToggleButtonGroup aria-label="alineación" selectionMode="single" onSelectionChange={fn}>
        <ToggleButton id="left">Izquierda</ToggleButton>
        <ToggleButton id="right">Derecha</ToggleButton>
      </ToggleButtonGroup>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Izquierda" }));
    expect(fn).toHaveBeenCalled();
    const selection = fn.mock.calls[0][0];
    expect([...selection]).toEqual(["left"]);
  });

  test("isDisabled blocks selection", async () => {
    const fn = vi.fn();
    render(
      <ToggleButtonGroup aria-label="alineación" selectionMode="single" isDisabled onSelectionChange={fn}>
        <ToggleButton id="left">Izquierda</ToggleButton>
        <ToggleButton id="right">Derecha</ToggleButton>
      </ToggleButtonGroup>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Izquierda" }));
    expect(fn).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Correr**

Run: `pnpm --filter @ts/ui test src/toggle-button-group.test.tsx`
Expected: 3 PASS. Riesgos a ajustar contra la realidad observada (TDD):
- Rol del `ToggleButton`: si RAC lo expone como `radio` (por `selectionMode="single"`) en vez de `button`, cambiar `getByRole("button", ...)` por `getByRole("radio", ...)`. Confirmar con `console.log(container.innerHTML)`.
- `onSelectionChange` emite un `Set`; `[...selection]` lo materializa. Si emitiera la key como string suelto (no debería en RAC), ajustar.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/toggle-button-group.test.tsx
git commit -m "test(ui): behavioral tests for ToggleButtonGroup (selection/disabled)"
```

---

### Task 3: `chip` — aceptación de props

**Files:**
- Modify: `packages/ui/src/chip.test.tsx`

**Interfaces:**
- Consumes: `Chip` (`./chip`, props `color`/`size`/`variant` + children; sin `onClose`/`onPress`).
- Produces: `chip` con test de aceptación de props además del de children.

- [ ] **Step 1: Ampliar el test**

`packages/ui/src/chip.test.tsx` (reemplazar el contenido completo, conservando el test de children):
```tsx
import { render, screen } from "@testing-library/react";
import { Chip } from "./chip";
import { describe, test, expect } from "vitest";

describe("Chip", () => {
  test("renders children", () => {
    render(<Chip>Activo</Chip>);
    expect(screen.getByText("Activo")).toBeInTheDocument();
  });

  // Acceptance-only: Chip has no interactive props (no onClose/onPress); this
  // asserts the variant/color/size props are accepted and children still render.
  // It deliberately does NOT assert visual appearance (forbidden: brittle, would
  // couple to HeroUI's internal classes).
  test("accepts variant/color/size props and still renders children", () => {
    render(
      <Chip color="success" variant="solid" size="lg">
        Aprobado
      </Chip>,
    );
    expect(screen.getByText("Aprobado")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Correr**

Run: `pnpm --filter @ts/ui test src/chip.test.tsx`
Expected: 2 PASS. Si `color="success"` / `variant="solid"` / `size="lg"` no son valores válidos del tipo (typecheck o runtime), abrir el `.d.ts` de chip (`node_modules/.pnpm/@heroui+react@*/.../components/chip/index.d.ts` → `ChipRootProps` / `chipVariants`) y usar valores válidos del union.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/chip.test.tsx
git commit -m "test(ui): prop-acceptance test for Chip variants"
```

---

### Task 4: Verificar suite estable + gap intacto

**Files:**
- Modify: ninguno.

**Interfaces:**
- Consumes: Tasks 1-3.
- Produces: evidencia de no-regresión.

- [ ] **Step 1: Gap sigue en 0**

Run:
```bash
cd packages/ui && comps=$(ls src/*.tsx src/*.ts | grep -vE '\.test\.|test-setup' | xargs -n1 basename | sed -E 's/\.(tsx|ts)$//' | sort -u); refd=$(grep -rhoE 'from "\./[a-z0-9-]+"' src/*.test.tsx src/*.test.ts | sed -E 's/from "\.\/([a-z0-9-]+)"/\1/' | sort -u); n=0; for c in $comps; do echo "$refd" | grep -qx "$c" || { echo "GAP: $c"; n=$((n+1)); }; done; echo "TOTAL gap real: $n"
```
Expected: `TOTAL gap real: 0`.

- [ ] **Step 2: Suite completa estable (3 corridas, 0 unhandled errors)**

Run:
```bash
cd packages/ui && for i in 1 2 3; do out=$(pnpm test 2>&1); echo "run $i: $(echo "$out" | grep 'Test Files' | tr -d '\r') | unhandled=$(echo "$out" | grep -ciE 'Unhandled Error')"; done
```
Expected: las 3 corridas `Test Files ... passed`, `unhandled=0`.

- [ ] **Step 3: Sin `getByTestId`**

Run: `grep -rn "getByTestId" packages/ui/src || echo "no testid"`
Expected: `no testid`.

- [ ] **Step 4: Sin commit (verificación). Registrar resultado en el reporte.**

---

## Self-Review

- **Cobertura del spec:** R1 (checkbox-group) → Task 1 (3 tests). R2 (toggle-button-group) → Task 2 (3 tests). R3 (chip props) → Task 3. R4 (no regresión) → Task 4. Criterios 1-3 → Tasks 1-3; criterios 4-6 → Task 4.
- **Exclusiones honradas:** el plan no toca switch-group/avatar/spinner/skeleton — coherente con el rationale del spec (sin comportamiento real). No se inventan tests para ellos.
- **Placeholders:** ninguno — todo el código de test está inline y completo.
- **Consistencia de nombres:** `CheckboxGroup`/`Checkbox`, `ToggleButtonGroup`/`ToggleButton`, `Chip` — todos verificados contra los wrappers y los `.d.ts` reales de HeroUI. Firmas: `onChange(string[])` (CheckboxGroup), `onSelectionChange(Set)` (ToggleButtonGroup) — confirmadas en los `.d.ts`.
- **Riesgo conocido y mitigado:** los roles ARIA (`checkbox` vs el de los toggle buttons `button`/`radio`) y la firma exacta del evento se confirman al correr; cada task documenta el ajuste TDD si la realidad observada difiere. Esto es esperado en tests de caracterización sobre impl existente, no un defecto del plan.
