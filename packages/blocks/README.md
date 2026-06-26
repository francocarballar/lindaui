# @ts/blocks

Composed UI sections built on **@ts/ui** — auth flows, lists, master-detail
panels, and charts. This is an importable npm package, **not** a copy-paste /
shadcn-style registry: you `import` the blocks, you don't vendor their source.

## Install

```bash
pnpm add @ts/blocks @ts/ui @ts/tokens
```

Peer dependencies: `react >=19`, `react-dom >=19`, `react-hook-form >=7`,
`lucide-react` (icons), and `recharts` (chart blocks).

## Usage

```tsx
import "@ts/tokens/css";
import { LoginForm } from "@ts/blocks/login-form";
import { BarChart } from "@ts/blocks/bar-chart";
```

Controlled blocks (`list-pane`, `detail-panel`, `document-panel`,
`split-workspace`, `confirm-dialog`) receive state + handlers. There is zero
data-fetching / backend in the library — you wire that up.

## Catalog

**UI sections:** `login-form`, `auth-layout`, `auth-provider`,
`field-array-form`, `list-item`, `list-pane`, `detail-panel`, `confirm-dialog`,
`image-viewer`, `document-panel`, `document-reader`, `recording-overlay`,
`split-workspace`.

**Charts** (on `@ts/ui/chart`): `area-chart`, `bar-chart`, `line-chart`,
`pie-chart`, `radar-chart`, `radial-chart`, `stat-card`, `chart-card`,
`stats-grid`.

## License

MIT
