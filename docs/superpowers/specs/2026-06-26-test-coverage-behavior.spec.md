# Spec: Cobertura behavioral (trade-offs + edge cases) — @ts/ui

**Fecha:** 2026-06-26
**Workstream:** D (sigue a C). Profundiza tests de humo en tests de comportamiento
donde hay comportamiento real que verificar.
**Decisión del owner:** armar nivel-1 (mayor ROI).

## Contexto

El workstream C cerró el gap de cobertura: todo módulo de `@ts/ui` aparece en
≥1 test. Pero esos tests son de **humo/caracterización** — afirman "renderiza
DOM" o "el export resuelve", no comportamiento. No cubren props/variants,
estados (selección, disabled), interacción (onChange), ni roles ARIA.

Este spec sube el nivel **solo donde hay comportamiento real y fiablemente
testeable en jsdom**, sin caer en busywork ni en aserciones frágiles de clases CSS.

## Análisis de candidatos (verificado contra los `.d.ts` reales de HeroUI v3)

| Módulo | API real | ¿Behavior testeable? | Decisión |
|---|---|---|---|
| `checkbox-group` | extiende RAC `CheckboxGroup`: `value`/`onChange(string[])`, hijos `Checkbox value=` | Sí: selección + controlado + roles | **IN** |
| `toggle-button-group` | extiende RAC `ToggleButtonGroup`: `selectionMode`/`onSelectionChange(Set)`, hijos `ToggleButton id=`, `isDisabled` | Sí: selección + disabled | **IN** |
| `chip` | `color`/`size`/`variant` + children (sin `onClose`/`onPress`) | Parcial: solo acepta props + render de children | **IN (ligero)** |
| `switch-group` | solo `children`/`orientation` (layout puro, **sin** value/onChange) | No: no maneja estado de selección | **OUT** (rationale abajo) |
| `avatar` | compound; el wrapper expone solo Root, no Image/Fallback | No: el fallback de src-error vive en `Avatar.Image`, inalcanzable por el wrapper | **OUT** |
| `spinner`, `skeleton` | presentacionales sin estado | No | **OUT** |

### Exclusiones — rationale (no son olvidos)

- **switch-group**: en HeroUI v3 es un contenedor de layout (`SwitchGroupRoot`,
  props `children`/`orientation`). NO maneja selección — cada `Switch` lleva su
  propio estado. No hay onChange/value que ejercitar. El test de humo existente
  (render DOM) es la cobertura correcta. Subirlo sería inventar comportamiento
  que el componente no tiene.
- **avatar**: el wrapper `@ts/ui/avatar` es `return <HeroAvatar {...props}/>`,
  que envuelve `AvatarRoot`. La lógica interesante (fallback cuando `src` falla)
  vive en `Avatar.Image` (`onError` → muestra `Avatar.Fallback`), sub-componentes
  que el wrapper no re-exporta. Sin acceso a Image/Fallback no hay edge case
  fiable que testear. (Nota lateral: que el wrapper no exponga Image/Fallback es
  una limitación de API; evaluarla es otro workstream, no este.)
- **Aserciones de clase/estilo de variant**: prohibidas — frágiles y violan la
  regla de queries semánticas. Verificar que un `variant` "se ve" distinto no es
  testeable sin acoplarse a clases internas de HeroUI.

## Requisitos

### R1 — `checkbox-group`: tests de comportamiento

Reemplazar el smoke `checkbox-group.test.tsx` por tests que compongan hijos
`Checkbox` (de `@ts/ui/checkbox`, que pasa `value` por spread) y verifiquen:

1. **Roles de hijos + label de grupo**: render con `aria-label` + 2 checkboxes
   con `value` → ambos `getByRole("checkbox", { name })` presentes.
2. **onChange reporta selección**: `onChange` spy; click en un checkbox →
   llamado con el array de values seleccionados (`["a"]`). RAC `CheckboxGroup`
   emite `string[]`.
3. **Controlado**: `value={["b"]}` → el checkbox "b" está `toBeChecked()`, el
   otro no.

### R2 — `toggle-button-group`: tests de comportamiento

Reemplazar el smoke `toggle-button-group.test.tsx` por tests que compongan
hijos `ToggleButton` (de `@ts/ui/toggle-button`, pasa `id` por spread):

1. **Render de hijos**: `selectionMode="single"` + 2 toggle buttons → ambos
   localizables por rol + nombre.
2. **onSelectionChange reporta selección**: spy; click en un botón → llamado;
   el argumento (un `Set` de keys de RAC) contiene el `id` clickeado.
3. **`isDisabled` bloquea selección**: grupo con `isDisabled` + `onSelectionChange`
   spy; click → spy NO llamado.

### R3 — `chip`: tests de aceptación de props

Ampliar `chip.test.tsx` (manteniendo el de children existente) con:

1. **Acepta variant/color/size sin romper** y sigue renderizando children:
   render con `color`/`variant`/`size` concretos → `getByText` del children.
   (Es un test de aceptación de props, no de apariencia — declarado como tal.)

### R4 — No regresión

La suite completa de `@ts/ui` queda verde y estable (sin unhandled errors),
y no se introduce `getByTestId`. Los roles ARIA asumidos se confirman al correr
(TDD): si RAC difiere del rol esperado, se ajusta la query a la realidad
observada, no se fuerza.

## Fuera de scope

- switch-group, avatar, spinner, skeleton (ver rationale).
- Tests visuales / de clases CSS.
- Tests de los compound re-export (composición RAC pesada — `toBeDefined` sigue
  siendo la cobertura correcta, igual que date/color).
- Refactor del wrapper avatar para exponer Image/Fallback.

## Criterios de aceptación

1. `checkbox-group.test.tsx` tiene ≥3 tests cubriendo R1 (roles, onChange, controlado), todos verdes.
2. `toggle-button-group.test.tsx` tiene ≥3 tests cubriendo R2 (render, onSelectionChange, disabled), todos verdes.
3. `chip.test.tsx` cubre R3 (props + children) además del test de children previo.
4. `pnpm --filter @ts/ui test` verde y estable en 3 corridas, 0 unhandled errors.
5. Ningún test usa `getByTestId`. Las interacciones usan `user-event` + queries semánticas.
6. El gap de cobertura sigue en 0 (no se elimina ningún módulo de los tests).
