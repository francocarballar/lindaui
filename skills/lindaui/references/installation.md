# Installation and portable setup

Use the application package manager, not the contributor repository's manager.
Supported CLI managers: npm, pnpm, Yarn with node_modules, Bun. Existing lockfiles
and packageManager determine the manager. Corepack is a fallback for pnpm/Yarn
when available. Yarn PnP is reported as unsupported by automatic resolution;
use its native resolver manually rather than changing the linker.

The library currently requires React/React DOM >=19 and ESM-capable tooling.
Check actual peerDependencies and peerDependenciesMeta from the selected versions.
Do not assume react-hook-form, charts or icons are optional just because a recipe
does not directly import them. Installed/declaration conflicts stop setup.

```text
node "<skill>/scripts/lindaui.mjs" setup --project "apps/web" --packages ui,blocks --json
node "<skill>/scripts/lindaui.mjs" setup --project "apps/web" --packages ui,blocks --apply --json
```

Setup retains installed library versions by default. Missing packages use public
registry metadata. `--refresh` explicitly selects published latest versions;
`--ui-version`, `--blocks-version`, `--tokens-version` pin exact published versions.
Do not use local package.json versions as evidence that those versions exist on npm.
The planner selects compatible required peers and does not migrate React.

Default CSS: import `@lindaui/tokens/css` once at the application entry. This
includes HeroUI styling, default teal tokens and library-used utilities. This
theme also affects root typography and global styling; review existing design.
`--style violet` selects `/lead-converter/compiled.css` only if the selected
tokens package exports it. Source Tailwind modes are manual recipes in theming.
Do not combine theme bases, upstream standalone styles and compiled/source variants.

Entrypoint discovery covers Vite src/main and Next App Router layouts or Pages
Router _app. Multiple candidates require `--entry`. Generic frameworks/custom
entrypoints can use `--entry` with an existing JS/TS/CSS file. A stylesheet found
in a source scan still requires checking that the application actually loads it.

## Local artifacts before npm publication

Build and pack in the library repository using its existing portable-pack tooling.
Supply one tarball per selected library package:

```text
node "<skill>/scripts/lindaui.mjs" setup --project "apps/web" --tarballs "vendor" --packages ui,blocks --offline --json
```

The planner reads manifests without extracting archives, checks library peer
compatibility and stores relative file: references. `--offline` requires other
peers to be installed or declared compatibly. Without --offline, missing peers
can be resolved from public metadata. Archive hashes bind saved plans to the
reviewed bytes. Refresh tarballs deliberately; do not overwrite an already
published version with different code or use absolute cross-repository links.

## Plan and execution contract

All mutation commands default to a plan. `--dry-run` makes that explicit.
`--save-plan` writes a new JSON file without applying its changes; `apply --plan`
reuses its exact versions/content and verifies preconditions. Output files must
remain inside the application, including through symlink parents.

Installation runs before application file edits and may execute the project's
existing package-manager lifecycle hooks. Applying an integration task must be
authorized. The process is not a distributed transaction: failures report effects
already completed. Review the receipt and replan; do not clean/reset the workspace.
Package-manager execution is shell-free, including Windows Node .cmd shims.

## Strict TypeScript stylesheet imports

New tokens packages publish a declaration for every CSS entry, including the
extensionless `@lindaui/tokens/css`. For older bare exports, setup supplies a narrow
`lindaui-css.d.ts` declaration in TypeScript projects. Ensure the app tsconfig
includes that file; setup does not rewrite compiler settings. This matters with
`noUncheckedSideEffectImports`, which otherwise reports TS2882.
