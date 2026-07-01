---
"@lindaui/blocks": minor
"@lindaui/tokens": patch
---

`recording-overlay` gains a `variant` prop.

- `variant?: "overlay" | "inline"` (default `"overlay"`, backwards-compatible).
- `overlay` keeps the fixed dark surface for use over media, now on the `viewer-*`
  tokens instead of a hardcoded color.
- `inline` drops the absolute positioning and forced dark background, fills its
  container, inherits the panel surface, and uses token-driven text so it stays
  legible on a light or dark panel. Content is identical across variants.
- `@lindaui/tokens` CSS regenerated for the variant's `viewer-*` / foreground
  utilities.
- Fixes the recording animation: the `ti-rec-pulse` / `ti-rec-blink` / `ti-wf` /
  `ti-fade` keyframes the overlay references by name were never shipped in
  `@lindaui/tokens`, so the overlay rendered static. They are now bundled in the
  tokens CSS (ported verbatim from the source design), so the pulse rings,
  blinking dot and waveform animate.
