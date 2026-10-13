---
name: deliver
description: Completar mejoras de LindaUI de punta a punta cuando el usuario pide implementar, verificar, commitear y publicar autónomamente. Coordina commits atómicos, Changesets, GitHub antes de npm y evidencia pública. No publica ante pedidos de revisión o de commits solamente.
---

# Entrega autónoma de LindaUI

El pedido de entrega completa autoriza commits, push, merge del Version PR y
publicación de las versiones de esta tarea. Continuar hasta verificar la versión
pública; no pedir otra confirmación para esas etapas. La skill requiere un agente
activo: un comando Node no puede decidir qué mejoras implementar ni qué cambios
forman commits atómicos. No instala cron ni publica cambios por iniciativa propia.

Leer `CLAUDE.md` y [la propuesta](../../../docs/workflows/autonomous-delivery.md).

1. Inventariar HEAD, estado, diffs e instrucciones. Definir criterios verificables
   para las mejoras solicitadas e implementarlas. Preservar cambios concurrentes.
   Corregir fallos dentro del alcance y repetir solamente los gates afectados.
2. Agregar Changesets para los paquetes afectados; no editar versiones ni
   changelogs manualmente. Si la tarea mejora tooling distribuido con todo el
   ecosistema, justificar explícitamente los patch de UI, blocks y tokens.
3. Ejecutar `pnpm delivery:check`. Es el gate local completo y secuencial;
   `coverage/run.json` y `.e2e/` conservan evidencia. Empaquetar con
   `pnpm pack:consumer --destination coverage/delivery/local` y verificar
   consumidores con `pnpm skill:consumers --tarballs coverage/delivery/local`.
4. Usar obligatoriamente [commit](../commit/SKILL.md): inventariar, agrupar por
   responsabilidad, implementación + tests juntos, revisar cada staged diff,
   respetar hooks y reconciliar el árbol después de cada commit. No usar add -A.
5. Ejecutar `pnpm release:flow`. Espera checks del SHA exacto y mergea únicamente
   el head verificado. El publisher CI `release:publish` crea TODOS los releases
   GitHub con changelog antes de invocar npm; conserva `ordering.json` y verifica
   bytes, hashes, identidad y latest. Un fallo real exige diagnóstico y reparación,
   no reruns a ciegas. Después de un corte consultar PR/runs/registry y retomar;
   nunca reescribir tags ni versiones ya publicadas.
6. Tras el pull de versiones, ejecutar `pnpm delivery:verify`: verificación pública
   y cuatro consumidores nuevos Vite TS/JS + Next App/Pages. Descargar el artifact
   `npm-publication-evidence` del run Release exacto y verificar `ordering.json`:
   todos los `github.publishedAt` preceden a `npmStartedAt` y al `publishedAt`
   de npm en `verification.json`. Adjuntar los recibos
   a GitHub con `gh release upload <tag> <recibos> --clobber` solamente para assets
   de evidencia de esta entrega; no reemplazar tarballs ni tags.
7. Cerrar con versiones, commits, URLs de GitHub/npm, runs y paths de evidencia.
   Distinguir compilación de consumidores, E2E local y comportamiento del artefacto
   público. No afirmar checks que no se ejecutaron. Propagar copias de la skill
   únicamente a consumidores incluidos en el pedido, con `skill:sync` y respaldo.

Si faltan credenciales, permisos o disponibilidad externa, guardar evidencia y
reportar el bloqueo concreto. “Autónomo” significa completar lo autorizado y
resolver fallos reparables; no significa ocultar fallos ni garantizar servicios
externos. Ninguna etapa verde por sí sola equivale a publicación verificada.
