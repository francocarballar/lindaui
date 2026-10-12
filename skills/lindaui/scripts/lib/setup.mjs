import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { gunzipSync } from 'node:zlib';
import { DXError, json, installed, packageNames, satisfies, compatibleDeclaration, slash, exportTarget } from './project.mjs';
import { semver } from './vendor.mjs';
import { makePlan, change, applicationEntry, addImport, safePath } from './operations.mjs';
import { inspectSources } from './analyze.mjs';

export function tarballManifest(path) {
  const tar = gunzipSync(readFileSync(path), { maxOutputLength: 128 * 1024 * 1024 });
  for (let offset = 0; offset + 512 <= tar.length;) {
    const name = tar.subarray(offset, offset + 100).toString().replace(/\0.*$/, '');
    const size = Number.parseInt(tar.subarray(offset + 124, offset + 136).toString().replace(/\0.*$/, '').trim(), 8);
    if (!name) break;
    if (!Number.isFinite(size) || size < 0 || offset + 512 + size > tar.length) throw new DXError('INVALID_TARBALL', `Malformed tarball: ${path}`);
    if (name === 'package/package.json') return JSON.parse(tar.subarray(offset + 512, offset + 512 + size).toString());
    offset += 512 + Math.ceil(size / 512) * 512;
  }
  throw new DXError('INVALID_TARBALL', `No package/package.json in ${path}`);
}
export async function registryMetadata(name, registry = 'https://registry.npmjs.org') {
  const url = new URL(registry);
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))) throw new DXError('INVALID_REGISTRY', 'Use HTTPS for registries; HTTP is supported only for local verification.');
  if (url.username || url.password) throw new DXError('INVALID_REGISTRY', 'Do not put credentials in registry URLs.');
  let response;
  try { response = await fetch(`${registry.replace(/\/$/, '')}/${encodeURIComponent(name)}?lindaui=${Date.now()}`, { signal: AbortSignal.timeout(15000), headers: { accept: 'application/json', 'cache-control': 'no-cache' } }); }
  catch (error) { throw new DXError('REGISTRY_UNAVAILABLE', `Could not read public metadata for ${name}: ${error.message}`); }
  if (!response.ok) throw new DXError('REGISTRY_UNAVAILABLE', `Metadata request for ${name} returned HTTP ${response.status}.`);
  return response.json();
}
export async function setup(context, options) {
  if (!context.manager) throw new DXError('AMBIGUOUS_MANAGER', 'Declare packageManager before installation.');
  if (context.unsupported) throw new DXError('PNP_UNSUPPORTED', 'Yarn PnP requires its own resolver; automatic setup currently supports node_modules.');
  if (context.root === context.owner && (context.manifest.workspaces || existsSync(join(context.root, 'pnpm-workspace.yaml')))) throw new DXError('WORKSPACE_ROOT', 'Select the consumer application with --project.');
  for (const name of ['react', 'react-dom']) {
    const info = installed(name, context.root);
    if (!(info ? satisfies(info.manifest.version, '>=19') : compatibleDeclaration(context.deps[name], '>=19'))) throw new DXError('REACT_UNSUPPORTED', `${name} must already be installed or declared within >=19. This command does not migrate React.`);
  }
  const requested = (options.packages ?? 'ui').split(',');
  if (requested.some(n => !['ui', 'blocks', 'tokens'].includes(n))) throw new DXError('INVALID_PACKAGES', '--packages accepts ui,blocks,tokens.');
  const selected = new Set(['@lindaui/tokens', ...requested.map(n => `@lindaui/${n}`)]);
  if (selected.has('@lindaui/blocks')) selected.add('@lindaui/ui');
  const tarballs = new Map(); const cache = new Map();
  if (options.tarballs) {
    const directory = resolve(context.root, options.tarballs);
    for (const file of readdirSync(directory).filter(f => f.endsWith('.tgz'))) {
      const path = join(directory, file); const manifest = tarballManifest(path);
      if (!packageNames.includes(manifest.name)) continue;
      if (tarballs.has(manifest.name)) throw new DXError('AMBIGUOUS_TARBALLS', `Keep one tarball per package in ${directory}.`);
      tarballs.set(manifest.name, { manifest, path, spec: `file:${slash(relative(context.root, path))}` });
    }
  }
  const getMetadata = async name => {
    if (!cache.has(name)) cache.set(name, await registryMetadata(name, options.registry));
    return cache.get(name);
  };
  const chosen = new Map();
  for (const name of selected) {
    const existing = installed(name, context.root); const pinned = options[`${name.split('/')[1]}-version`];
    if (options.tarballs) {
      const info = tarballs.get(name); if (!info) throw new DXError('MISSING_TARBALL', `No tarball supplied for ${name}.`);
      chosen.set(name, info);
    } else if (existing && !options.refresh && !pinned) chosen.set(name, { manifest: existing.manifest, spec: null });
    else {
      if (options.offline) throw new DXError('OFFLINE_PACKAGE_MISSING', `${name} needs registry metadata. Supply --tarballs or install it before using --offline.`);
      const metadata = await getMetadata(name); const version = pinned ?? metadata['dist-tags']?.latest;
      const manifest = metadata.versions?.[version];
      if (!manifest) throw new DXError('VERSION_UNPUBLISHED', `${name}@${version} is not published in the selected registry.`);
      chosen.set(name, { manifest, spec: existing?.manifest.version === version ? null : version });
    }
  }
  const requirements = new Map();
  for (const [name, info] of chosen) for (const [peer, range] of Object.entries(info.manifest.peerDependencies ?? {})) {
    if (info.manifest.peerDependenciesMeta?.[peer]?.optional && !context.deps[peer]) continue;
    if (!requirements.has(peer)) requirements.set(peer, []);
    requirements.get(peer).push({ name, range });
  }
  const specs = [...chosen].filter(([name, p]) => p.spec && context.deps[name] !== p.spec).map(([name, p]) => `${name}@${p.spec}`);
  for (const [peer, needs] of requirements) {
    const selectedPeer = chosen.get(peer); const present = installed(peer, context.root);
    if (selectedPeer) {
      if (!needs.every(r => satisfies(selectedPeer.manifest.version, r.range))) throw new DXError('PEER_CONFLICT', `${peer}@${selectedPeer.manifest.version} does not meet selected library requirements. Review --refresh or explicit package versions.`, { requirements: needs });
    } else if (present) {
      if (!needs.every(r => satisfies(present.manifest.version, r.range))) throw new DXError('PEER_CONFLICT', `${peer}@${present.manifest.version} conflicts with the selected packages.`, { requirements: needs });
    } else if (context.deps[peer]) {
      if (!needs.every(r => compatibleDeclaration(context.deps[peer], r.range))) throw new DXError('PEER_CONFLICT', `The declaration for ${peer} cannot be proven compatible. Install the existing dependencies or resolve the range.`, { declaration: context.deps[peer], requirements: needs });
    } else {
      if (options.offline) throw new DXError('OFFLINE_PEER_MISSING', `Install ${peer} satisfying ${needs.map(r => r.range).join(' and ')} before using --offline.`);
      const metadata = await getMetadata(peer);
      const version = Object.keys(metadata.versions ?? {}).filter(v => needs.every(r => satisfies(v, r.range))).sort(semver.rcompare)[0];
      if (!version) throw new DXError('PEER_CONFLICT', `No published ${peer} version satisfies all selected packages.`, { requirements: needs });
      specs.push(`${peer}@${version}`);
    }
  }
  const style = options.style ?? 'default';
  const styles = { default: '@lindaui/tokens/css', violet: '@lindaui/tokens/lead-converter/compiled.css' };
  if (!Object.hasOwn(styles, style)) throw new DXError('INVALID_STYLE', '--style accepts default or violet. Use the theming reference for a custom Tailwind source pipeline.');
  if (!chosen.get('@lindaui/tokens').manifest.exports?.['./' + styles[style].slice('@lindaui/tokens/'.length)]) throw new DXError('STYLE_UNAVAILABLE', `${styles[style]} is not exported by the selected tokens version.`);
  const scan = inspectSources(context); const files = []; const notes = [];
  if (scan.findings.some(f => f.severity === 'error')) throw new DXError('SOURCE_ERRORS', 'Resolve parse/style errors before automatic setup.', { findings: scan.findings });
  if (scan.base.length && scan.base.some(e => e.value !== styles[style])) throw new DXError('STYLE_CONFLICT', 'A different base style is already imported. Review the existing theme before changing it.', { existing: scan.base, requested: styles[style] });
  if (scan.base.length) notes.push('A matching style import already exists. Verify its runtime reachability; no second import was added.');
  else {
    const entry = applicationEntry(context, options.entry); const text = readFileSync(entry, 'utf8');
    const statement = /\.s?css$/.test(entry) ? `@import "${styles[style]}";` : `import "${styles[style]}";`;
    files.push(change(context.root, relative(context.root, entry), addImport(entry, text, statement)));
  }
  // Older published tokens use a bare CSS export. Vite's *.css declaration
  // does not cover the extensionless tokens/css subpath in strict TypeScript.
  const styleKey = './' + styles[style].slice('@lindaui/tokens/'.length);
  if (!exportTarget(chosen.get('@lindaui/tokens').manifest, styleKey, 'types') && existsSync(join(context.root, 'tsconfig.json'))) {
    const declaration = `declare module "${styles[style]}";\n`;
    const path = existsSync(join(context.root, 'src')) ? 'src/lindaui-css.d.ts' : 'lindaui-css.d.ts';
    const full = safePath(context.root, path);
    if (!existsSync(full)) files.push(change(context.root, path, declaration));
    else if (!readFileSync(full, 'utf8').includes(`declare module "${styles[style]}"`) && !readFileSync(full, 'utf8').includes(`declare module '${styles[style]}'`)) throw new DXError('EXISTING_DECLARATION', `${path} has user content. Add the CSS module declaration manually or upgrade to typed token exports.`);
    notes.push(`Older tokens export CSS without types. Ensure ${path} is included by the app's TypeScript configuration; new typed token exports do not need this fallback.`);
  }
  const install = specs.length ? { manager: context.manager, specs } : null;
  notes.push('Precompiled styles cover library utilities. New application utility classes require your own CSS/Tailwind pipeline.');
  return makePlan(context, 'setup', files, install, notes, [...chosen.values()].map(p => p.path).filter(Boolean));
}
