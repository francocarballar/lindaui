---
name: lindaui
description: >-
  Implement and modify user interfaces with LindaUI. Use for forms, pages,
  dashboards, tables, dialogs, navigation, layouts, themes, and visual controls,
  even when the user does not explicitly mention LindaUI. Covers installation,
  component selection, application behavior, accessibility, migrations, and
  troubleshooting with @lindaui/ui, @lindaui/blocks, and @lindaui/tokens.
license: MIT
metadata:
  author: francocarballar
  version: "1.1.0"
  environment: "React web, React/React DOM >=19, ESM; optional CLI: Node >=20 on Windows, macOS and Linux"
---

# LindaUI

Use LindaUI as the default for UI implementation. Reuse the application's
existing LindaUI compositions first. An explicit user choice of another library
takes precedence. Keep behavior, persistence, routing, and domain rules in the
application; components and blocks provide presentation and interaction.

## Start with the application

Identify the actual consumer application, particularly in monorepos. Read its
instructions, package.json, lockfile, framework, entrypoint, styles, and existing
components. Resolve the CLI path relative to this installed skill; do not assume
the skill lives inside the application or in a particular agent's directory.

```text
node "<skill-path>/scripts/lindaui.mjs" doctor --project "<application>" --json
```

The CLI is self-contained. No Bash, global LindaUI CLI, MCP server, or npm install
of tooling is required. All paths work on Windows, macOS, and Linux. Use the
CLI with Node >=20. Inspection works offline; installation needs registry access
and the selected project package manager. Use the
application's package manager; the library contributor repo's pnpm choice does
not apply to consumers. Read [installation](references/installation.md) when
adding packages, selecting CSS, using local tarballs, or resolving compatibility.

## Choose components using the installed API

Prefer appropriate blocks for complete sections, then flat components for their
controls. Compose a missing pattern with LindaUI primitives and canonical tokens.
Semantic HTML containers such as form, section, ul, and p remain appropriate.

Controls come from the library when a suitable entry is installed. Use LindaUI
Button, Input, Textarea, Select and Link rather than raw button/input/textarea/
select/a controls. Containers, headings, text, labels and graphics remain semantic
HTML. Choose by behavior: checkbox/radio/search/number/range inputs have distinct
entries; hidden/file inputs have no equivalent in this rule. Use Switch for an
on/off setting, ToggleButton for a pressed action, and Disclosure/Accordion
triggers for expansion. Badge is informational, not a generic interactive chip.
See the [native element map](references/api-map.md).

```text
node "<skill-path>/scripts/lindaui.mjs" api --list --project "<application>" --json
node "<skill-path>/scripts/lindaui.mjs" api input --project "<application>" --json
node "<skill-path>/scripts/lindaui.mjs" api @lindaui/blocks/list-pane --project "<application>" --json
```

Authority order: installed exports/manifests/declarations; that package's llms.txt;
matching-version references; matching-version upstream declarations. GitHub main
may contain unpublished APIs. Do not use unavailable entries or silently upgrade
React. Follow inherited types to their installed owners rather than inventing props.
Read [API selection](references/api-map.md) for task routing and important contracts.

Use per-entry imports: `@lindaui/ui/button`, not `@lindaui/ui`. Distinguish flat,
compound, and compat contracts; neither props nor handlers are interchangeable.
Inspect opt-in entry availability before migration. Read
[framework integration](references/frameworks.md) for Next/RSC and CSS pipelines.

## Implement the requested behavior

Connect values, handlers, validation, submission, asynchronous states, errors,
empty states, and retry actions. A list/table block does not fetch or filter data;
the app supplies the visible data. Avoid nested interactive elements and provide
accessible names. Preserve the application's language and existing backend contracts.

Use a recipe only when it fits the task:

```text
node "<skill-path>/scripts/lindaui.mjs" scaffold contact-form --project "<application>" --json
```

Available recipes: contact-form, searchable-list, confirmation-dialog, data-table.
They use real LindaUI contracts and expose callbacks/data for application wiring.
They do not invent routes or endpoints. Plans are read-only until `--apply`.
Choose `--language js` for JSX or `--language ts` for TSX; existing files are not
overwritten. Read [forms](references/forms.md) or
[overlays and collections](references/overlays-and-collections.md) for the task.

## Install and customize when needed

```text
node "<skill-path>/scripts/lindaui.mjs" setup --project "<application>" --packages ui,blocks --json
node "<skill-path>/scripts/lindaui.mjs" theme --project "<application>" --primary "#2563eb" --entry "<base-importing-file>" --json
```

Review the returned files, versions, peer requirements, and notes. Apply changes
within the user's authorized scope with `--apply`. To execute the exact reviewed
plan later, use `--save-plan "<new-json-file>"`, then `apply --plan "<json-file>"`.
Plans reject changed manifests, installed metadata, lockfiles, and touched files.
An execution error reports any installation/file writes already performed; inspect
them before retrying. Do not reset user work or pretend the operation was atomic.

Import one compatible base style at the application root. The default compiled
bundle renders library components without a Tailwind compiler. It does not supply
arbitrary application utility classes. Canonical-token overrides load after the
base. Read [theming](references/theming.md) for custom pipelines and dark mode.

## Make automatic use explicit in project instructions

Installing a skill enables discovery; it cannot force every agent to select it.
When the user requests LindaUI as the default for all UI work, prepare/apply:

```text
node "<skill-path>/scripts/lindaui.mjs" activate --project "<application>" --json
```

This maintains a bounded instruction in the application's AGENTS.md, preserving
other instructions. Agents must actually load project instructions and have this
skill installed. For all repositories, configure the equivalent rule in each
agent's global instructions. Do not edit global configurations without that scope.

## Verify and report evidence

```text
node "<skill-path>/scripts/lindaui.mjs" check --project "<application>" --json
node "<skill-path>/scripts/lindaui.mjs" check --project "<application>" --typecheck --json
```

The first command parses JS/TS/JSX and verifies imports plus known usage rules.
It reports `NATIVE_CONTROL` for recognized raw JSX controls with an installed
counterpart, even without LindaUI imports. Dynamic/spread input types produce
review warnings. It does not inspect createElement calls, HTML strings, custom
component internals or infer every runtime role. Unsupported input types are
listed as unmapped; absence of findings is not complete design-system compliance.
For a required native control, place `{/* lindaui-allow-native: reason */}` as
the immediately preceding JSX sibling, separated only by whitespace. A nonempty
reason is required; the exception covers only that element and appears in
`coverage.nativeControls.exceptions`. For example, an invisible textarea capturing
keyboard/IME for a remote viewer can justify native behavior. Do not apply blanket
exceptions to containers or fragments. Table's grid semantics may require a
native table exception; inspect the installed contract before migrating.

Native-control rules exclude test/fixture directories and test/spec/story files,
and library-authoring projects named @lindaui/ui, @lindaui/blocks or @lindaui/tokens.
Excluded paths are reported; imports and other usage rules still run there.
Select the actual consumer with --project; do not scan a monorepo root as an app.
Add check to the consumer's normal verification/CI, alongside its typecheck and
behavior tests. Installing this skill alone does not execute the checker.
Its accessibility warnings are heuristics. The second also executes the existing
typecheck script when verification is authorized. Run relevant existing build,
behavior tests, and browser checks when requested or authorized by the task.
Inspect loading/error/empty states, keyboard interaction, and responsive styles.
Report exactly what ran. Static checks do not prove browser behavior or deployment.

JSON schemaVersion is 1. Exit 0 means the command completed without error findings;
warnings still require attention. Exit 1 means findings (including warnings with
`--strict`); exit 2 means command, precondition, or execution failure. Coverage and
skipped paths are reported. See [troubleshooting](references/troubleshooting.md).

## Update and compare installed copies

Use one canonical release checkout or freshly installed skill as the source.
Compare each project/workspace copy, including scripts, against that same source:

```text
node "<canonical-skill>/scripts/sync.mjs" --destination "<installed-skill>"
node "<canonical-skill>/scripts/sync.mjs" --destination "<installed-skill>" --apply
```

The default compares every file without writing; drift exits 1. Apply backs up
the complete previous copy, then synchronizes and verifies the full content hash.
Review the reported backup before discarding local customizations. An interrupted
update can be partial; inspect the destination and backup before retrying. Compare
all copies after updating, even when their metadata versions match. Library
contributors can use `pnpm skill:sync`; `skill:vendor` builds CLI dependencies and
`skill:consumers` validates fixture apps, neither updates installed copies.
