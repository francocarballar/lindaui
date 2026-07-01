---
"@lindaui/blocks": minor
"@lindaui/tokens": patch
---

Legible back control for media overlays + inline document meta.

- New block `@lindaui/blocks/workspace-back-button`: a token-driven back pill
  (`bg-secondary`/`border-border`) that stays readable over dark or bright media.
- `split-workspace` gains `backHref`/`backLabel` and renders that pill by default
  behind a readability scrim with safe-area insets, so consumers no longer have to
  hand-build a legible control over the media. `back?` remains an escape hatch and
  wins over the pair.
- `document-panel` gains `metaPlacement?: "block" | "inline"` (default `block`);
  `inline` flows subtitle and meta on one wrapping row instead of stacking meta on
  its own line.
- `@lindaui/tokens` CSS is regenerated to include the new scrim/gradient utilities
  the block uses (`bg-linear-to-b`, `from-black/25`, safe-area insets).
