# Propuesta e implementación: entrega autónoma recurrente

Invocación propuesta: `$deliver implementá <mejoras y criterios> y completá el
release autónomo`. También se aplica al pedido equivalente con `/goal`.
Cada invocación completa autoriza el recorrido; no hace falta copiar un prompt
largo ni aprobar nuevamente commits, push, merge o publicación de esa tarea.

## División de responsabilidades

El agente implementa mejoras, diagnostica fallos y agrupa commits usando `commit`.
`delivery:check` ejecuta gates locales. `release:flow` controla push, checks del
SHA y Version PR. Changesets genera versiones y changelogs. `release:publish`
es el único publisher de CI y del alias `release`: publica todos los releases
GitHub antes de enviar paquetes a npm. `delivery:verify` consulta bytes públicos
y crea consumidores nuevos; no acepta como prueba el log de publicación.

## Invariantes implementadas

- Árbol limpio (incluidos archivos nuevos no ignorados) y HEAD estable antes de npm; sin reset ni force push.
- Changelog no vacío para cada versión pública; notas GitHub provienen de él.
- Releases existentes deben ser estables, públicos y tener contenido del paquete
  equivalente al checkout. Una diferencia aborta sin sobrescribir tags.
- Fallos de GitHub bloquean npm; errores de autenticación no se tratan como ausencia.
- Reejecutar reconcilia releases existentes; pnpm saltea versiones ya publicadas.
- Un publish fallido conserva `coverage/publication/ordering.json`; un resultado
  ambiguo se reconcilia con registry antes de cualquier intervención manual.
- Receipt de registry verifica latest, SHA512/SHA1 y manifest del tarball descargado.
- CI conserva los recibos y tarballs 90 días; el agente puede adjuntar recibos a
  los releases como evidencia permanente. El gate no depende de `published` de
  Changesets, que puede ser false si los tags ya estaban creados.
- Cobertura por archivo 100% en las cuatro métricas, E2E y consumidores reales.

## Recuperación y alcance

Después de una interrupción volver a invocar `$deliver` con el objetivo y el
estado observado. Los commits y el Version PR son el registro durable; los runs
se identifican por SHA, y los recibos registran publicación parcial. No borrar
estado ni repetir efectos externos para “empezar limpio”. Reparar el fallo real,
verificar y continuar con la misma autorización. El único retry automático de
runs es el `action_required` acotado ya implementado en release-flow.

Esta automatización requiere el agente activo y credenciales GitHub/npm válidas;
no es un scheduler. Los checks de consumidor prueban instalación/generación/build;
E2E prueba las aplicaciones construidas desde el checkout. La comparación completa
payload local/público y navegadores sobre fixtures públicos siguen siendo pruebas
adicionales cuando el cambio afecta empaquetado o interacción; no se confunden con
los hashes de integridad del registry.

## Prueba de aceptación de esta entrega

Ejecutar esta misma skill sobre sus cambios: gates locales, commits atómicos,
Changesets, runs verdes, releases GitHub previos a npm y verificación de las nuevas
versiones en consumidores. Adjuntar recibos y reportar URLs efectivas.

El catálogo E2E espera `networkidle` en la primera navegación: Storybook carga
los módulos de cada story después del load inicial. Serializar no resolvió los
roots ocultos durante carga; la corrección espera recursos, sin reloads, retries
ni cambios en el timeout de las aserciones. CI y gates locales usan la misma
condición de carga.
