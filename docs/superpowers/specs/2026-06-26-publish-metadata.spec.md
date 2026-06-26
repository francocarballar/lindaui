# Spec: Publish Metadata + Scope Availability

**Fecha:** 2026-06-26
**Workstream:** A (de 3) — independiente de B (license/readmes) y C (test coverage).
**Decisiones del owner:** licencia MIT · rename de scope = tarea condicional incluida acá.

## Problema

Los 3 `package.json` publicables (`@ts/ui`, `@ts/blocks`, `@ts/tokens`) no tienen
metadata de publicación: `license`, `description`, `repository`, `publishConfig`,
`sideEffects` están todos `undefined`. Efectos:

- npm muestra description/license vacíos → mala señal de calidad.
- `npm publish` directo de un paquete scoped sin `publishConfig.access: "public"`
  falla con `402 Payment Required` / `403` (default `restricted`).
  Nota: `changeset publish` YA está cubierto porque `.changeset/config.json`
  tiene `"access": "public"`. `publishConfig` es belt-and-suspenders para
  quien corra `npm publish`/`pnpm publish` directo sobre un paquete.
- `sideEffects` unset → el bundler del consumidor no puede tree-shakear con
  confianza los wrappers no usados.
- Riesgo de scope: `@ts` en npm probablemente esté tomado → publish fallaría
  con `403 Forbidden`. Hay que verificar disponibilidad y, si está tomado,
  renombrar el scope en todo el workspace antes de publicar.

## Requisitos

### R1 — Campos de metadata en los 3 paquetes publicables

Agregar a `packages/ui/package.json`, `packages/blocks/package.json`,
`packages/tokens/package.json`:

| Campo | Valor |
|---|---|
| `license` | `"MIT"` |
| `description` | ver R2 (uno por paquete) |
| `repository` | `{ "type": "git", "url": "git+https://github.com/francocarballar/ts-design-system.git", "directory": "packages/<pkg>" }` |
| `publishConfig` | `{ "access": "public" }` |
| `author` | `"Franco Carballar <francocarballar@gmail.com>"` |

`@ts/ui` y `@ts/blocks` además: `"sideEffects": false`.
`@ts/tokens` NO lleva `sideEffects` (es solo CSS, sin JS); su único artefacto
`dist/index.css` se importa explícito vía `@ts/tokens/css`.

La URL del `repository` es el valor intencional (usuario `francocarballar`,
repo `ts-design-system`). Debe coincidir con el remote real cuando se cree;
ajustar entonces si el slug difiere. No es placeholder: es un valor concreto
y editable, no `TBD`.

### R2 — Descripciones (copy verbatim)

- `@ts/ui`: `"React 19 design-system components wrapping HeroUI v3 (react-aria-components) behind stable per-component entry points."`
- `@ts/blocks`: `"Composed UI sections (auth, lists, master-detail, charts) built on @ts/ui — importable npm package, not a copy-paste registry."`
- `@ts/tokens`: `"Brand design tokens (OKLCH light/dark) + HeroUI v3 + Tailwind v4 compiled into a single CSS bundle."`

### R3 — `sideEffects: false` no debe romper imports

`@ts/ui` y `@ts/blocks` exportan solo funciones componentes y re-exports puros
(verificado: ningún módulo tiene efecto de import top-level; `"use client"` es
una directiva, no un side effect runtime). `sideEffects: false` es seguro.
Verificación obligatoria: tras el cambio, `pnpm build` + suite de tests pasan,
y un import smoke de cada entry resuelve.

### R4 — Verificación de disponibilidad de scope (condicional)

Antes de publicar, verificar si el scope `@ts` está disponible en npm:

```
npm view @ts/ui version    # 404 = libre ; cualquier version = tomado
```

- Si **libre**: no se hace nada, el scope `@ts` queda.
- Si **tomado**: renombrar el scope en todo el workspace a un scope que el
  owner controle (default propuesto: `@francocarballar` — su usuario npm;
  el owner confirma el scope final al ejecutar). Sustituir `@ts/` → `@<nuevo>/`
  en: los 3 `name`, todos los `peerDependencies`/`dependencies` internos,
  imports `@ts/ui/*` y `@ts/tokens/css` en `packages/blocks/src`,
  `apps/storybook`, y referencias en `CLAUDE.md`. Re-derivar nada (los exports
  son rutas relativas, no cambian). `pnpm install` + `pnpm build` + `pnpm test`
  deben pasar tras el rename.

Esta tarea es **condicional**: solo se ejecuta si R4 detecta scope tomado.
El owner decide el scope destino en ese momento (no se hardcodea acá).

## Fuera de scope

- Crear el git remote, instalar `gh`, configurar `NPM_TOKEN`. Siguen diferidos
  por decisión (ver CLAUDE.md "Autorizado / Prohibido"). Este spec deja la
  metadata lista; la publicación efectiva es otra decisión.
- LICENSE file y READMEs → workstream B.

## Criterios de aceptación

1. `node -e "p=require('./packages/ui/package.json'); console.log(p.license, !!p.description, !!p.repository, p.publishConfig?.access, p.sideEffects)"` imprime `MIT true true public false`. Ídem `@ts/blocks`.
2. Para `@ts/tokens`: `license=MIT`, `description` presente, `publishConfig.access=public`, `sideEffects` ausente.
3. `pnpm build` y `pnpm test` pasan sin regresión.
4. `pnpm --filter @ts/ui publish --dry-run --no-git-checks` (y blocks, tokens)
   reporta `access: public` y no falla por metadata faltante.
5. `npm view @ts/ui version` corrido y su resultado registrado; si tomado, el
   rename de scope quedó aplicado y el build/test pasan.
