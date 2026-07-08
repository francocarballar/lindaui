---
"@lindaui/tokens": minor
"@lindaui/ui": minor
"@lindaui/blocks": minor
---

Hardening de empaquetado y pipeline (sin cambios de API de componentes):

- `@lindaui/tokens`: el CSS publicado ya no incluye utilities de las stories de
  Storybook (solo `ui` + `blocks`); el build verifica el output (markers +
  tamaño) para que un `@source` roto falle en vez de emitir CSS sin utilities.
  Nuevos exports: `./theme.css` (source del theme, para pipelines Tailwind
  propios) y `./package.json`. `sideEffects: ["*.css"]`.
- `@lindaui/ui` y `@lindaui/blocks`: export estándar `./package.json`;
  metadata npm (`keywords`/`homepage`/`bugs`); los peers `@lindaui/*` ahora
  declaran piso `>=0.2.0` (antes `*`) para que npm avise combinaciones
  incompatibles.
