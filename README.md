# lindaui design system

Monorepo (pnpm + Turborepo) of a React 19 design system: brand tokens
(`@lindaui/tokens`), component library (`@lindaui/ui`) and composed sections
(`@lindaui/blocks`), all on top of **HeroUI v3** (react-aria-components).

## Architecture

```
apps/storybook  (preview)
       │ consumes ui + blocks
       ▼
@lindaui/blocks  ──composes──►  @lindaui/ui  ──wraps──►  @heroui/react (RAC)
       │ peer                  │ peer
       ▼                       ▼
@lindaui/tokens (dist/index.css)  ──►  @heroui/styles + tailwindcss v4
```

## Packages

| Package | What | Path |
|---|---|---|
| `@lindaui/tokens` | Brand CSS bundle (tokens + HeroUI + Tailwind) | `packages/tokens/` |
| `@lindaui/ui` | React 19 component wrappers over HeroUI v3 | `packages/ui/` |
| `@lindaui/blocks` | Composed sections built on `@lindaui/ui` | `packages/blocks/` |
| `storybook` | Preview catalog (private) | `apps/storybook/` |

## Quickstart (consumer)

```bash
pnpm add @lindaui/ui @lindaui/blocks @lindaui/tokens
```

```tsx
import "@lindaui/tokens/css";            // once, at the app root
import { Button } from "@lindaui/ui/button";
import { LoginForm } from "@lindaui/blocks/login-form";
```

Peers you provide: `react >=19`, `react-dom >=19`, `react-hook-form >=7`
(+ `recharts` and `lucide-react` for chart/icon blocks).

## Development

```bash
pnpm install
pnpm build        # turbo: tokens → ui → blocks
pnpm test         # vitest suites for ui + blocks
pnpm dev          # turbo watch
```

The contributor contract (wrapper styles, build pipeline, anti-regressions)
lives in [`CLAUDE.md`](./CLAUDE.md).

## License

MIT — see [LICENSE](./LICENSE).
