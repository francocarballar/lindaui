---
"@lindaui/ui": minor
"@lindaui/tokens": minor
---

Fields are now token-driven with no silent-miss escape hatch.

- `input`, `textarea`, `number-input` and `search-field` no longer accept
  `className`. Spread onto the RAC wrapper it never reached the `<input>`, so a
  class silently landed on the wrong element. It is now a compile error; style
  fields by overriding the `--field-*` custom properties instead.
- `search-field` ships the magnifier icon and clear button by default (the clear
  button appears once there is a value).
- `@lindaui/tokens` now declares the `--field-*` contract
  (`--field-background`/`-foreground`/`-placeholder`/`-border`/`-border-hover`/
  `-border-focus`/`-focus`/`-radius`) as refs to the canonical tokens, so field
  surfaces track the brand and dark mode for free, and a consumer re-skins every
  field from a single override point.
