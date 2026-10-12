import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, symlinkSync, rmSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { gzipSync } from 'node:zlib';
import { target, installed, exportTarget, resolveEntry, compatibleDeclaration, digest } from '../skills/lindaui/scripts/lib/project.mjs';
import { doctor, api, check } from '../skills/lindaui/scripts/lib/analyze.mjs';
import { setup } from '../skills/lindaui/scripts/lib/setup.mjs';
import { makePlan, change, applyPlan, safePath, addImport } from '../skills/lindaui/scripts/lib/operations.mjs';
import { theme, scaffold, activate, recipe } from '../skills/lindaui/scripts/lib/generate.mjs';
import { execute, argumentsFor } from '../skills/lindaui/scripts/lindaui.mjs';
import { managerInvocation, runManager, nodeShimEntry } from '../skills/lindaui/scripts/lib/process.mjs';

function file(root, path, value) { mkdirSync(join(root, path, '..'), { recursive: true }); writeFileSync(join(root, path), typeof value === 'string' ? value : JSON.stringify(value, null, 2)); }
function pkg(root, name, version, entries = {}, peers = {}, optional = {}) {
  const exports = Object.fromEntries(Object.keys(entries).map(e => ['./' + e, e.endsWith('.css') || e === 'css' ? `./dist/${e === 'css' ? 'index.css' : e}` : { types: `./dist/${e}.d.ts`, import: `./dist/${e}.js`, default: `./dist/${e}.js` }]));
  const manifest = { name, version, type: 'module', exports, peerDependencies: peers, peerDependenciesMeta: optional };
  const base = `node_modules/${name}`; file(root, `${base}/package.json`, manifest); file(root, `${base}/llms.txt`, `Documentation for ${name}@${version}`);
  for (const [e, declarations] of Object.entries(entries)) {
    if (e.endsWith('.css') || e === 'css') file(root, `${base}/dist/${e === 'css' ? 'index.css' : e}`, ':root { --primary: teal; }');
    else { file(root, `${base}/dist/${e}.js`, 'export const Component = null;'); file(root, `${base}/dist/${e}.d.ts`, declarations || 'export declare const Component: unknown;'); }
  }
  return manifest;
}
function fixture(t, { libraries = true, typescript = true, manager = 'npm' } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'Linda UI spaces & unicode-á-')); t.after(() => rmSync(root, { recursive: true, force: true }));
  file(root, 'package.json', { name: 'consumer', private: true, type: 'module', packageManager: `${manager}@${manager === 'npm' ? '11.0.0' : '11.7.0'}`, dependencies: { react: '^19.0.0', 'react-dom': '^19.0.0' }, devDependencies: { vite: '^7.0.0' }, scripts: { typecheck: 'node -e "console.log(\'fixture-typecheck-executed\')"' } });
  file(root, 'src/main.tsx', '"use client";\nimport "./app.css";\nexport const app = 1;\n'); file(root, 'src/app.css', 'body { margin: 0; }\n');
  if (typescript) file(root, 'tsconfig.json', {});
  pkg(root, 'react', '19.0.0'); pkg(root, 'react-dom', '19.0.0');
  if (libraries) {
    pkg(root, '@lindaui/ui', '0.5.0', Object.fromEntries(['button', 'input', 'select', 'textarea', 'dialog', 'search'].map(k => [k, k === 'input' ? 'export interface InputProps { label?: string; }' : ''])), { react: '>=19', 'react-dom': '>=19', '@lindaui/tokens': '>=0.4.0', 'react-hook-form': '>=7', 'lucide-react': '>=0.4' }, { 'lucide-react': { optional: true } });
    pkg(root, '@lindaui/blocks', '0.5.0', { 'list-pane': '', 'table-pane': '' }, { '@lindaui/ui': '>=0.5.0', '@lindaui/tokens': '>=0.4.0', react: '>=19' });
    pkg(root, '@lindaui/tokens', '0.4.0', { css: '', 'theme-template.css': '', 'lead-converter/compiled.css': '' });
    pkg(root, 'react-hook-form', '7.0.0');
  }
  return root;
}
test('application inspection respects installed manifests without a package.json export', t => {
  const root = fixture(t); const context = target(root);
  assert.equal(context.framework, 'vite'); assert.equal(context.manager, 'npm');
  assert.equal(installed('@lindaui/ui', root).manifest.version, '0.5.0');
  assert.equal(api(context, 'input').entries[0].import, '@lindaui/ui/input');
  assert.match(api(context, 'input').entries[0].declarations, /InputProps/);
});
test('exports respect conditional types, wildcard paths, missing files and no root barrel', t => {
  const root = fixture(t); const info = installed('@lindaui/ui', root);
  assert.equal(resolveEntry(info, '.'), null); assert.ok(resolveEntry(info, './input', 'types'));
  assert.equal(exportTarget({ exports: { './*': { import: './dist/*.js' } } }, './x'), './dist/x.js');
  assert.equal(exportTarget({ exports: { './x': null } }, './x'), null);
  assert.throws(() => api(target(root), 'nonexistent'), { code: 'ENTRY_UNAVAILABLE' });
});
test('doctor reports required peer failures and ignores missing optional peers', t => {
  const root = fixture(t); const result = doctor(target(root));
  assert.equal(result.findings.filter(f => f.code === 'MISSING_PEER').length, 0);
  rmSync(join(root, 'node_modules/react-hook-form'), { recursive: true });
  assert.ok(doctor(target(root)).findings.some(f => f.code === 'MISSING_PEER' && f.peer === 'react-hook-form'));
  pkg(root, 'react', '18.3.1'); assert.ok(doctor(target(root)).findings.some(f => f.code === 'REACT_UNSUPPORTED'));
});
test('check parses aliases, dynamic imports and reexports without matching comments or strings', t => {
  const root = fixture(t);
  file(root, 'src/Bad.tsx', `// import { Fake } from '@lindaui/ui/nonexistent';\nconst example = "import '@lindaui/ui/fake'";\nimport { Button as Action } from '@lindaui/ui/button';\nexport { Missing } from '@lindaui/ui/missing';\nconst lazy = import('@lindaui/ui/nope');\nexport const view = <Action color="primary" variant="outline"/>;`);
  const result = check(target(root));
  assert.equal(result.findings.filter(f => f.code === 'INVALID_IMPORT').length, 2);
  assert.equal(result.findings.filter(f => f.code === 'BUTTON_COLOR').length, 1);
  assert.equal(result.findings.filter(f => f.code === 'BUTTON_VARIANT').length, 1);
  assert.equal(result.verification.browser, 'not-run');
});
test('known flat rules do not leak into compound/compat namespaces', t => {
  const root = fixture(t); pkg(root, '@lindaui/ui', '0.5.0', { compat: '', compound: '', input: '', select: '', dialog: '' });
  file(root, 'src/View.tsx', `import { Input as Legacy } from '@lindaui/ui/compat';\nimport { Input } from '@lindaui/ui/input';\nimport { Select } from '@lindaui/ui/select';\nimport { Dialog } from '@lindaui/ui/dialog';\nexport const view = <><Legacy className="x" onValueChange={()=>{}}/><Input className="x"/><Select items={[]}/><Dialog open onClose={()=>{}}>Body</Dialog></>;`);
  const result = check(target(root));
  assert.equal(result.findings.filter(f => f.code === 'FIELD_CLASSNAME').length, 1);
  assert.equal(result.findings.filter(f => f.code === 'LEGACY_HANDLER').length, 0);
  assert.ok(result.findings.some(f => f.code === 'SELECT_NAME')); assert.ok(result.findings.some(f => f.code === 'DIALOG_TITLE'));
});
test('malformed JSX is reported rather than skipped as a success', t => {
  const root = fixture(t); file(root, 'src/Broken.tsx', 'export const x = <div');
  assert.ok(check(target(root)).findings.some(f => f.code === 'PARSE_ERROR'));
});
test('CSS conflicts and unavailable stylesheet imports are actionable', t => {
  const root = fixture(t); file(root, 'src/app.css', '@import "@lindaui/tokens/css";\n@import "@lindaui/tokens/lead-converter/compiled.css";\n@import "@lindaui/tokens/unknown.css";');
  const result = check(target(root)); assert.ok(result.findings.some(f => f.code === 'STYLE_CONFLICT')); assert.ok(result.findings.some(f => f.code === 'INVALID_STYLE_IMPORT'));
});
test('offline setup preserves directives and is idempotent', async t => {
  const root = fixture(t); const plan = await setup(target(root), { offline: true });
  assert.equal(plan.install, null); assert.equal(plan.files.length, 2); assert.match(plan.files[0].content, /^"use client";\nimport "@lindaui\/tokens\/css";/);
  assert.equal(plan.files[1].content, 'declare module "@lindaui/tokens/css";\n');
  applyPlan(target(root), plan); const again = await setup(target(root), { offline: true }); assert.equal(again.files.length, 0);
});
test('typed CSS exports need no ambient fallback and legacy violet imports get a narrow declaration', async t => {
  const root = fixture(t); const info = installed('@lindaui/tokens', root);
  const manifest = info.manifest;
  manifest.exports['./css'] = { types: './src/style.d.ts', default: './dist/index.css' };
  file(root, 'node_modules/@lindaui/tokens/package.json', manifest);
  file(root, 'node_modules/@lindaui/tokens/src/style.d.ts', 'export {};\n');
  const typed = await setup(target(root), { offline: true });
  assert.equal(typed.files.length, 1);
  const violet = await setup(target(root), { offline: true, style: 'violet' });
  assert.equal(violet.files[1].content, 'declare module "@lindaui/tokens/lead-converter/compiled.css";\n');
});
test('setup rejects React migration, style switching and malformed sources', async t => {
  const root = fixture(t); pkg(root, 'react', '18.3.0');
  await assert.rejects(setup(target(root), { offline: true }), { code: 'REACT_UNSUPPORTED' });
  pkg(root, 'react', '19.0.0'); file(root, 'src/app.css', '@import "@lindaui/tokens/css";');
  await assert.rejects(setup(target(root), { offline: true, style: 'violet' }), { code: 'STYLE_CONFLICT' });
  file(root, 'src/Bad.tsx', '<'); await assert.rejects(setup(target(root), { offline: true }), { code: 'SOURCE_ERRORS' });
});
test('declaration compatibility handles semver bounds conservatively', () => {
  assert.equal(compatibleDeclaration('^19.0.0', '>=19'), true);
  assert.equal(compatibleDeclaration('>=18', '>=19'), false);
  assert.equal(compatibleDeclaration('workspace:*', '>=19'), false);
});
test('saved plans detect user edits, manifest changes, and changed installed metadata', t => {
  const root = fixture(t); const path = 'src/app.css';
  let plan = makePlan(target(root), 'theme', [change(root, path, 'new')]); file(root, path, 'user edit');
  assert.throws(() => applyPlan(target(root), plan), { code: 'STALE_PLAN' }); assert.equal(readFileSync(join(root, path), 'utf8'), 'user edit');
  plan = makePlan(target(root), 'theme', [change(root, path, 'new')]); file(root, 'node_modules/@lindaui/ui/package.json', { name: '@lindaui/ui', version: '0.6.0' });
  assert.throws(() => applyPlan(target(root), plan), { code: 'STALE_PLAN' });
  plan = makePlan(target(root), 'theme', [change(root, path, 'new')]); file(root, 'package.json', { name: 'changed' });
  assert.throws(() => applyPlan(target(root), plan), { code: 'STALE_PLAN' });
});
test('saved plans detect changed lockfiles and invalid checksums', t => {
  const root = fixture(t); file(root, 'package-lock.json', '{}'); const plan = makePlan(target(root), 'activate', []);
  file(root, 'package-lock.json', '{"changed":true}'); assert.throws(() => applyPlan(target(root), plan), { code: 'STALE_PLAN' });
  assert.throws(() => applyPlan(target(root), { ...plan, id: 'bad' }), { code: 'INVALID_PLAN' });
});
test('output traversal and symlink escapes are rejected', t => {
  const root = fixture(t); assert.throws(() => safePath(root, '../outside.css'), { code: 'OUTSIDE_PROJECT' });
  const outside = mkdtempSync(join(tmpdir(), 'lindaui-outside-')); t.after(() => rmSync(outside, { recursive: true, force: true }));
  symlinkSync(outside, join(root, 'escape'), process.platform === 'win32' ? 'junction' : 'dir');
  assert.throws(() => safePath(root, 'escape/theme.css'), { code: 'OUTSIDE_PROJECT' });
});
test('activate preserves unrelated instructions and is idempotent', t => {
  const root = fixture(t); file(root, 'AGENTS.md', '# Existing\nKeep this.\n');
  applyPlan(target(root), activate(target(root), {})); const contents = readFileSync(join(root, 'AGENTS.md'), 'utf8');
  assert.ok(contents.startsWith('# Existing\nKeep this.')); assert.equal(activate(target(root), {}).files.length, 0);
  file(root, 'AGENTS.md', '<!-- lindaui:ui-policy:start -->'); assert.throws(() => activate(target(root), {}), { code: 'POLICY_MARKERS' });
});
test('theme uses canonical variables, preserves base order and is idempotent', async t => {
  const root = fixture(t); applyPlan(target(root), await setup(target(root), { offline: true }));
  const plan = theme(target(root), { primary: '#2563eb' }); applyPlan(target(root), plan);
  const source = readFileSync(join(root, 'src/main.tsx'), 'utf8');
  assert.ok(source.indexOf('@lindaui/tokens/css') < source.indexOf('./lindaui-theme.css'));
  assert.match(readFileSync(join(root, 'src/lindaui-theme.css'), 'utf8'), /--primary: #2563eb/);
  assert.equal(theme(target(root), { primary: '#2563eb' }).files.length, 0);
  assert.throws(() => theme(target(root), { primary: 'red; hacked' }), { code: 'INVALID_COLOR' });
});
test('theme and scaffold refuse to overwrite user content', t => {
  const root = fixture(t); file(root, 'src/lindaui-theme.css', '/* mine */');
  assert.throws(() => theme(target(root), { primary: '#2563eb' }), { code: 'EXISTING_THEME' });
  file(root, 'src/components/ContactForm.tsx', '/* mine */'); assert.throws(() => scaffold(target(root), {}, 'contact-form'), { code: 'EXISTING_COMPONENT' });
});
test('theme updates preserve user customizations outside owned brand blocks', async t => {
  const root = fixture(t); applyPlan(target(root), await setup(target(root), { offline: true }));
  applyPlan(target(root), theme(target(root), { primary: '#2563eb' }));
  const path = join(root, 'src/lindaui-theme.css'); writeFileSync(path, readFileSync(path, 'utf8') + '\n:root { --radius: 1rem; }\n');
  applyPlan(target(root), theme(target(root), { primary: '#dc2626' }));
  assert.ok(readFileSync(path, 'utf8').endsWith(':root { --radius: 1rem; }\n'));
});
for (const language of ['ts', 'js']) for (const kind of ['contact-form', 'searchable-list', 'confirmation-dialog', 'data-table']) test(`scaffold ${kind} in ${language} produces parseable version-resolved imports`, t => {
  const root = fixture(t); const context = target(root); const plan = scaffold(context, { language }, kind);
  applyPlan(context, plan); assert.equal(scaffold(target(root), { language }, kind).files.length, 0);
  const result = check(target(root)); assert.equal(result.findings.filter(f => ['INVALID_IMPORT', 'PARSE_ERROR'].includes(f.code)).length, 0);
});
test('unknown recipes and names fail before creating output', t => {
  const root = fixture(t); assert.throws(() => scaffold(target(root), {}, 'unknown'), { code: 'UNKNOWN_RECIPE' });
  assert.throws(() => scaffold(target(root), { name: '../escape' }, 'contact-form'), { code: 'INVALID_NAME' });
});
test('CLI has structured errors and no mutation in dry run', async t => {
  const root = fixture(t); const before = digest(join(root, 'src/main.tsx'));
  const result = await execute(['setup', '--project', root, '--offline', '--json']); assert.equal(result.status, 'planned'); assert.equal(digest(join(root, 'src/main.tsx')), before);
  assert.throws(() => argumentsFor(['doctor', '--aply']), { code: 'UNKNOWN_OPTION' });
  assert.throws(() => argumentsFor(['setup', '--apply', '--dry-run']), { code: 'CONFLICTING_OPTIONS' });
  const child = spawnSync(process.execPath, ['skills/lindaui/scripts/lindaui.mjs', 'api', 'unknown', '--project', root, '--json'], { encoding: 'utf8' });
  assert.equal(child.status, 2); assert.equal(JSON.parse(child.stdout).error.code, 'ENTRY_UNAVAILABLE');
});
test('package manager executes without a shell in paths containing spaces and metacharacters', t => {
  const root = fixture(t); const invocation = managerInvocation('npm', ['--version']); assert.ok(invocation.command);
  assert.match(runManager(target(root), ['--version']).stdout.trim(), /^\d+\.\d+\.\d+$/);
  const result = runManager(target(root), ['run', 'typecheck']); assert.equal(result.exitCode, 0); assert.match(result.stdout, /fixture-typecheck-executed/);
});
test('Windows npm shim selects the CLI entry rather than a successful bootstrap helper', t => {
  const root = fixture(t); const shim = join(root, 'npm.cmd');
  file(root, 'node_modules/npm/bin/npm-prefix.js', 'console.log("prefix only");');
  file(root, 'node_modules/npm/bin/npm-cli.js', 'console.log("npm actually executed");');
  const script = nodeShimEntry(shim, 'SET "NPM_PREFIX_JS=%~dp0\\node_modules\\npm\\bin\\npm-prefix.js"\nSET "NPM_CLI_JS=%~dp0\\node_modules\\npm\\bin\\npm-cli.js"', 'npm');
  assert.equal(script, join(root, 'node_modules/npm/bin/npm-cli.js'));
  assert.match(spawnSync(process.execPath, [script], { encoding: 'utf8' }).stdout, /npm actually executed/);
});
test('npm packs and installs a local artifact with spaces and metacharacters on the current platform', t => {
  const root = fixture(t, { libraries: false });
  // Empty app prevents unrelated registry requests: this is a real install,
  // not a simulated npm process or a network-dependent dependency test.
  file(root, 'package.json', { name: 'portable-consumer', private: true, type: 'module', packageManager: 'npm@11.0.0' });
  const source = join(root, 'package source & á'); const vendor = join(root, 'vendor spaces & á'); mkdirSync(vendor);
  file(source, 'package.json', { name: 'portable-skill-fixture', version: '1.0.0', type: 'module', exports: './index.js' });
  file(source, 'index.js', 'export const value = 42;\n');
  runManager({ root: source, manager: 'npm' }, ['pack', '--pack-destination', vendor, '--ignore-scripts']);
  runManager({ root, manager: 'npm' }, ['install', '--offline', '--ignore-scripts', '--no-audit', '--no-fund', 'file:vendor spaces & á/portable-skill-fixture-1.0.0.tgz']);
  const installedManifest = JSON.parse(readFileSync(join(root, 'node_modules/portable-skill-fixture/package.json'), 'utf8'));
  assert.equal(installedManifest.version, '1.0.0');
});
test('check --typecheck records real script execution separately from browser verification', async t => {
  const root = fixture(t); const result = await execute(['check', '--project', root, '--typecheck']);
  assert.equal(result.data.verification.typecheck.status, 'passed'); assert.equal(result.data.verification.browser, 'not-run');
});
test('workspace targeting resolves from the app and blocks installation at the root', async t => {
  const root = fixture(t); file(root, 'pnpm-workspace.yaml', 'packages: ["apps/*"]'); file(root, 'apps/web/package.json', { name: 'web', dependencies: { react: '^19', 'react-dom': '^19' }, devDependencies: { vite: '^7' } }); file(root, 'apps/web/src/main.tsx', 'export const x = 1;');
  const context = target(join(root, 'apps/web')); assert.equal(context.owner, realpathSync(root)); assert.equal(context.packages['@lindaui/ui'].manifest.version, '0.5.0');
  await assert.rejects(setup(target(root), { offline: true }), { code: 'WORKSPACE_ROOT' });
});
test('setup reads exact published metadata and selects only compatible peers', async t => {
  const root = fixture(t, { libraries: false });
  const metadata = {
    '@lindaui/tokens': { version: '0.4.0', exports: { './css': './index.css' } },
    '@lindaui/ui': { version: '0.5.0', peerDependencies: { react: '>=19', 'react-dom': '>=19', '@lindaui/tokens': '>=0.4', 'react-hook-form': '>=7' } },
    'react-hook-form': { version: '7.1.0' }
  };
  const server = createServer((req, res) => { const name = decodeURIComponent(req.url.slice(1).split('?')[0]); const manifest = metadata[name]; res.setHeader('content-type', 'application/json'); res.end(JSON.stringify({ 'dist-tags': { latest: manifest.version }, versions: { [manifest.version]: { name, ...manifest } } })); });
  await new Promise(r => server.listen(0, '127.0.0.1', r)); t.after(() => server.close());
  const plan = await setup(target(root), { registry: `http://127.0.0.1:${server.address().port}` });
  assert.deepEqual(plan.install.specs, ['@lindaui/tokens@0.4.0', '@lindaui/ui@0.5.0', 'react-hook-form@7.1.0']);
  await assert.rejects(setup(target(root), { registry: `http://127.0.0.1:${server.address().port}`, 'ui-version': '0.6.0' }), { code: 'VERSION_UNPUBLISHED' });
});
function archive(manifest) {
  const content = Buffer.from(JSON.stringify(manifest)); const header = Buffer.alloc(512); header.write('package/package.json'); header.write(content.length.toString(8).padStart(11, '0'), 124);
  return gzipSync(Buffer.concat([header, content, Buffer.alloc((512 - content.length % 512) % 512), Buffer.alloc(1024)]));
}
test('portable tarball plans use relative file specs and bind archive hashes', async t => {
  const root = fixture(t); const directory = join(root, 'vendor'); mkdirSync(directory);
  const tokens = installed('@lindaui/tokens', root).manifest; const ui = installed('@lindaui/ui', root).manifest;
  writeFileSync(join(directory, 'tokens.tgz'), archive(tokens)); writeFileSync(join(directory, 'ui.tgz'), archive(ui));
  const plan = await setup(target(root), { tarballs: 'vendor', offline: true });
  assert.deepEqual(plan.install.specs, ['@lindaui/tokens@file:vendor/tokens.tgz', '@lindaui/ui@file:vendor/ui.tgz']);
  writeFileSync(join(directory, 'tokens.tgz'), archive({ ...tokens, version: '0.5.0' })); assert.throws(() => applyPlan(target(root), plan), { code: 'STALE_PLAN' });
});
