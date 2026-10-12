import { existsSync, readFileSync, readdirSync, realpathSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { parse, semver } from './vendor.mjs';

export const packageNames = ['@lindaui/tokens', '@lindaui/ui', '@lindaui/blocks'];
export class DXError extends Error {
  constructor(code, message, details = {}) { super(message); this.code = code; this.details = details; }
}
export const json = path => JSON.parse(readFileSync(path, 'utf8'));
export const digest = path => existsSync(path) ? createHash('sha256').update(readFileSync(path)).digest('hex') : null;
export const slash = path => path.replaceAll('\\', '/');
export function ancestors(start) {
  const result = []; let path = resolve(start);
  for (;;) { result.push(path); const parent = dirname(path); if (parent === path) break; path = parent; }
  return result;
}
export function installed(name, project) {
  // Read the owning manifest directly: UI intentionally does not export package.json.
  for (const parent of ancestors(project)) {
    const location = join(parent, 'node_modules', name, 'package.json');
    if (existsSync(location)) {
      const manifest = json(location);
      if (manifest.name === name) return { root: dirname(realpathSync(location)), manifest };
    }
  }
  return null;
}
export function target(project = '.') {
  const root = realpathSync(resolve(project));
  if (!existsSync(join(root, 'package.json'))) throw new DXError('PROJECT_REQUIRED', 'Select the application directory containing package.json with --project.');
  const manifest = json(join(root, 'package.json'));
  const deps = { ...manifest.devDependencies, ...manifest.dependencies };
  const parents = ancestors(root);
  const owner = parents.find(p => existsSync(join(p, 'pnpm-workspace.yaml')) || (existsSync(join(p, 'package.json')) && json(join(p, 'package.json')).workspaces)) ?? root;
  const ownerManifest = existsSync(join(owner, 'package.json')) ? json(join(owner, 'package.json')) : {};
  const locks = [['pnpm', 'pnpm-lock.yaml'], ['npm', 'package-lock.json'], ['yarn', 'yarn.lock'], ['bun', 'bun.lock'], ['bun', 'bun.lockb']].filter(([, f]) => parents.some(p => existsSync(join(p, f))));
  const declaredManager = (manifest.packageManager ?? ownerManifest.packageManager)?.split('@')[0];
  const managers = [...new Set(locks.map(([name]) => name))];
  const manager = declaredManager ?? (managers.length === 1 ? managers[0] : managers.length === 0 ? 'npm' : null);
  const framework = deps.next ? 'next' : deps.vite ? 'vite' : 'react';
  const nextApp = framework === 'next' && ['app', 'src/app'].some(p => existsSync(join(root, p)));
  const packages = Object.fromEntries([...packageNames, 'react', 'react-dom'].map(name => [name, installed(name, root)]));
  const unsupported = parents.some(p => existsSync(join(p, '.pnp.cjs')) || existsSync(join(p, '.pnp.js')));
  return { root, owner, manifest, deps, manager, managers, framework, nextApp, packages, unsupported };
}
const ignored = new Set(['node_modules', '.git', '.next', '.turbo', '.cache', 'dist', 'build', 'coverage', '.agents', '.claude', '.codex', '.yarn', 'skills', 'storybook-static']);
export function sources(root, limit = 5000) {
  const files = []; const skipped = [];
  function visit(path) {
    for (const entry of readdirSync(path, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const file = join(path, entry.name);
      if (entry.isSymbolicLink()) { skipped.push({ path: slash(relative(root, file)), reason: 'symlink' }); continue; }
      if (entry.isDirectory()) { if (!ignored.has(entry.name)) visit(file); continue; }
      if (!/\.(?:[cm]?[jt]sx?|s?css)$/.test(entry.name) || /\.d\.[cm]?ts$/.test(entry.name)) continue;
      if (files.length >= limit || statSync(file).size > 1024 * 1024) { skipped.push({ path: slash(relative(root, file)), reason: 'scan-limit' }); continue; }
      files.push({ path: file, relative: slash(relative(root, file)), text: readFileSync(file, 'utf8') });
    }
  }
  visit(root); return { files, skipped };
}
export function ast(file) {
  try { return parse(file.text, { sourceType: 'unambiguous', plugins: ['jsx', ...( /\.[cm]?tsx?$/.test(file.path) ? ['typescript'] : [])] }); }
  catch (error) { throw new DXError('PARSE_ERROR', `${file.relative ?? file.path}: ${error.message}`); }
}
export function walk(node, callback) {
  if (!node || typeof node !== 'object') return;
  if (typeof node.type === 'string') callback(node);
  for (const [key, child] of Object.entries(node)) {
    if (['loc', 'tokens', 'comments', 'leadingComments', 'trailingComments', 'innerComments', 'extra'].includes(key)) continue;
    if (Array.isArray(child)) for (const item of child) walk(item, callback);
    else if (child && typeof child === 'object') walk(child, callback);
  }
}
export function imports(tree) {
  const result = [];
  walk(tree, node => {
    if (['ImportDeclaration', 'ExportNamedDeclaration', 'ExportAllDeclaration'].includes(node.type) && node.source) result.push({ value: node.source.value, line: node.loc.start.line, node });
    else if (node.type === 'ImportExpression' && node.source?.type === 'StringLiteral') result.push({ value: node.source.value, line: node.loc.start.line, node });
    else if (node.type === 'CallExpression' && (node.callee.type === 'Import' || (node.callee.type === 'Identifier' && node.callee.name === 'require')) && node.arguments[0]?.type === 'StringLiteral') result.push({ value: node.arguments[0].value, line: node.loc.start.line, node });
  });
  return result;
}
export function exportTarget(manifest, subpath, kind = 'import') {
  let value = manifest.exports?.[subpath]; let star;
  if (value === undefined) {
    const matches = Object.keys(manifest.exports ?? {}).filter(k => k.includes('*')).sort((a, b) => b.length - a.length);
    for (const key of matches) {
      const [start, end] = key.split('*');
      if (subpath.startsWith(start) && subpath.endsWith(end)) { star = subpath.slice(start.length, end ? -end.length : undefined); value = manifest.exports[key]; break; }
    }
  }
  function select(entry) {
    if (typeof entry === 'string') {
      if (kind === 'types' && !/\.d\.[cm]?ts$/.test(entry)) return null;
      return star === undefined ? entry : entry.replaceAll('*', star);
    }
    if (!entry) return null;
    if (Array.isArray(entry)) return entry.map(select).find(Boolean) ?? null;
    if (kind === 'types') return select(entry.types ?? entry.import?.types ?? entry.default?.types);
    return select(entry.import ?? entry.default);
  }
  return select(value);
}
export function resolveEntry(info, subpath, kind = 'import') {
  const entry = exportTarget(info.manifest, subpath, kind);
  if (!entry || !entry.startsWith('./')) return null;
  const path = resolve(info.root, entry);
  if (!path.startsWith(info.root + '/') && !path.startsWith(info.root + '\\')) return null;
  return existsSync(path) ? path : null;
}
export function satisfies(version, range) { return Boolean(semver.valid(version) && semver.validRange(range) && semver.satisfies(version, range)); }
export function compatibleDeclaration(range, required) {
  // Workspace/file references require installed metadata; don't guess their version.
  return Boolean(semver.validRange(range) && semver.validRange(required) && semver.subset(range, required));
}
export function compiler(project) {
  const require = createRequire(join(project, 'package.json'));
  for (const name of ['@typescript/typescript6', 'typescript']) {
    try { return require(name); } catch { /* unavailable */ }
  }
  return null;
}
export function peerIssues(context, selected = packageNames) {
  const findings = [];
  for (const name of selected) {
    const info = context.packages[name] ?? installed(name, context.root); if (!info) continue;
    for (const [peer, range] of Object.entries(info.manifest.peerDependencies ?? {})) {
      const present = installed(peer, context.root);
      const optional = info.manifest.peerDependenciesMeta?.[peer]?.optional;
      if (!present) {
        if (!optional) findings.push({ code: 'MISSING_PEER', severity: 'error', package: name, peer, required: range, action: `Install ${peer} satisfying ${range} in this application.` });
      } else if (!satisfies(present.manifest.version, range)) findings.push({ code: 'INCOMPATIBLE_PEER', severity: 'error', package: name, peer, installed: present.manifest.version, required: range, action: 'Resolve the version conflict before implementation.' });
    }
  }
  return findings;
}
