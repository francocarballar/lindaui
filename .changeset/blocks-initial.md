---
"@ts/blocks": patch
---

Nuevo paquete @ts/blocks: secciones compuestas sobre @ts/ui, distribuidas como
paquete npm (importar, no source-copy). Seed inicial: login-form (form RHF) y
data-list (filtro + búsqueda + estados). Acompaña un generador en scripts/
(gen:component / gen:block / gen:exports) que mantiene el exports map derivado.
