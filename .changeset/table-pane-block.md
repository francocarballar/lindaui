---
"@lindaui/blocks": minor
"@lindaui/tokens": patch
---

New block `@lindaui/blocks/table-pane` — the tabular sibling of `list-pane`.

Wraps `@lindaui/ui/table` in the same controlled chrome as `list-pane` (filter
tabs + search + loading/error/empty states) and adds:

- `columns` / `rows` (delegated to `@lindaui/ui/table`; each cell is a `ReactNode`
  so domain chips/avatars stay in the consumer),
- a `toolbarExtra` slot for extra filter controls to the right of the search
  (e.g. a `<Select>`),
- an optional footer: `footer` as an escape hatch, or the `footerCount`
  convenience (`{shown, total, label?}` → "Mostrando X de Y").

Fully controlled and does no data-fetching or filtering — pass already-filtered
`rows`. `@lindaui/tokens` CSS regenerated for the block's utilities.
