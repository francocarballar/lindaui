#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { target, DXError } from './lib/project.mjs';
import { doctor, api, check } from './lib/analyze.mjs';
import { setup } from './lib/setup.mjs';
import { activate, theme, scaffold } from './lib/generate.mjs';
import { applyPlan, runManager } from './lib/operations.mjs';

const common = ['project', 'json', 'help'];
const optionsByCommand = {
  doctor: ['strict'], api: ['list'], check: ['strict', 'typecheck'],
  setup: ['packages', 'entry', 'style', 'refresh', 'offline', 'registry', 'tarballs', 'ui-version', 'blocks-version', 'tokens-version', 'apply', 'dry-run', 'save-plan'],
  activate: ['out', 'apply', 'dry-run', 'save-plan'],
  theme: ['primary', 'primary-dark', 'out', 'entry', 'apply', 'dry-run', 'save-plan'],
  scaffold: ['name', 'out', 'language', 'apply', 'dry-run', 'save-plan'],
  apply: ['plan']
};
const booleans = new Set(['json', 'help', 'strict', 'typecheck', 'refresh', 'offline', 'apply', 'dry-run', 'list']);
export function argumentsFor(args) {
  const command = args[0] && !args[0].startsWith('-') ? args.shift() : 'help';
  const options = {}; const positional = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '-h') { options.help = true; continue; }
    if (!arg.startsWith('--')) { positional.push(arg); continue; }
    const [key, ...valueParts] = arg.slice(2).split('=');
    if (![...common, ...(optionsByCommand[command] ?? [])].includes(key)) throw new DXError('UNKNOWN_OPTION', `--${key} is not supported by ${command}.`);
    if (Object.hasOwn(options, key)) throw new DXError('DUPLICATE_OPTION', `Duplicate --${key}.`);
    if (booleans.has(key)) {
      if (valueParts.length) throw new DXError('INVALID_OPTION', `--${key} takes no value.`);
      options[key] = true;
    } else {
      const value = valueParts.length ? valueParts.join('=') : args[++i];
      if (!value || value.startsWith('--')) throw new DXError('MISSING_OPTION_VALUE', `--${key} needs a value.`);
      options[key] = value;
    }
  }
  if (command !== 'help' && !optionsByCommand[command]) throw new DXError('UNKNOWN_COMMAND', `Unknown command: ${command}`);
  for (const key of Object.keys(options)) if (![...common, ...(optionsByCommand[command] ?? [])].includes(key)) throw new DXError('UNKNOWN_OPTION', `--${key} is not supported by ${command}.`);
  if (positional.length > (['api', 'scaffold'].includes(command) ? 1 : 0)) throw new DXError('UNEXPECTED_ARGUMENT', 'Unexpected positional argument.');
  if (options.apply && options['dry-run']) throw new DXError('CONFLICTING_OPTIONS', 'Choose --apply or --dry-run.');
  return { command, options, positional };
}
export const help = `LindaUI agent CLI — Node >=20, no installation required for these tools.

Usage: node <skill>/scripts/lindaui.mjs <command> --project <application> [--json]

doctor                         Inspect versions, peers, exports and styles
api <entry>                    Read the installed entry and declarations
api --list                     List the consumer's actual available imports
check [--strict] [--typecheck]  Check imports/known usage; optionally run existing typecheck
setup [--packages ui,blocks]    Plan installation + one base stylesheet
  --entry <file>               Select an existing application/CSS entry
  --style default|violet       Choose one precompiled base (default: default)
  --refresh                   Select current published versions rather than installed ones
  --ui-version <exact>         Pin a published UI version (also blocks/tokens-version)
  --tarballs <directory>       Use portable local tarballs, resolved relative to --project
  --offline                   No metadata requests; installed/tarball versions only
  --registry <https-url>       Public metadata registry (default: npm)
theme --primary "#2563eb"      Plan canonical light/dark brand overrides
  --primary-dark "#60a5fa"     Optional dark brand color
  --entry <file> --out <css>   Base-importing entry and generated theme path
scaffold <recipe>              Plan a functional component with app callbacks
  Recipes: contact-form, searchable-list, confirmation-dialog, data-table
  --name <PascalCase> --out <file> --language ts|js
activate [--out AGENTS.md]      Plan the default-UI instruction for this project
apply --plan <json-file>        Apply a saved plan with unchanged file preconditions

setup/theme/scaffold/activate: no writes by default; --dry-run is explicit.
Use --save-plan <new-file> to save the exact plan; --apply to execute immediately.
Paths --entry/--out are relative to the application. Existing work is preserved.
Exit codes: 0 checked/planned/applied, 1 findings (or warnings with --strict),
2 command/precondition/execution error. JSON uses schemaVersion 1.
`;

export async function execute(argv) {
  const { command, options, positional } = argumentsFor([...argv]);
  if (command === 'help' || options.help) return { schemaVersion: 1, command: 'help', ok: true, status: 'help', data: { help }, findings: [] };
  const context = target(options.project); let data; let status = 'checked';
  if (command === 'doctor') data = doctor(context);
  if (command === 'api') data = api(context, positional[0], options.list);
  if (command === 'check') {
    data = check(context);
    if (options.typecheck) {
      if (!context.manifest.scripts?.typecheck) throw new DXError('TYPECHECK_UNAVAILABLE', 'No existing typecheck script. Do not invent a compiler setup to report a pass.');
      if (!context.manager) throw new DXError('AMBIGUOUS_MANAGER', 'Select the project package manager before running its typecheck.');
      try { const receipt = runManager(context, ['run', 'typecheck']); data.verification.typecheck = { status: 'passed', receipt }; }
      catch (error) { data.verification.typecheck = { status: 'failed', details: error.details }; data.findings.push({ code: 'TYPECHECK_FAILED', severity: 'error', message: error.message }); }
    }
  }
  let plan;
  if (command === 'setup') plan = await setup(context, options);
  if (command === 'theme') plan = theme(context, options);
  if (command === 'scaffold') plan = scaffold(context, options, positional[0]);
  if (command === 'activate') plan = activate(context, options);
  if (command === 'apply') {
    if (!options.plan) throw new DXError('PLAN_REQUIRED', 'Pass --plan <saved-json-file>.');
    plan = JSON.parse(readFileSync(resolve(options.plan), 'utf8'));
    data = applyPlan(context, plan); status = 'applied';
  } else if (plan) {
    if (options['save-plan']) writeFileSync(resolve(options['save-plan']), JSON.stringify(plan, null, 2) + '\n', { flag: 'wx' });
    if (options.apply) { data = applyPlan(context, plan); status = 'applied'; }
    else { data = { plan }; status = 'planned'; }
  }
  const { findings = [], ...rest } = data;
  const ok = !findings.some(f => f.severity === 'error' || (options.strict && f.severity === 'warning'));
  return { schemaVersion: 1, command, project: context.root, ok, status: ok ? status : 'issues', data: rest, findings };
}
function render(result) {
  if (result.command === 'help') return result.data.help;
  if (result.status === 'planned') return `${result.command}: plan ${result.data.plan.id}\n${JSON.stringify(result.data.plan, null, 2)}\nUse --apply or save this plan and run apply --plan.\n`;
  return `${result.command}: ${result.status}\n${JSON.stringify(result.data, null, 2)}\n${result.findings.map(f => `${f.severity}: ${f.code}: ${f.message ?? f.action ?? JSON.stringify(f)}`).join('\n')}\n`;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const result = await execute(process.argv.slice(2));
    process.stdout.write(process.argv.includes('--json') ? JSON.stringify(result, null, 2) + '\n' : render(result));
    process.exitCode = result.ok ? 0 : 1;
  } catch (error) {
    const result = { schemaVersion: 1, ok: false, status: 'error', error: { code: error.code ?? 'EXECUTION_ERROR', message: error.message, details: error.details ?? {} } };
    process.stdout.write(process.argv.includes('--json') ? JSON.stringify(result, null, 2) + '\n' : `${result.error.code}: ${result.error.message}\n${JSON.stringify(result.error.details)}\n`);
    process.exitCode = 2;
  }
}
