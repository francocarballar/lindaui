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

## LindaUI skill for coding agents

Install the consumer skill from this repository:

```text
npx skills add francocarballar/lindaui --skill lindaui
```

The skill handles UI requests even when the user does not mention LindaUI.
It includes a self-contained Node >=20 CLI for Windows, macOS and Linux:

```text
node "<installed-skill>/scripts/lindaui.mjs" doctor --project "<application>" --json
node "<installed-skill>/scripts/lindaui.mjs" setup --project "<application>" --packages ui,blocks --json
node "<installed-skill>/scripts/lindaui.mjs" scaffold contact-form --project "<application>" --json
node "<installed-skill>/scripts/lindaui.mjs" check --project "<application>" --typecheck --json
```

Mutation commands return a plan until `--apply`. `--save-plan` and `apply --plan`
execute an exact reviewed plan with file/lock/metadata preconditions. `api`,
`theme`, `activate` and `--help` cover component contracts, brand customization,
default UI adoption and the full command reference. The tools respect the
consumer's package manager and installed versions; they do not migrate React.

For consistent automatic invocation, run `activate --apply` when adopting
LindaUI as the default UI library. It preserves other AGENTS.md instructions.
Agents must load those instructions and the installed skill; installation alone
cannot force every host to select a skill. See [the skill](skills/lindaui/SKILL.md).

Contributor gates: `pnpm skill:test`, `pnpm skill:validate`, `pnpm skill:index`.
The portable CLI test workflow runs on Linux, macOS and Windows, Node 20 and 24.
Release versioning regenerates the skill inventory alongside package versions.

## Development commands

Skill contributor checks: `pnpm skill:validate`, `pnpm skill:test`, and
`pnpm skill:vendor --check`. Build and pack the library, then run
`pnpm skill:consumers --tarballs "<artifact-directory>"` to verify real Vite
TS/JS and Next App/Pages Router consumers. `--published` verifies public npm
versions instead. Fixtures and JSON execution receipts stay in a temporary
directory for inspection. CI additionally runs the portable CLI on Windows,
macOS and Linux with Node 20 and 24, including actual npm artifact installation
in paths containing spaces and special characters.

```bash
pnpm install
pnpm build        # turbo: tokens → ui → blocks
pnpm test         # vitest suites for ui + blocks
pnpm test:declarations  # NodeNext declaration normalization regressions
pnpm dev          # turbo watch
```

The contributor contract (wrapper styles, build pipeline, anti-regressions)
lives in [`CLAUDE.md`](./CLAUDE.md).

UI/blocks still build JS with Bunchee and declarations with TypeScript. The
declaration stage then normalizes relative imports/exports/import types to
explicit NodeNext-compatible paths, including directory indexes, and updates
declaration maps. It never rewrites runtime JS, source components or ordinary comments.
The actual packed packages must pass both `publint` and
`attw --pack --profile esm-only`; bundler-only typechecking is not enough.
Public entries keep `types` first and expose `import`/`default` to the same ESM
file so Next/webpack dynamic-import lookups can resolve it. This is not a
CommonJS build or a runtime wrapper.

### Portable local integration

The migration starts at UI **0.5.0**, blocks **0.5.0**, tokens **0.4.0**.
UI and blocks require tokens >=0.4.0; blocks requires UI >=0.5.0. Earlier
published peers lack required entries/styles and are not compatible.

After feature owners finish, regenerate exports, build all three libraries, then
pack them into the consumer's tracked vendor directory (no publish or absolute links):

```bash
pnpm gen:exports
pnpm build
pnpm pack:consumer --destination ../gym-ecosystem/apps/lead-converter/web/vendor
```

The pack command rejects missing or stale declarations/JS/CSS and non-portable
manifest references. Consumers use relative `file:vendor/*.tgz` dependencies;
refresh their filtered pnpm installation and lock after replacing tarballs.
The current archives are `lindaui-ui-0.5.0.tgz`, `lindaui-blocks-0.5.0.tgz`,
and `lindaui-tokens-0.4.0.tgz`. Always derive names from the built versions;
do not overwrite archives carrying already-published version numbers.
LeadConverter uses `@lindaui/tokens/lead-converter.css`, not the default teal
bundle. See the token package README for source and standalone CSS usage.

## License

MIT — see [LICENSE](./LICENSE).
