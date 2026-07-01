---
"@lindaui/ui": minor
---

`select` and `combobox` accept and forward `aria-label` / `aria-labelledby`.

Both wrappers expose a flat interface and previously listed no ARIA naming props,
so a control with no visible `label` had no accessible name (in react-aria a
`placeholder` does not count as a name) — an unnamed control + a dev warning. They
now accept `aria-label` / `aria-labelledby` and pass them through to the underlying
RAC `Select` / `ComboBox`, so compact toolbars and inline filters can name the
control without a visible label.
