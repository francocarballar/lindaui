# API selection

Read installed package declarations and llms.txt. `api <entry>` prints the runtime
path, declaration path/content, package version and documentation path. Follow
reexports and inherited upstream types when the local declaration is insufficient.
The bundled assets/api-index.json is release inventory, not a substitute for the
consumer's installed API. New GitHub entries may not be published yet.

| Task | Start with |
|---|---|
| Form | ui/input, textarea, select, checkbox, button; blocks/login-form or field-array-form when appropriate |
| Search/list | ui/search-field + search utilities; blocks/list-pane |
| Tabular view | ui/table or blocks/table-pane |
| Confirmation | ui/dialog + button, or blocks/confirm-dialog |
| Dashboard | blocks/stat-card, stats-grid, chart-card and chart blocks |
| Application layout | blocks/auth-layout or split-workspace; app-shell if exported |
| Chat | installed flat chat entries or opt-in chat namespace; inspect its distinct types |
| Migration | opt-in compat or compound entries, only after verifying availability |

## Contracts that prevent common failures

- There is no root ui/blocks barrel. Import an exported subpath.
- Flat Button variants: primary, secondary, ghost, danger, link. No color prop.
- Flat fields reject className; style canonical/field tokens or a surrounding layout.
- Flat Select uses items with string value/label and onChange(value). No SelectItem.
- Placeholder is not an accessible name; Select needs label or an aria label.
- Flat Dialog uses open/onClose/title. It does not expose aria-label.
- Menu trigger is button content: the wrapper creates the button. Do not nest buttons.
- Flat controls use onChange; compatibility handlers differ. Check the actual entry.
- Table handles collection composition internally; its rendered roles are grid/gridcell.
  The current flat implementation derives internal row IDs from array positions;
  do not promise stable row identity across reordering. Preserve app-level IDs in
  data and use an appropriate richer API when identity/selection is required.
- `/chart` provides LindaUI chart wrappers. `/charts` exposes upstream Recharts
  when available. `/toast` and opt-in `/notifications` are different contracts.

These rules describe the reviewed API family. Types from a newer installed version
take precedence if a contract has changed. The checker catches specific mistakes;
it does not replace semantic typechecking.
