import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, symlinkSync, rmSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { gzipSync, gunzipSync } from 'node:zlib';
import { target, installed, exportTarget, resolveEntry, compatibleDeclaration, digest, sources, ast, walk, imports, compiler, satisfies, peerIssues } from '../skills/lindaui/scripts/lib/project.mjs';
import { doctor, api, check, inspectSources } from '../skills/lindaui/scripts/lib/analyze.mjs';
import { setup, registryMetadata, tarballManifest } from '../skills/lindaui/scripts/lib/setup.mjs';
import { makePlan, change, applyPlan, safePath, addImport } from '../skills/lindaui/scripts/lib/operations.mjs';
import { theme, scaffold, activate, recipe } from '../skills/lindaui/scripts/lib/generate.mjs';
import { execute, argumentsFor, renderResult } from '../skills/lindaui/scripts/lindaui.mjs';
import { managerInvocation, runManager, nodeShimEntry } from '../skills/lindaui/scripts/lib/process.mjs';
import { inspectNativeControls, nativeScope } from '../skills/lindaui/scripts/lib/native-controls.mjs';

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
function nativeFixture(t) {
  const root = fixture(t);
  pkg(root, '@lindaui/ui', '0.5.2', Object.fromEntries(['button', 'input', 'textarea', 'select', 'link', 'disclosure', 'dialog', 'table', 'checkbox', 'radio', 'search-field', 'number-input', 'slider', 'accordion', 'badge', 'avatar', 'spinner'].map(name => [name, ''])));
  file(root, 'src/app.css', '@import "@lindaui/tokens/css";');
  return root;
}
test('native controls fail the real CLI even without LindaUI imports; corrected screen passes', t => {
  const root = nativeFixture(t);
  file(root, 'src/Applications.tsx', `export const screen = <section><button aria-expanded={true}>Expand</button><select><option value="pending">Pending</option></select><a href="/jobs">Job</a><input/><textarea/><details><summary>More</summary>Body</details><dialog/><table/></section>;`);
  const invoke = () => spawnSync(process.execPath, [fileURLToPath(new URL('../skills/lindaui/scripts/lindaui.mjs', import.meta.url)), 'check', '--project', root, '--json'], { encoding: 'utf8' });
  const bad = invoke(); assert.equal(bad.status, 1, bad.stdout);
  const findings = JSON.parse(bad.stdout).findings;
  assert.deepEqual(findings.map(f => f.element), ['button', 'select', 'a', 'input', 'textarea', 'details', 'dialog', 'table']);
  for (const f of findings) {
    assert.equal(f.code, 'NATIVE_CONTROL'); assert.equal(f.severity, 'error'); assert.equal(f.file, 'src/Applications.tsx'); assert.equal(f.line, 1);
    assert.match(f.suggestion, /^@lindaui\/ui\//); assert.ok(f.message.includes(`<${f.element}>`)); assert.ok(f.message.includes(f.suggestion));
  }
  file(root, 'src/Applications.tsx', `import { Accordion } from '@lindaui/ui/accordion'; import { Select } from '@lindaui/ui/select'; import { Badge } from '@lindaui/ui/badge'; import { Avatar } from '@lindaui/ui/avatar'; import { Link } from '@lindaui/ui/link'; import { Spinner } from '@lindaui/ui/spinner'; export const screen = <section><Accordion/><Select aria-label="Status" items={[]}/><Badge/><Avatar/><Link href="/jobs">Job</Link><Spinner/></section>;`);
  const good = invoke(); assert.equal(good.status, 0, good.stdout); assert.deepEqual(JSON.parse(good.stdout).findings, []);
});
test('semantic containers, text and graphics are never native-control findings', t => {
  const root = nativeFixture(t);
  file(root, 'src/Semantics.tsx', 'export const x = <><form/><section/><article/><ul/><ol/><li/><p/><h1/><h2/><h3/><h4/><h5/><h6/><dl/><dt/><dd/><label/><fieldset/><legend/><time/><img/><svg/><canvas/><div/><span/><main/><nav/><header/><footer/><a id="anchor"/><custom-control/><UI.button/></>;');
  assert.deepEqual(check(target(root)).findings, []);
});
test('input suggestions follow literal roles; dynamic/spread types require review', t => {
  const root = nativeFixture(t);
  const types = ['text', 'email', 'password', 'tel', 'url', 'checkbox', 'radio', 'search', 'number', 'range', 'button', 'submit', 'reset'];
  file(root, 'src/Inputs.tsx', `export const x = <><input/>${types.map(type => `<input type="${type}"/>`).join('')}<input type={'CHECKBOX'}/><input type={kind}/><input {...props}/><input type="text" {...props}/></>;`);
  const findings = check(target(root)).findings;
  assert.deepEqual(findings.slice(0, 15).map(f => f.suggestion.split('/').at(-1)), ['input', 'input', 'input', 'input', 'input', 'input', 'checkbox', 'radio', 'search-field', 'number-input', 'slider', 'button', 'button', 'button', 'checkbox']);
  assert.equal(findings[15].severity, 'warning'); assert.equal(findings[16].severity, 'warning');
  assert.match(findings[15].suggestion, /checkbox/); assert.match(findings[15].message, /runtime role/);
  assert.equal(findings[17].severity, 'warning');
  file(root, 'src/Inputs.tsx', 'export const x = <><input type="hidden"/><input type="file"/><input type="date"/><input type="time"/><input type="color"/></>;');
  const result = check(target(root)); assert.deepEqual(result.findings, []);
  assert.deepEqual(result.coverage.nativeControls.unmapped.map(n => n.type), ['hidden', 'file', 'date', 'time', 'color']);
});
test('pair diagnostics do not duplicate parents and do report orphan children', t => {
  const root = nativeFixture(t);
  file(root, 'src/Pairs.tsx', 'export const x = <><select><optgroup label="One"><option/></optgroup>{items.map(x => <option/>)}</select><details><div><summary/></div></details><option/><summary/></>;');
  assert.deepEqual(check(target(root)).findings.map(f => f.element), ['select', 'details', 'option', 'summary']);
});
test('native allowance needs a nonempty reason and is reported without leaking to siblings', t => {
  const root = nativeFixture(t);
  file(root, 'src/Viewer.tsx', `export const x = <>
    {/* lindaui-allow-native: invisible keyboard/IME capture */}
    <textarea style={{ width: 1, height: 1 }}/>
    <button/>
    {/* lindaui-allow-native:   */}<textarea/>
    {/* lindaui-allow-native */}<button/>
  </>;`);
  const result = check(target(root));
  assert.deepEqual(result.findings.map(f => f.element), ['button', 'textarea', 'button']);
  assert.deepEqual(result.coverage.nativeControls.exceptions, [{ file: 'src/Viewer.tsx', line: 3, element: 'textarea', reason: 'invisible keyboard/IME capture', suggestions: ['@lindaui/ui/textarea'] }]);
});
test('native allowance cannot authorize nested controls, fragments, expressions or across content', t => {
  const root = nativeFixture(t);
  file(root, 'src/Local.tsx', `export const x = <>
    {/* lindaui-allow-native: custom container */}<div><button/></div>
    {/* lindaui-allow-native: fragment */}<><button/></>
    {/* lindaui-allow-native: expression */}{true && <button/>}
    {/* lindaui-allow-native: text */}Visible<button/>
    {/* lindaui-allow-native: another comment */}{/* ordinary */}<button/>
    {/* ordinary */}<button/>
    {/* first */ /* second */}<span/>
    {}<span/>
    {42}<button/>
    {/* lindaui-allow-native: grouped control */}<details><summary>More</summary><button/></details>
  </>;`);
  const result = check(target(root)); assert.equal(result.findings.length, 8);
  assert.deepEqual(result.coverage.nativeControls.exceptions.map(e => e.element), ['details']);
});
test('missing package, absent export or missing runtime never suggests an unavailable counterpart', t => {
  const root = fixture(t, { libraries: false });
  file(root, 'src/View.tsx', 'export const x = <><button/><input/><a href="/"/></>;');
  assert.deepEqual(check(target(root)).findings, []);
  pkg(root, '@lindaui/ui', '0.5.2', { button: '' });
  assert.deepEqual(check(target(root)).findings.map(f => f.element), ['button']);
  rmSync(join(root, 'node_modules/@lindaui/ui/dist/button.js'));
  assert.deepEqual(check(target(root)).findings, []);
});
test('native scope reports test/fixture/story exclusions while import rules still apply', t => {
  const root = nativeFixture(t);
  const paths = ['test/View.tsx', 'tests/View.jsx', '__tests__/View.tsx', 'e2e/View.tsx', 'fixtures/View.tsx', '__fixtures__/View.tsx', 'src/View.test.tsx', 'src/View.spec.jsx', 'src/View.stories.tsx'];
  for (const path of paths) file(root, path, 'export const x = <button/>;');
  file(root, 'tests/Invalid.tsx', 'import { Missing } from "@lindaui/ui/missing"; export const x = <button/>;');
  file(root, 'src/Production.tsx', 'export const x = <button/>;');
  const result = check(target(root)); assert.equal(result.findings.filter(f => f.code === 'NATIVE_CONTROL').length, 1);
  assert.ok(result.findings.some(f => f.code === 'INVALID_IMPORT'));
  assert.equal(result.coverage.nativeControls.excluded.length, paths.length + 1);
  const context = target(root); context.manifest.name = '@lindaui/ui';
  assert.equal(nativeScope(context, { relative: 'src/button.tsx' }), 'library-authoring');
  assert.equal(inspectNativeControls(context, { relative: 'src/button.tsx' }, null).excluded, 'library-authoring');
});
test('strict mode promotes uncertain native input warnings to an exit failure', async t => {
  const root = nativeFixture(t); file(root, 'src/Unknown.tsx', 'export const x = <input type={kind}/>;');
  assert.equal((await execute(['check', '--project', root])).ok, true);
  assert.equal((await execute(['check', '--strict', '--project', root])).ok, false);
  file(root, 'src/Unknown.tsx', 'export const x = <>{/* lindaui-allow-native: invisible keyboard/IME capture */}<textarea/></>;');
  assert.equal((await execute(['check', '--strict', '--project', root])).ok, true);
  file(root, 'src/Unknown.tsx', 'export const x = <>{/* lindaui-allow-native: */}<textarea/></>;');
  assert.equal((await execute(['check', '--project', root])).ok, false);
});
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
  assert.match(contents, /Controls use installed LindaUI entries/); assert.match(contents, /lindaui-allow-native: reason/); assert.match(contents, /verification\/CI/);
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

test('CLI parser validates flags, values, positional limits and prototype names', () => {
  assert.deepEqual(argumentsFor([]), { command: 'help', options: {}, positional: [] });
  assert.deepEqual(argumentsFor(['--help']), { command: 'help', options: { help: true }, positional: [] });
  assert.deepEqual(argumentsFor(['doctor', '-h']), { command: 'doctor', options: { help: true }, positional: [] });
  assert.equal(argumentsFor(['doctor', '--project=path=with=equals']).options.project, 'path=with=equals');
  for (const [args, code] of [
    [['doctor', '--json', '--json'], 'DUPLICATE_OPTION'],
    [['doctor', '--json=true'], 'INVALID_OPTION'],
    [['doctor', '--project'], 'MISSING_OPTION_VALUE'],
    [['doctor', '--project', '--json'], 'MISSING_OPTION_VALUE'],
    [['doctor', 'extra'], 'UNEXPECTED_ARGUMENT'],
    [['api', 'button', 'extra'], 'UNEXPECTED_ARGUMENT'],
    [['scaffold', 'contact-form', 'extra'], 'UNEXPECTED_ARGUMENT'],
    [['unknown'], 'UNKNOWN_COMMAND'],
    [['constructor'], 'UNKNOWN_COMMAND'],
    [['toString', '--json'], 'UNKNOWN_COMMAND'],
    [['__proto__'], 'UNKNOWN_COMMAND'],
  ]) assert.throws(() => argumentsFor(args), { code }, JSON.stringify(args));
});

test('CLI executes saved plans, immediate application, API listing and all local generators', async t => {
  const root = fixture(t);
  assert.equal((await execute(['doctor', '--project', root])).command, 'doctor');
  assert.equal((await execute(['api', '--project', root, '--list'])).command, 'api');
  assert.equal((await execute(['setup', '--project', root, '--offline', '--apply'])).status, 'applied');
  assert.equal((await execute(['theme', '--project', root, '--primary', '#2563eb'])).status, 'planned');
  assert.equal((await execute(['scaffold', 'contact-form', '--project', root])).status, 'planned');
  assert.equal((await execute(['activate', '--project', root, '--apply'])).status, 'applied');
  const saved = join(root, 'saved-theme.json');
  const plan = await execute(['theme', '--project', root, '--primary', '#2563eb', '--save-plan', saved]);
  assert.equal(plan.status, 'planned');
  assert.equal(JSON.parse(readFileSync(saved, 'utf8')).id, plan.data.plan.id);
  assert.equal((await execute(['apply', '--project', root, '--plan', saved])).status, 'applied');
  await assert.rejects(execute(['apply', '--project', root]), { code: 'PLAN_REQUIRED' });
});

test('CLI records failed typechecks and rejects unavailable or ambiguous compiler execution', async t => {
  const root = fixture(t);
  const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  manifest.scripts.typecheck = 'node -e "process.exit(3)"';
  file(root, 'package.json', manifest);
  const failed = await execute(['check', '--project', root, '--typecheck']);
  assert.equal(failed.ok, false);
  assert.equal(failed.data.verification.typecheck.status, 'failed');
  assert.ok(failed.findings.some(finding => finding.code === 'TYPECHECK_FAILED'));
  delete manifest.scripts;
  file(root, 'package.json', manifest);
  await assert.rejects(execute(['check', '--project', root, '--typecheck']), { code: 'TYPECHECK_UNAVAILABLE' });
  manifest.scripts = { typecheck: 'node -e "process.exit(0)"' };
  delete manifest.packageManager;
  file(root, 'package.json', manifest);
  file(root, 'package-lock.json', '{}');
  file(root, 'yarn.lock', '');
  await assert.rejects(execute(['check', '--project', root, '--typecheck']), { code: 'AMBIGUOUS_MANAGER' });
});

test('actual CLI renders help, plans, findings and execution errors with documented exit codes', t => {
  const root = fixture(t);
  const cli = (...args) => spawnSync(process.execPath, ['skills/lindaui/scripts/lindaui.mjs', ...args], { encoding: 'utf8' });
  const help = cli();
  assert.equal(help.status, 0); assert.match(help.stdout, /LindaUI agent CLI/);
  const plan = cli('activate', '--project', root);
  assert.equal(plan.status, 0, plan.stdout); assert.match(plan.stdout, /activate: plan/);
  const applied = cli('activate', '--project', root, '--apply');
  assert.equal(applied.status, 0, applied.stdout); assert.match(applied.stdout, /activate: applied/);
  file(root, 'src/Bad.tsx', "import { Missing } from '@lindaui/ui/nonexistent'; export const view = Missing;");
  const findings = cli('check', '--project', root);
  assert.equal(findings.status, 1); assert.match(findings.stdout, /INVALID_IMPORT/);
  const error = cli('apply', '--project', root);
  assert.equal(error.status, 2); assert.match(error.stdout, /PLAN_REQUIRED/);
  const bad = join(root, 'bad-plan.json'); file(root, 'bad-plan.json', '{bad json');
  const generic = cli('apply', '--project', root, '--plan', bad, '--json');
  assert.equal(generic.status, 2); assert.equal(JSON.parse(generic.stdout).error.code, 'EXECUTION_ERROR');
  const strict = cli('doctor', '--project', root, '--strict', '--json');
  assert.equal(strict.status, 1); assert.equal(JSON.parse(strict.stdout).ok, false);
});

test('human CLI findings retain actionable and structured details without a message field', () => {
  const output = renderResult({ command: 'doctor', status: 'issues', data: {}, findings: [
    { severity: 'warning', code: 'REPAIR', action: 'Run setup' },
    { severity: 'error', code: 'DETAILS', affectedFiles: ['src/main.tsx'] },
  ] });
  assert.match(output, /warning: REPAIR: Run setup/);
  assert.match(output, /error: DETAILS: .*affectedFiles/);
});

test('generator guards reject malformed owned policy/theme markers without changing user files', t => {
  const root = fixture(t); const context = target(root);
  const start = '<!-- lindaui:ui-policy:start -->';
  const end = '<!-- lindaui:ui-policy:end -->';
  for (const text of [start, end, `${end}\n${start}`, `${start}\n${start}\n${end}`, `${start}\n${end}\n${end}`]) {
    file(root, 'AGENTS.md', text);
    assert.throws(() => activate(context, {}), { code: 'POLICY_MARKERS' });
    assert.equal(readFileSync(join(root, 'AGENTS.md'), 'utf8'), text);
  }
  file(root, 'AGENTS.md', 'User notes without a newline');
  const policy = activate(context, { out: 'AGENTS.md' });
  assert.match(policy.files[0].content, /^User notes without a newline\n\n/);
  file(root, 'src/main.tsx', 'import "@lindaui/tokens/css";\nexport {};');
  const valid = theme(context, { primary: '#000000', 'primary-dark': '#ffffff' });
  const css = valid.files.find(file => file.path.endsWith('.css')).content;
  assert.match(css, /--primary-foreground: #ffffff/);
  assert.match(css, /--primary-foreground: #000000/);
  const lightStart = '/* lindaui:brand:light:start */';
  const lightEnd = '/* lindaui:brand:light:end */';
  for (const text of [
    css.replace(lightStart, ''), css.replace(lightStart, 'TEMP_MARKER').replace(lightEnd, lightStart).replace('TEMP_MARKER', lightEnd),
    css.replace(lightStart, lightStart + '\n' + lightStart), css + '\n' + lightEnd,
  ]) {
    file(root, 'src/lindaui-theme.css', text);
    assert.throws(() => theme(context, { primary: '#2563eb' }), { code: 'THEME_MARKERS' });
    assert.equal(readFileSync(join(root, 'src/lindaui-theme.css'), 'utf8'), text);
  }
});

test('themes reject missing tokens, invalid colors and entries without a base stylesheet', t => {
  const root = fixture(t); const context = target(root);
  for (const primary of [undefined, '#abc', 'red']) assert.throws(() => theme(context, { primary }), { code: 'INVALID_COLOR' });
  assert.throws(() => theme(context, { primary: '#2563eb' }), { code: 'THEME_ENTRY_REQUIRED' });
  file(root, 'src/app.css', 'body {}');
  assert.throws(() => theme(context, { primary: '#2563eb', entry: 'src/app.css' }), { code: 'THEME_ENTRY_REQUIRED' });
  file(root, 'src/app.css', '@import "@lindaui/tokens/css";\nbody {}');
  const plan = theme(context, { primary: '#2563eb', entry: 'src/app.css', out: 'brand.css' });
  assert.match(plan.files.find(file => file.path === 'src/app.css').content, /@import "\.\.\/brand.css"/);
  applyPlan(context, plan);
  assert.equal(theme(context, { primary: '#2563eb', entry: 'src/app.css', out: 'brand.css' }).files.length, 0);
  rmSync(join(root, 'node_modules/@lindaui/tokens/dist/theme-template.css'));
  assert.throws(() => theme(context, { primary: '#2563eb' }), { code: 'TOKENS_REQUIRED' });
  rmSync(join(root, 'node_modules/@lindaui/tokens'), { recursive: true });
  assert.throws(() => theme(context, { primary: '#2563eb' }), { code: 'TOKENS_REQUIRED' });
});

test('scaffold validates languages, extensions, unavailable recipes and prototype keys', t => {
  const root = fixture(t); const context = target(root);
  assert.throws(() => scaffold(context, { language: 'coffee' }, 'contact-form'), { code: 'INVALID_LANGUAGE' });
  assert.throws(() => scaffold(context, { language: 'js', out: 'Contact.tsx' }, 'contact-form'), { code: 'INVALID_OUTPUT_EXTENSION' });
  assert.throws(() => scaffold(context, {}, 'toString'), { code: 'UNKNOWN_RECIPE' });
  assert.throws(() => recipe('unknown', 'Example', true), { code: 'UNKNOWN_RECIPE' });
  const generated = scaffold(context, {}, 'contact-form');
  applyPlan(context, generated);
  assert.equal(scaffold(context, {}, 'contact-form').files.length, 0);
  rmSync(join(root, 'node_modules/@lindaui/ui/dist/input.js'));
  assert.throws(() => scaffold(context, {}, 'contact-form'), { code: 'RECIPE_UNAVAILABLE' });
  rmSync(join(root, 'node_modules/@lindaui/ui'), { recursive: true });
  assert.throws(() => scaffold(context, {}, 'contact-form'), { code: 'RECIPE_UNAVAILABLE' });
  const jsRoot = fixture(t, { typescript: false });
  assert.match(scaffold(target(jsRoot), {}, 'contact-form').files[0].path, /\.jsx$/);
});

test('setup validates package/style choices and unsupported execution contexts', async t => {
  const root = fixture(t); const context = target(root);
  for (const style of ['missing', 'toString']) await assert.rejects(setup(context, { offline: true, style }), { code: 'INVALID_STYLE' });
  await assert.rejects(setup(context, { offline: true, packages: 'missing' }), { code: 'INVALID_PACKAGES' });
  await assert.rejects(setup({ ...context, manager: null }, {}), { code: 'AMBIGUOUS_MANAGER' });
  await assert.rejects(setup({ ...context, unsupported: true }, {}), { code: 'PNP_UNSUPPORTED' });
  await assert.rejects(setup({ ...context, manifest: { ...context.manifest, workspaces: ['apps/*'] } }, {}), { code: 'WORKSPACE_ROOT' });
  assert.equal((await setup(context, { offline: true, packages: 'blocks' })).install, null);
  assert.equal((await setup(context, { offline: true, packages: 'tokens' })).install, null);
  const tokens = installed('@lindaui/tokens', root).manifest;
  delete tokens.exports['./css']; file(root, 'node_modules/@lindaui/tokens/package.json', tokens);
  await assert.rejects(setup(target(root), { offline: true }), { code: 'STYLE_UNAVAILABLE' });
});

test('setup accepts compatible declared React and peers while rejecting unproven ranges', async t => {
  const root = fixture(t);
  const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  rmSync(join(root, 'node_modules/react'), { recursive: true });
  rmSync(join(root, 'node_modules/react-dom'), { recursive: true });
  rmSync(join(root, 'node_modules/react-hook-form'), { recursive: true });
  manifest.dependencies['react-hook-form'] = '^7.0.0';
  manifest.dependencies['lucide-react'] = '^0.4.0';
  file(root, 'package.json', manifest);
  assert.equal((await setup(target(root), { offline: true })).install, null);
  manifest.dependencies['react-hook-form'] = '^6'; file(root, 'package.json', manifest);
  await assert.rejects(setup(target(root), { offline: true }), { code: 'PEER_CONFLICT' });
  delete manifest.dependencies['react-hook-form']; file(root, 'package.json', manifest);
  await assert.rejects(setup(target(root), { offline: true }), { code: 'OFFLINE_PEER_MISSING' });
  manifest.dependencies.react = '^18'; file(root, 'package.json', manifest);
  await assert.rejects(setup(target(root), { offline: true }), { code: 'REACT_UNSUPPORTED' });
});

test('selected and installed peer conflicts never produce an installation plan', async t => {
  const root = fixture(t);
  const blocks = installed('@lindaui/blocks', root).manifest;
  blocks.peerDependencies['@lindaui/ui'] = '>=999';
  file(root, 'node_modules/@lindaui/blocks/package.json', blocks);
  await assert.rejects(setup(target(root), { offline: true, packages: 'blocks' }), { code: 'PEER_CONFLICT' });
  const ui = installed('@lindaui/ui', root).manifest;
  ui.peerDependencies['react-hook-form'] = '>=999';
  file(root, 'node_modules/@lindaui/ui/package.json', ui);
  await assert.rejects(setup(target(root), { offline: true }), { code: 'PEER_CONFLICT' });
  rmSync(join(root, 'node_modules/@lindaui/ui'), { recursive: true });
  await assert.rejects(setup(target(root), { offline: true }), { code: 'OFFLINE_PACKAGE_MISSING' });
});

test('setup preserves existing ambient CSS declarations and supports a CSS entry', async t => {
  const root = fixture(t);
  file(root, 'src/lindaui-css.d.ts', "declare module '@lindaui/tokens/css';\n");
  const plan = await setup(target(root), { offline: true, entry: 'src/app.css' });
  assert.equal(plan.files.length, 1);
  assert.match(plan.files[0].content, /^@import "@lindaui\/tokens\/css";/);
  file(root, 'src/lindaui-css.d.ts', 'declare const userOwned: string;');
  await assert.rejects(setup(target(root), { offline: true }), { code: 'EXISTING_DECLARATION' });
  const flat = fixture(t); rmSync(join(flat, 'src'), { recursive: true });
  file(flat, 'main.tsx', 'export {};');
  const flatPlan = await setup(target(flat), { offline: true, entry: 'main.tsx' });
  assert.ok(flatPlan.files.some(file => file.path === 'lindaui-css.d.ts'));
});

test('tarball discovery rejects duplicates and missing packages, skips unrelated archives and files', async t => {
  const root = fixture(t); const directory = join(root, 'vendor'); mkdirSync(directory);
  const tokens = installed('@lindaui/tokens', root).manifest;
  writeFileSync(join(directory, 'tokens.tgz'), archive(tokens));
  writeFileSync(join(directory, 'ignored.tgz'), archive({ name: 'unrelated', version: '1.0.0' }));
  writeFileSync(join(directory, 'README.md'), 'Artifacts');
  await assert.rejects(setup(target(root), { tarballs: 'vendor', offline: true }), { code: 'MISSING_TARBALL' });
  writeFileSync(join(directory, 'duplicate.tgz'), archive(tokens));
  await assert.rejects(setup(target(root), { tarballs: 'vendor', offline: true }), { code: 'AMBIGUOUS_TARBALLS' });
  rmSync(join(directory, 'duplicate.tgz'));
  const ui = installed('@lindaui/ui', root).manifest;
  writeFileSync(join(directory, 'ui.tgz'), archive(ui));
  const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  manifest.dependencies['@lindaui/ui'] = 'file:vendor/ui.tgz';
  manifest.dependencies['@lindaui/tokens'] = 'file:vendor/tokens.tgz';
  file(root, 'package.json', manifest);
  assert.equal((await setup(target(root), { tarballs: 'vendor', offline: true })).install, null);
});

test('tarball manifest parsing validates boundaries and scans preceding members', t => {
  const root = fixture(t); const path = join(root, 'fixture.tgz');
  for (const [name, size] of [['package/package.json', 'not-octal'], ['package/package.json', '-000000001'], ['package/package.json', '77777777777'], ['', '00000000000']]) {
    const header = Buffer.alloc(512); header.write(name); header.write(size, 124);
    writeFileSync(path, gzipSync(header));
    assert.throws(() => tarballManifest(path), { code: 'INVALID_TARBALL' });
  }
  const member = Buffer.alloc(1024); member.write('package/README.md'); member.write('00000000003', 124); member.write('abc', 512);
  writeFileSync(path, gzipSync(Buffer.concat([member, gunzipSync(archive({ name: 'fixture', version: '1.0.0' }))])));
  assert.equal(tarballManifest(path).name, 'fixture');
  writeFileSync(path, gzipSync(Buffer.alloc(0)));
  assert.throws(() => tarballManifest(path), { code: 'INVALID_TARBALL' });
});

test('registry requests reject unsafe URLs and report HTTP/connection failures', { timeout: 10000 }, async t => {
  for (const registry of ['http://example.invalid', 'ftp://example.invalid', 'https://user:password@example.invalid']) await assert.rejects(registryMetadata('fixture', registry), { code: 'INVALID_REGISTRY' });
  const server = createServer((req, res) => {
    assert.match(req.url, /^\/fixture\?lindaui=\d+$/);
    assert.equal(req.headers['cache-control'], 'no-cache');
    res.setHeader('connection', 'close');
    res.statusCode = 404; res.end('{}');
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const registry = `http://127.0.0.1:${server.address().port}/`;
  await assert.rejects(registryMetadata('fixture', registry), { code: 'REGISTRY_UNAVAILABLE' });
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
  await assert.rejects(registryMetadata('fixture', registry), { code: 'REGISTRY_UNAVAILABLE' });
});

test('project targeting handles missing manifests, Next apps, lockfile managers and PnP', t => {
  const root = fixture(t);
  const empty = join(root, 'empty'); mkdirSync(empty);
  assert.throws(() => target(empty), { code: 'PROJECT_REQUIRED' });
  const manifest = { name: 'next-consumer', private: true, dependencies: { next: '^15', react: '^19', 'react-dom': '^19' } };
  file(root, 'package.json', manifest); mkdirSync(join(root, 'app'));
  file(root, 'pnpm-lock.yaml', ''); file(root, '.pnp.js', '');
  const context = target(root);
  assert.equal(context.framework, 'next'); assert.equal(context.nextApp, true);
  assert.equal(context.manager, 'pnpm'); assert.equal(context.unsupported, true);
  file(root, 'node_modules/incorrect/package.json', { name: 'different' });
  assert.equal(installed('incorrect', root), null);
  const parent = fixture(t);
  file(parent, 'pnpm-workspace.yaml', 'packages: ["apps/*"]');
  file(parent, 'apps/web/package.json', { dependencies: {} });
  rmSync(join(parent, 'package.json'));
  assert.equal(target(join(parent, 'apps/web')).owner, realpathSync(parent));
});

test('source scans report symlinks, oversized files and file limits rather than silently claiming completeness', t => {
  const root = fixture(t);
  symlinkSync('main.tsx', join(root, 'src/linked.tsx'));
  file(root, 'src/large.js', ' '.repeat(1024 * 1024 + 1));
  file(root, 'src/types.d.ts', 'declare const typeOnly: string;');
  const scan = sources(root);
  assert.ok(scan.skipped.some(file => file.reason === 'symlink'));
  assert.ok(scan.skipped.some(file => file.path === 'src/large.js' && file.reason === 'scan-limit'));
  assert.ok(!scan.files.some(file => file.relative.endsWith('.d.ts')));
  assert.equal(sources(root, 0).files.length, 0);
  assert.ok(inspectSources(target(root)).findings.some(finding => finding.code === 'INCOMPLETE_SCAN'));
});

test('AST imports cover require literals and skip dynamic expressions and unrelated calls', () => {
  const tree = ast({ path: 'main.js', text: 'const x = require("@lindaui/ui/input"); require(); require(variable); other("@lindaui/ui/input");' });
  assert.deepEqual(imports(tree).map(entry => entry.value), ['@lindaui/ui/input']);
  assert.throws(() => ast({ path: 'broken.jsx', text: '<div' }), error => error.code === 'PARSE_ERROR' && error.message.includes('broken.jsx'));
  let visits = 0;
  walk(null, () => visits++); walk('literal', () => visits++);
  assert.equal(visits, 0);
  walk({ type: 'Parent', nested: { type: 'Child' }, ignoredValue: 1 }, () => visits++);
  assert.equal(visits, 2);
});

test('export resolution supports arrays, conditional declaration targets and wildcard suffixes', t => {
  const root = fixture(t); const info = installed('@lindaui/ui', root);
  assert.equal(exportTarget({}, './missing'), null);
  assert.equal(exportTarget({ exports: { './*.js': './dist/*.js', './long/*.js': './dist/long/*.js' } }, './long/input.js'), './dist/long/input.js');
  assert.equal(exportTarget({ exports: { './*.js': './dist/*.js' } }, './input.css'), null);
  assert.equal(exportTarget({ exports: { './x': [null, './dist/input.js'] } }, './x'), './dist/input.js');
  assert.equal(exportTarget({ exports: { './x': [null] } }, './x'), null);
  assert.equal(exportTarget({ exports: { './x': { import: { types: './dist/input.d.ts' } } } }, './x', 'types'), './dist/input.d.ts');
  assert.equal(exportTarget({ exports: { './x': { default: { types: './dist/input.d.ts' } } } }, './x', 'types'), './dist/input.d.ts');
  assert.equal(exportTarget({ exports: { './x': { default: './dist/input.js' } } }, './x'), './dist/input.js');
  assert.equal(exportTarget({ exports: { './x': './dist/input.d.ts' } }, './x', 'types'), './dist/input.d.ts');
  assert.equal(resolveEntry({ ...info, manifest: { exports: { './x': '/absolute.js' } } }, './x'), null);
  assert.equal(resolveEntry({ ...info, manifest: { exports: { './x': '../escape.js' } } }, './x'), null);
  assert.equal(resolveEntry({ ...info, manifest: { exports: { './x': './../../escape.js' } } }, './x'), null);
  assert.equal(satisfies('invalid', '>=19'), false);
  assert.equal(satisfies('19.0.0', 'invalid'), false);
});

test('compiler lookup prefers TypeScript 6, falls back to TypeScript and reports unavailable owners', t => {
  const root = fixture(t);
  assert.equal(compiler(root), null);
  const broken = fixture(t);
  file(broken, 'node_modules/typescript/package.json', { name: 'typescript', main: 'missing.cjs' });
  assert.equal(compiler(broken), null);
  const fallback = fixture(t);
  file(fallback, 'node_modules/typescript/package.json', { name: 'typescript', main: 'index.cjs' });
  file(fallback, 'node_modules/typescript/index.cjs', 'module.exports = { owner: "typescript" };');
  assert.equal(compiler(fallback).owner, 'typescript');
  const preferred = fixture(t);
  file(preferred, 'node_modules/@typescript/typescript6/package.json', { name: '@typescript/typescript6', main: 'index.cjs' });
  file(preferred, 'node_modules/@typescript/typescript6/index.cjs', 'module.exports = { owner: "typescript6" };');
  file(preferred, 'node_modules/typescript/package.json', { name: 'typescript', main: 'index.cjs' });
  file(preferred, 'node_modules/typescript/index.cjs', 'module.exports = { owner: "typescript" };');
  assert.equal(compiler(preferred).owner, 'typescript6');
});

test('doctor reports unsupported contexts, missing artifacts and multiple stylesheet entrypoints', t => {
  const root = fixture(t);
  file(root, 'src/main.tsx', 'import "@lindaui/tokens/css";');
  file(root, 'src/extra.css', '@import url("@lindaui/tokens/css");');
  const context = target(root);
  const ui = installed('@lindaui/ui', root).manifest;
  ui.exports['./*'] = './dist/*.js'; file(root, 'node_modules/@lindaui/ui/package.json', ui);
  rmSync(join(root, 'node_modules/@lindaui/ui/dist/input.js'));
  const result = doctor({ ...target(root), manager: null, unsupported: true, manifest: { ...context.manifest, workspaces: ['apps/*'] } });
  for (const code of ['AMBIGUOUS_MANAGER', 'PNP_UNSUPPORTED', 'WORKSPACE_ROOT', 'MISSING_ARTIFACT', 'MULTIPLE_STYLE_LOCATIONS']) assert.ok(result.findings.some(finding => finding.code === code), code);
  rmSync(join(root, 'node_modules/@lindaui/ui'), { recursive: true });
  assert.ok(doctor(target(root)).findings.some(finding => finding.code === 'NOT_INSTALLED'));
  file(root, 'node_modules/@lindaui/blocks/package.json', { name: '@lindaui/blocks', version: '0.5.0' });
  assert.doesNotThrow(() => doctor(target(root)));
  assert.ok(api(target(root), undefined, true).packages.some(pkg => pkg.name === '@lindaui/blocks' && pkg.entries.length === 0));
});

test('API inspection accepts scoped queries and reports missing documentation/types explicitly', t => {
  const root = fixture(t);
  assert.throws(() => api(target(root)), { code: 'COMPONENT_REQUIRED' });
  const ui = installed('@lindaui/ui', root).manifest;
  ui.exports['./input'] = './dist/input.js'; file(root, 'node_modules/@lindaui/ui/package.json', ui);
  rmSync(join(root, 'node_modules/@lindaui/ui/llms.txt'));
  const entry = api(target(root), '@lindaui/ui/input').entries[0];
  assert.equal(entry.documentation, null); assert.equal(entry.types, null); assert.equal(entry.declarations, null);
  rmSync(join(root, 'node_modules/@lindaui/ui'), { recursive: true });
  assert.throws(() => api(target(root), 'input'), { code: 'ENTRY_UNAVAILABLE' });
});

test('usage checks distinguish unavailable packages, root imports and legacy handlers', t => {
  const root = fixture(t);
  file(root, 'src/View.tsx', `import { Input } from '@lindaui/ui/input'; import { Select } from '@lindaui/ui/select'; import { Dialog } from '@lindaui/ui/dialog'; import { Button } from '@lindaui/ui/button'; import * as Root from '@lindaui/ui'; export const view = <><Input onValueChange={()=>{}}/><Select {...props}/><Select aria-label="Plan"/><Dialog {...props}/><Dialog title="Details"/><Button variant="primary"/><Button variant={value}/><Button/><Root.Unknown /></>;`);
  let result = check(target(root));
  assert.ok(result.findings.some(finding => finding.code === 'LEGACY_HANDLER'));
  assert.equal(result.findings.filter(finding => finding.code === 'SELECT_NAME').length, 0);
  assert.equal(result.findings.filter(finding => finding.code === 'DIALOG_TITLE').length, 0);
  rmSync(join(root, 'node_modules/@lindaui/ui'), { recursive: true });
  rmSync(join(root, 'node_modules/@lindaui/tokens'), { recursive: true });
  file(root, 'src/app.css', '@import "@lindaui/tokens/css";');
  result = check(target(root));
  assert.ok(result.findings.some(finding => finding.code === 'INVALID_IMPORT' && finding.message.includes('not installed')));
  assert.ok(result.findings.some(finding => finding.code === 'INVALID_STYLE_IMPORT'));
  assert.deepEqual(peerIssues({ ...target(root), packages: {} }, ['uninstalled']), []);
});

test('setup treats explicitly required peers as required and rejects unpublished compatible peers', async t => {
  const root = fixture(t);
  const ui = installed('@lindaui/ui', root).manifest;
  file(root, 'node_modules/@lindaui/ui/package.json', {
    ...ui,
    peerDependencies: { react: '>=19', 'react-dom': '>=19', '@lindaui/tokens': '>=0.4', 'absent-peer': '>=2' },
    peerDependenciesMeta: { react: {}, 'react-dom': { optional: false }, 'absent-peer': {} },
  });
  await assert.rejects(setup(target(root), { offline: true }), { code: 'OFFLINE_PEER_MISSING' });
  let response = { versions: { '1.0.0': { version: '1.0.0' } } };
  const requests = [];
  const server = createServer((req, res) => {
    requests.push(decodeURIComponent(req.url.slice(1).split('?')[0]));
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify(response));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => server.close());
  const options = { registry: `http://127.0.0.1:${server.address().port}` };
  await assert.rejects(setup(target(root), options), { code: 'PEER_CONFLICT' });
  response = {};
  await assert.rejects(setup(target(root), options), { code: 'PEER_CONFLICT' });
  assert.deepEqual(requests, ['absent-peer', 'absent-peer']);
});

test('setup preserves declared optional peers and supports manifests without peer metadata', async t => {
  const root = fixture(t);
  const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  manifest.dependencies['lucide-react'] = '>=0.4';
  file(root, 'package.json', manifest);
  assert.equal((await setup(target(root), { offline: true })).install, null);
  const ui = installed('@lindaui/ui', root).manifest;
  delete ui.peerDependenciesMeta;
  file(root, 'node_modules/@lindaui/ui/package.json', ui);
  assert.equal((await setup(target(root), { offline: true })).install, null);
});

test('refresh keeps matching installed versions without scheduling redundant installs', async t => {
  const root = fixture(t);
  const metadata = Object.fromEntries(['@lindaui/ui', '@lindaui/tokens'].map(name => [name, installed(name, root).manifest]));
  const server = createServer((req, res) => {
    const manifest = metadata[decodeURIComponent(req.url.slice(1).split('?')[0])];
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ 'dist-tags': { latest: manifest.version }, versions: { [manifest.version]: manifest } }));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => server.close());
  const plan = await setup(target(root), { refresh: true, registry: `http://127.0.0.1:${server.address().port}` });
  assert.equal(plan.install, null);
});
