import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ast, imports, walk, sources, packageNames, installed, peerIssues, resolveEntry, DXError } from './project.mjs';

export function inspectSources(context) {
  const scan = sources(context.root); const findings = []; const parsed = []; const styleImports = [];
  for (const file of scan.files) {
    if (/\.s?css$/.test(file.path)) {
      const text = file.text.replace(/\/\*[\s\S]*?\*\//g, '');
      for (const match of text.matchAll(/@import\s+(?:url\(\s*)?["'](@lindaui\/tokens\/[^"']+)["']/g)) styleImports.push({ value: match[1], file: file.relative });
      continue;
    }
    try {
      const tree = ast(file); const entries = imports(tree);
      for (const entry of entries.filter(e => e.value.startsWith('@lindaui/tokens/'))) styleImports.push({ value: entry.value, file: file.relative, line: entry.line });
      parsed.push({ file, tree, entries });
    } catch (error) { findings.push({ code: error.code, severity: 'error', message: error.message, file: file.relative }); }
  }
  if (scan.skipped.length) findings.push({ code: 'INCOMPLETE_SCAN', severity: 'warning', message: 'Some files were skipped; inspect the reported paths.', paths: scan.skipped });
  const base = styleImports.filter(e => /\/(css|heroui\.css|lead-converter\.css|lead-converter\/compiled\.css)$/.test(e.value));
  for (const file of new Set(base.map(e => e.file))) {
    const entries = base.filter(e => e.file === file);
    if (entries.length > 1) findings.push({ code: 'STYLE_CONFLICT', severity: 'error', file, imports: entries, message: 'Use one base style entry in this file.' });
  }
  if (new Set(base.map(e => e.file)).size > 1) findings.push({ code: 'MULTIPLE_STYLE_LOCATIONS', severity: 'warning', imports: base, message: 'Check whether these locations share an application entry; base styles should load once.' });
  return { ...scan, findings, parsed, styleImports, base };
}
export function doctor(context) {
  const scan = inspectSources(context); const findings = [...scan.findings];
  if (!context.manager) findings.push({ code: 'AMBIGUOUS_MANAGER', severity: 'error', managers: context.managers, message: 'Declare packageManager or remove an obsolete lockfile after reviewing ownership.' });
  if (context.unsupported) findings.push({ code: 'PNP_UNSUPPORTED', severity: 'error', message: 'This inspector supports node_modules resolution. Inspect Yarn PnP with its own resolver; do not change the linker automatically.' });
  if (context.root === context.owner && (context.manifest.workspaces || existsSync(join(context.root, 'pnpm-workspace.yaml')))) findings.push({ code: 'WORKSPACE_ROOT', severity: 'warning', message: 'Select the consumer application with --project, rather than installing into the workspace root.' });
  for (const name of ['react', 'react-dom']) {
    const info = context.packages[name];
    if (info && Number(info.manifest.version.split('.')[0]) < 19) findings.push({ code: 'REACT_UNSUPPORTED', severity: 'error', package: name, installed: info.manifest.version, message: 'LindaUI requires React 19 or later; a React migration is a separate decision.' });
  }
  for (const name of packageNames) {
    const info = context.packages[name];
    if (!info) continue;
    for (const key of Object.keys(info.manifest.exports ?? {})) {
      if (key.includes('*')) continue;
      if (!resolveEntry(info, key)) findings.push({ code: 'MISSING_ARTIFACT', severity: 'error', package: name, subpath: key, message: 'The installed export points to a missing artifact. Reinstall or rebuild the selected local package.' });
    }
  }
  findings.push(...peerIssues(context));
  if (!context.packages['@lindaui/ui']) findings.push({ code: 'NOT_INSTALLED', severity: 'warning', message: 'Run setup to prepare LindaUI installation.' });
  if (!scan.base.length) findings.push({ code: 'STYLES_NOT_FOUND', severity: 'warning', message: 'No base style import found in inspected sources. Review setup and any external style configuration.' });
  return { framework: context.framework, packageManager: context.manager, workspaceRoot: context.owner, packages: Object.fromEntries(Object.entries(context.packages).map(([n, p]) => [n, p?.manifest.version ?? null])), styleImports: scan.styleImports, findings, coverage: { scanned: scan.files.length, skipped: scan.skipped }, nextActions: findings.map(f => f.action ?? f.message).filter(Boolean) };
}
export function api(context, query, list = false) {
  if (list) return { packages: Object.entries(context.packages).filter(([name, p]) => packageNames.includes(name) && p).map(([name, info]) => ({ name, version: info.manifest.version, entries: Object.keys(info.manifest.exports ?? {}).map(key => ({ import: name + key.slice(1), available: Boolean(resolveEntry(info, key)) })) })), findings: [] };
  if (!query) throw new DXError('COMPONENT_REQUIRED', 'Pass an entry name, such as input, or @lindaui/blocks/list-pane.');
  const match = query.match(/^(@lindaui\/(?:ui|blocks|tokens))\/(.+)$/);
  const candidates = match ? [[match[1], match[2]]] : packageNames.map(name => [name, query]);
  const result = [];
  for (const [name, entry] of candidates) {
    const info = context.packages[name]; if (!info) continue;
    const runtime = resolveEntry(info, `./${entry}`); if (!runtime) continue;
    const types = resolveEntry(info, `./${entry}`, 'types');
    const docs = join(info.root, 'llms.txt');
    result.push({ package: name, version: info.manifest.version, import: `${name}/${entry}`, runtime, types, declarations: types ? readFileSync(types, 'utf8') : null, documentation: existsSync(docs) ? docs : null, note: 'Inherited and re-exported types must also be read from their installed owners.' });
  }
  if (!result.length) throw new DXError('ENTRY_UNAVAILABLE', `${query} is not available in the installed packages. Run doctor; do not assume GitHub main matches npm.`, { available: Object.fromEntries(packageNames.map(n => [n, Object.keys(context.packages[n]?.manifest.exports ?? {})])) });
  return { entries: result, findings: [] };
}
export function check(context) {
  const scan = inspectSources(context); const findings = [...scan.findings, ...peerIssues(context)]; let imported = 0;
  for (const { file, tree, entries } of scan.parsed) {
    const bindings = new Map();
    for (const entry of entries) {
      const name = packageNames.find(n => entry.value === n || entry.value.startsWith(n + '/')); if (!name) continue;
      imported++;
      const info = context.packages[name]; const key = entry.value === name ? '.' : '.' + entry.value.slice(name.length);
      if (!info || !resolveEntry(info, key)) findings.push({ code: 'INVALID_IMPORT', severity: 'error', file: file.relative, line: entry.line, import: entry.value, message: info ? `Not exported or missing in ${name}@${info.manifest.version}.` : `${name} is not installed in this application.` });
      if (entry.node.type === 'ImportDeclaration') for (const spec of entry.node.specifiers) if (spec.type === 'ImportSpecifier') bindings.set(spec.local.name, { imported: spec.imported.name, from: entry.value });
    }
    walk(tree, node => {
      if (node.type !== 'JSXOpeningElement' || node.name.type !== 'JSXIdentifier') return;
      const binding = bindings.get(node.name.name); if (!binding) return;
      const attrs = new Map(node.attributes.filter(a => a.type === 'JSXAttribute').map(a => [a.name.name, a]));
      const spread = node.attributes.some(a => a.type === 'JSXSpreadAttribute');
      const add = (code, message, severity = 'error') => findings.push({ code, severity, file: file.relative, line: node.loc.start.line, message });
      if (/^@lindaui\/ui\/(?:input|textarea|number-input|search-field)$/.test(binding.from) && attrs.has('className')) add('FIELD_CLASSNAME', 'Flat fields exclude className; style --field-* tokens or their surrounding layout.');
      if (binding.from === '@lindaui/ui/button' && binding.imported === 'Button') {
        if (attrs.has('color')) add('BUTTON_COLOR', 'Flat Button uses variant, not color.');
        const value = attrs.get('variant')?.value;
        if (value?.type === 'StringLiteral' && !['primary', 'secondary', 'ghost', 'danger', 'link'].includes(value.value)) add('BUTTON_VARIANT', `Unsupported flat Button variant: ${value.value}.`);
      }
      if (binding.from === '@lindaui/ui/select' && !spread && !['label', 'aria-label', 'aria-labelledby'].some(a => attrs.has(a))) add('SELECT_NAME', 'Provide label, aria-label or aria-labelledby. Placeholder is not an accessible name.', 'warning');
      if (binding.from === '@lindaui/ui/dialog' && !spread && !attrs.has('title')) add('DIALOG_TITLE', 'Flat Dialog needs title for an accessible name; its API does not expose aria-label.', 'warning');
      if (/^@lindaui\/ui\/(?:input|select|checkbox|radio|switch|slider|textarea|search-field)$/.test(binding.from) && attrs.has('onValueChange')) add('LEGACY_HANDLER', 'Read the installed flat contract; its handler is onChange, not onValueChange.');
    });
  }
  for (const entry of scan.styleImports) {
    const info = context.packages['@lindaui/tokens'];
    if (!info || !resolveEntry(info, '.' + entry.value.slice('@lindaui/tokens'.length))) findings.push({ code: 'INVALID_STYLE_IMPORT', severity: 'error', ...entry, message: 'This stylesheet is not available in installed tokens.' });
  }
  if (imported && !scan.base.length) findings.push({ code: 'STYLES_NOT_FOUND', severity: 'warning', message: 'LindaUI imports were found without a base stylesheet in inspected sources.' });
  return { findings, coverage: { scanned: scan.files.length, skipped: scan.skipped, lindaImports: imported }, verification: { importResolution: true, knownUsageRules: true, typecheck: 'not-run', browser: 'not-run', accessibility: 'heuristic-only' } };
}
