# Troubleshooting and output contract

Run --help for commands. Use --json for agents; stdout contains only one JSON
document, including errors. Diagnostics do not require network access. Scripts
use bundled parser/semver code with its licenses; consumers do not install them.

| Code | Action |
|---|---|
| PROJECT_REQUIRED / WORKSPACE_ROOT | Select the actual app with --project |
| AMBIGUOUS_MANAGER | Review lockfiles and declare the intended packageManager |
| REACT_UNSUPPORTED / PEER_CONFLICT | Resolve compatibility; don't silently migrate React |
| ENTRY_UNAVAILABLE / INVALID_IMPORT | Consult installed exports and api; main may be ahead of npm |
| MISSING_ARTIFACT | Reinstall/rebuild the selected version; an export alone isn't a file |
| STYLES_NOT_FOUND | Check the app root/global stylesheet and actual runtime loading |
| STYLE_CONFLICT | Select one base and review theme intent |
| ENTRY_REQUIRED | Supply --entry rather than guessing |
| FIELD_CLASSNAME / LEGACY_HANDLER | Inspect flat versus compat contract and tokens |
| STALE_PLAN | Preserve current edits and generate a new plan |
| EXISTING_COMPONENT / EXISTING_THEME | Adapt the existing file or choose another output |
| PNP_UNSUPPORTED | Use Yarn PnP's resolver manually |
| MANAGER_UNAVAILABLE | Install the selected manager or enable the existing Corepack setup |
| PACKAGE_MANAGER_FAILED | Read exit code/stdout/stderr; inspect effects before retrying |

Result shape: schemaVersion, command, project, ok, status, data, findings.
Error shape: schemaVersion, ok=false, status=error, error with code/message/details.
The check data includes verification.typecheck/browser/accessibility and coverage.
Warnings are separate from confirmed errors. --strict makes warnings exit 1.
No browser/typecheck pass is implied by a successful inspection command.

Paths --entry/--out are application-relative; --project and saved-plan paths can
be absolute. Windows shims resolve to Node entry scripts without cmd.exe. Paths
with spaces and Unicode are supported. Sources outside the selected app through
symlinks are skipped/reported; outputs through escaping symlinks are rejected.
Source scanning has a 5,000-file/1MiB-per-file limit; review reported skips.

Installing this skill does not force activation in every host. Use activate when
the user requests project-wide default UI adoption, and verify the host loads the
application's AGENTS.md and installed skill. Global adoption belongs in the host's
global instructions; a public skill cannot modify every agent's configuration.
