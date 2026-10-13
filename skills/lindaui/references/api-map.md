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

## Native elements and controls

Use only entries exported with existing artifacts by the installed package.
These are migration suggestions, not drop-in HTML replacements or autofixes.

| Native element / behavior | Entry / decision |
|---|---|
| button / action | @lindaui/ui/button |
| input text/email/password/tel/url | @lindaui/ui/input |
| input checkbox / radio | @lindaui/ui/checkbox / @lindaui/ui/radio |
| input search / number / range | @lindaui/ui/search-field / @lindaui/ui/number-input / @lindaui/ui/slider |
| input button/submit/reset | @lindaui/ui/button; preserve submission behavior |
| input hidden/file/date/time/color and other unmapped types | No automatic counterpart in this rule; inspect available contracts and preserve behavior |
| textarea | @lindaui/ui/textarea |
| select + option | @lindaui/ui/select, items/value/onChange; one finding for the parent |
| a with href | @lindaui/ui/link; preserve routing, download and target behavior |
| details + summary | @lindaui/ui/disclosure; one finding for the parent |
| dialog | @lindaui/ui/dialog; read open/onClose/title |
| table | @lindaui/ui/table or blocks/table-pane; current Table uses grid semantics, justify native table if needed |
| on/off setting / pressed action | ui/switch / ui/toggle-button, selected by behavior |
| expand/collapse | ui/disclosure or ui/accordion trigger, using installed composition |
| informational chip / interactive chip | ui/badge / an appropriate installed action or selection control |

The checker recognizes JSX identifiers only. Orphan option/summary elements are
reported individually. Semantic containers/text/graphics (form, section, article,
ul/ol/li, p, headings, dl, label, fieldset, legend, time, img/svg/canvas) are never
native-control findings. `a` without an explicit href is not flagged. Dynamic or
spread input types get warnings rather than a guessed type. The rule does not
verify custom abstractions or accessibility exhaustively.
