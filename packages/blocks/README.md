# @lindaui/blocks

Composed UI sections built on **@lindaui/ui** — auth flows, lists, master-detail
panels, and charts. This is an importable npm package, **not** a copy-paste /
shadcn-style registry: you `import` the blocks, you don't vendor their source.

## Install

```bash
pnpm add @lindaui/blocks @lindaui/ui @lindaui/tokens
```

Peer dependencies: `react >=19`, `react-dom >=19`, `react-hook-form >=7`,
`lucide-react` (icons), and `recharts` (chart blocks).
Blocks **0.5.0** additionally requires `@lindaui/ui >=0.5.0` and
`@lindaui/tokens >=0.4.0`. Those are the first versions containing the migration
compound/compat APIs and required styles; older published peers are incompatible.

## Usage

```tsx
import "@lindaui/tokens/css";
import { LoginForm } from "@lindaui/blocks/login-form";
import { BarChart } from "@lindaui/blocks/bar-chart";
```

Controlled blocks (`list-pane`, `detail-panel`, `document-panel`,
`split-workspace`, `confirm-dialog`) receive state + handlers. There is zero
data-fetching / backend in the library — you wire that up.

## Catalog

**UI sections:** `login-form`, `auth-layout`, `auth-provider`,
`field-array-form`, `list-item`, `list-pane`, `detail-panel`, `confirm-dialog`,
`image-viewer`, `document-panel`, `document-reader`, `recording-overlay`,
`split-workspace`.

**Charts** (on `@lindaui/ui/chart`): `area-chart`, `bar-chart`, `line-chart`,
`pie-chart`, `radar-chart`, `radial-chart`, `stat-card`, `chart-card`,
`stats-grid`.

**Application chrome:** `app-shell` (also exports `AppShellFooter`),
`entity-switcher`, `command-palette`. Router links, images, entities, translated
labels and business actions are injected by the consumer.

**Connections and configuration:** `connection-panel` (also exports
`ConnectedPanel`), `channel-settings`, `settings-layout`, `save-bar`, `stepper`.
`Stepper` presents the supplied percentage with `steps` or `compact` anatomy;
it does not calculate steps or own completion policy. Settings panels remain
mounted while selection changes; save buttons submit the supplied form id.

**Entity workflows:** `filter-bar`, `source-selector`, `kanban-board`,
`kanban-column`, `entity-card`. Data filtering, IDs, grouping, persistence,
activation handlers and domain-to-presentation mappings remain in the app.

## Explicit compatibility namespaces

These opt-in namespaces preserve former UI-kit presentation without changing
the existing flat Lindaui chat/chart APIs:

- `@lindaui/blocks/compat` — UI compatibility controls and utilities, `KPICard`,
  `StatusFilters`, `DateDivider`. `KPICard` takes `title`, `value`, `icon`, `color`,
  `trend` and `isLoading`; it is distinct from the existing `/stat-card`.
- `@lindaui/blocks/chat` — chat shell/list/thread/composer/avatar/header/empty
  state and generic types. Messages use `side: "left" | "right" | "center"`,
  `timestamp`, `text`, optional `authorTag` and `media`. The existing
  `/chat-types` uses a different contract and must not be mixed with these types.
- `@lindaui/blocks/analytics` — analytics cards, status chart, entity table,
  health presentation, loading indicators and the controlled date-range picker.
  Its `TimeRangePicker` uses `preset` (`24h|7d|30d|custom`),
  `customRange: RangeValue<DateValue> | null` and callbacks, unlike the existing
  flat `/time-range-picker` with ISO date strings.

The package declares Dayjs, `@internationalized/date`, `@react-types/shared`,
Framer Motion and drag/drop primitives as runtime dependencies. Public date
declarations remain usable outside this monorepo; no consumer needs repo links.

For LeadConverter's existing appearance, import the independent
`@lindaui/tokens/lead-converter.css` Tailwind source entry instead of the teal
bundle. Do not import both. See the token package README for source scanning.

Interactive compatibility stories live in `src/compat-chat/chat.stories.tsx`
and `src/analytics/analytics.stories.tsx`, discovered by the repository's
Storybook. Stories and tests are excluded from public exports and build output.

## Published types

The package is ESM-only. All public and internal declarations, including the
`/chat`, `/analytics` and `/compat` namespaces, resolve with Node16/NodeNext
and bundler resolution. Declaration normalization resolves real files and
directory indexes without changing runtime JS or component client boundaries.
Exports put `types` first; `import` and `default` share the same ESM target.
This also supports `next/dynamic`'s weak-module lookup without a CommonJS build.

## License

MIT
