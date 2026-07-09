---
name: release-flow
description: Automatiza el flujo de release de este monorepo lindaui (push a main, esperar CI+Release, detectar el "Version Packages" PR de changesets, resolver el flake de action_required, mergearlo, esperar el CI+Release post-merge, verificar versiones publicadas en npm). Usar SIEMPRE que Franco diga que terminó una feature/fix acá y quiera shippearlo, publicarlo, hacer el release, seguir "el flujo de siempre" o "el flujo de release", mergear el Version PR, o cuando pida revisar/seguir el estado de GitHub Actions después de comittear trabajo en este repo — incluso si no dice "skill" ni "release" explícitamente. NO usar si el pedido es solo "creá los commits" (eso no empuja nada) o si hay cambios sin commitear (correr `pnpm test`/`build`/`typecheck` y commitear primero).
---

# Release flow (lindaui)

Versión automatizada de lo que se hacía a mano: push → watch CI/Release → si
changesets abrió un PR de versión, esperar su CI (auto-reintentando el flake
de `action_required`) → mergearlo → watch CI/Release post-merge → verificar
npm. Todo vive en `scripts/release-flow.mjs` — este SKILL.md es la capa de
criterio: cuándo invocarlo, cómo leer su salida, qué hacer si aborta.

## Por qué no pausa a mitad de camino

El merge del Version PR dispara un publish real a npm. `CLAUDE.md` prohíbe
publicar sin pedido explícito — pero invocar este skill (por el trigger de
arriba) YA ES ese pedido explícito. No hace falta que el script se detenga
a mitad de camino a preguntar de nuevo; eso sería pedir permiso dos veces
para la misma autorización. Si en algún momento el pedido de Franco es más
ambiguo ("¿qué falta?", "revisá el repo") — no es un trigger de este skill,
tratalo como pregunta normal.

## Cómo correrlo

```bash
node scripts/release-flow.mjs             # flujo completo
node scripts/release-flow.mjs --dry-run   # solo lee estado, no muta nada
```

Antes de correr el flujo real, si hay dudas sobre el estado del repo (¿hay
un Version PR abierto ya? ¿estamos al día con origin?), correlo primero con
`--dry-run` — es de solo lectura, seguro de correr sin preguntar.

## Qué hace, paso a paso

1. Verifica que estás en `main`, sin cambios trackeados sin commitear, y al
   día con `origin/main` (ni atrás ni con nada raro).
2. Si hay commits locales sin pushear: `git push`, después espera (con
   `gh run watch`) las corridas de CI y Release que dispara ese push.
3. Busca un PR abierto de `changeset-release/main` (el que arma
   `changesets/action`):
   - Si no hay → Release ya publicó directo (o no había changesets
     pendientes). Va al paso 6.
   - Si hay → sigue.
4. Espera el CI de ese PR. Si la corrida cae en `action_required` (flake
   conocido de GitHub con PRs abiertos por el bot de changesets — no es una
   falla real), la reintenta con `gh run rerun` hasta 3 veces. Cualquier
   otra conclusión no exitosa (`failure`, etc.) aborta el script entero sin
   tocar nada más — un CI rojo de verdad nunca se mergea a ciegas.
5. Mergea el PR (`--squash --delete-branch`), y espera el CI + Release que
   dispara ese merge en `main`.
6. Lee `packages/*/package.json` (los no-`private`) y corre
   `npm view <name> version` para reportar las versiones finales publicadas.

## Si el script aborta

Sale con `✗ <motivo>` y código de salida 1. No reintentes a ciegas —
mostrale el error a Franco y decidan juntos:
- **"Working tree sucio" / "atrás de origin"**: hay que resolver el estado
  del repo antes (commitear, pull) — no es un bug del script.
- **CI/Release en `failure`**: hay una regresión real. No mergear nada; es
  el mismo criterio que "no publicar con la suite roja" que ya está en
  `CLAUDE.md`.
- **`action_required` tras 3 reintentos**: algo más profundo está pasando
  con los permisos del repo (ver anti-regresión #13 en `CLAUDE.md`) — no es
  el flake usual, hay que mirarlo a mano.

## Extender el script

Si el flujo de release cambia (otro workflow, otro nombre de branch para el
version PR, etc.), editá `scripts/release-flow.mjs` directamente — es un
solo archivo Node sin dependencias nuevas (`node:child_process`, `node:fs`),
mismo estilo que `scripts/gen.mjs` y `scripts/derive-exports.mjs`.
