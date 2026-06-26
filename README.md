# @ts design system

Monorepo (pnpm + Turborepo) of a React 19 design system: brand tokens
(`@ts/tokens`), component library (`@ts/ui`) and composed sections
(`@ts/blocks`), all on top of **HeroUI v3** (react-aria-components).

## Architecture

```
apps/storybook  (preview)
       │ consumes ui + blocks
       ▼
@ts/blocks  ──composes──►  @ts/ui  ──wraps──►  @heroui/react (RAC)
       │ peer                  │ peer
       ▼                       ▼
@ts/tokens (dist/index.css)  ──►  @heroui/styles + tailwindcss v4
```

## Packages

| Package | What | Path |
|---|---|---|
| `@ts/tokens` | Brand CSS bundle (tokens + HeroUI + Tailwind) | `packages/tokens/` |
| `@ts/ui` | React 19 component wrappers over HeroUI v3 | `packages/ui/` |
| `@ts/blocks` | Composed sections built on `@ts/ui` | `packages/blocks/` |
| `storybook` | Preview catalog (private) | `apps/storybook/` |

## Quickstart (consumer)

```bash
pnpm add @ts/ui @ts/blocks @ts/tokens
```

```tsx
import "@ts/tokens/css";            // once, at the app root
import { Button } from "@ts/ui/button";
import { LoginForm } from "@ts/blocks/login-form";
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
