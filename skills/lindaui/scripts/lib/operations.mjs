import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync, unlinkSync, realpathSync } from 'node:fs';
import { dirname, join, relative, resolve, isAbsolute } from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { DXError, digest, slash, ast, ancestors } from './project.mjs';
import { runManager } from './process.mjs';
export { runManager } from './process.mjs';

export function safePath(root, path) {
  const full = resolve(root, path); const rel = relative(root, full);
  if (!rel || rel === '..' || rel.startsWith('..' + '/') || rel.startsWith('..' + '\\') || isAbsolute(rel)) throw new DXError('OUTSIDE_PROJECT', 'Output paths must be inside the selected application.');
  let existing = dirname(full); while (!existsSync(existing)) existing = dirname(existing);
  const actual = relative(realpathSync(root), realpathSync(existing));
  if (actual === '..' || actual.startsWith('../') || actual.startsWith('..\\') || isAbsolute(actual)) throw new DXError('OUTSIDE_PROJECT', 'Output parent resolves outside the application through a symlink.');
  if (existsSync(full) && realpathSync(full) !== full) throw new DXError('SYMLINK_OUTPUT', 'Refusing to replace a symlink output.');
  return full;
}
export function change(root, path, content) {
  const full = safePath(root, path);
  return { path: slash(relative(root, full)), before: digest(full), content };
}
export function makePlan(context, command, files = [], install = null, notes = [], extraInputs = []) {
  const inputs = [...new Set([
    ...Object.values(context.packages).filter(Boolean).map(p => join(p.root, 'package.json')),
    ...ancestors(context.root).flatMap(root => ['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock', 'bun.lock', 'bun.lockb'].map(f => join(root, f))).filter(existsSync),
    ...extraInputs
  ])].map(path => ({ path, hash: digest(path) }));
  const plan = { schemaVersion: 1, command, project: context.root, manifestHash: digest(join(context.root, 'package.json')), inputs, files: files.filter(f => f.before !== createHash('sha256').update(f.content).digest('hex')), install, notes };
  return { ...plan, id: createHash('sha256').update(JSON.stringify(plan)).digest('hex') };
}
export function verifyPlan(context, plan) {
  const { id, ...body } = plan;
  if (plan.schemaVersion !== 1 || plan.project !== context.root || id !== createHash('sha256').update(JSON.stringify(body)).digest('hex')) throw new DXError('INVALID_PLAN', 'Plan schema, project or checksum does not match.');
  if (digest(join(context.root, 'package.json')) !== plan.manifestHash) throw new DXError('STALE_PLAN', 'package.json changed after planning. Prepare a new plan.');
  for (const input of plan.inputs ?? []) if (digest(input.path) !== input.hash) throw new DXError('STALE_PLAN', `${input.path} changed after planning. Prepare a new plan.`);
  for (const file of plan.files) if (digest(safePath(context.root, file.path)) !== file.before) throw new DXError('STALE_PLAN', `${file.path} changed after planning. Prepare a new plan.`);
  if (plan.install && (plan.install.manager !== context.manager || !['npm', 'pnpm', 'yarn', 'bun'].includes(plan.install.manager) || !plan.install.specs.every(s => /^(?:@[a-z0-9_.-]+\/)?[a-z0-9_.-]+@[^\r\n]+$/i.test(s)))) throw new DXError('INVALID_PLAN', 'Invalid package installation operation.');
}
export function applyPlan(context, plan) {
  verifyPlan(context, plan);
  let installation = null;
  if (plan.install?.specs.length) {
    const verb = context.manager === 'npm' ? 'install' : 'add';
    installation = runManager(context, [verb, ...plan.install.specs]);
  }
  const written = [];
  try {
    // Recheck all file preconditions after installation, before any file write.
    for (const file of plan.files) if (digest(safePath(context.root, file.path)) !== file.before) throw new DXError('STALE_PLAN', `${file.path} changed during installation. Replan the remaining file changes.`);
    for (const file of plan.files) {
      const path = safePath(context.root, file.path); mkdirSync(dirname(path), { recursive: true });
      if (file.before === null) writeFileSync(path, file.content, { flag: 'wx' });
      else {
        const temp = path + `.lindaui-${randomUUID()}.tmp`;
        try { writeFileSync(temp, file.content, { flag: 'wx' }); if (digest(path) !== file.before) throw new DXError('STALE_PLAN', `${file.path} changed before writing.`); renameSync(temp, path); }
        finally { if (existsSync(temp)) unlinkSync(temp); }
      }
      written.push(file.path);
    }
  } catch (error) {
    throw new DXError(error.code ?? 'WRITE_FAILED', error.message, { installation, written, recovery: 'Review applied changes and prepare a fresh plan; existing work was not reset.' });
  }
  return { planId: plan.id, installation, written, findings: [] };
}
export function addImport(path, text, statement) {
  if (/\.s?css$/.test(path)) {
    // CSS imports must precede rules, after @charset when present.
    const charset = text.match(/^\s*@charset\s+[^;]+;/);
    const offset = charset ? charset[0].length : 0;
    return text.slice(0, offset) + (offset ? '\n' : '') + statement + '\n' + text.slice(offset);
  }
  const tree = ast({ path, text }); const offset = tree.program.directives.at(-1)?.end ?? 0;
  return text.slice(0, offset) + (offset ? '\n' : '') + statement + '\n' + text.slice(offset);
}
export function applicationEntry(context, explicit) {
  if (explicit) {
    const path = safePath(context.root, explicit);
    if (!existsSync(path) || !/\.(?:[cm]?[jt]sx?|s?css)$/.test(path)) throw new DXError('INVALID_ENTRY', 'Select an existing JS/TS/CSS application entry with --entry.');
    return path;
  }
  const stems = context.framework === 'next' ? ['app/layout', 'src/app/layout', 'pages/_app', 'src/pages/_app'] : context.framework === 'vite' ? ['src/main', 'src/index', 'main'] : ['src/index', 'src/main'];
  const candidates = stems.flatMap(s => ['tsx', 'jsx', 'ts', 'js'].map(ext => join(context.root, `${s}.${ext}`))).filter(existsSync);
  if (candidates.length !== 1) throw new DXError('ENTRY_REQUIRED', 'Pass --entry: the application root could not be selected unambiguously.', { candidates: candidates.map(p => slash(relative(context.root, p))) });
  return candidates[0];
}
