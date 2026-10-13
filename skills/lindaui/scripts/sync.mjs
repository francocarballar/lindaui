#!/usr/bin/env node
// Compare/update entire installed skill copies, with receipts and drift backups.
import { copyFileSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, renameSync, unlinkSync, writeFileSync } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const canonical = fileURLToPath(new URL('..', import.meta.url));
const hash = value => createHash('sha256').update(value).digest('hex');

export function skillInventory(root) {
  const files = new Map();
  function visit(path) {
    for (const name of readdirSync(path).sort()) {
      const location = join(path, name); const stat = lstatSync(location);
      if (stat.isSymbolicLink() || (!stat.isFile() && !stat.isDirectory())) throw new Error(`Unsupported skill path: ${location}`);
      if (stat.isDirectory()) visit(location);
      else files.set(relative(root, location).replaceAll('\\', '/'), hash(readFileSync(location)));
    }
  }
  visit(root);
  return { files, hash: hash(JSON.stringify([...files.keys()].sort().map(path => [path, files.get(path)]))) };
}

function contains(parent, child) {
  const path = relative(parent, child);
  return path === '' || (path !== '..' && !path.startsWith('..' + sep) && !isAbsolute(path));
}

export function syncSkill(destination, { source = canonical, apply = false, backupRoot = tmpdir(), inventory = skillInventory } = {}) {
  source = realpathSync(source);
  if (!/^---\r?\nname: lindaui\r?\n/.test(readFileSync(join(source, 'SKILL.md'), 'utf8'))) throw new Error('Source must be a canonical lindaui skill.');
  // Resolve the parent of a new copy, but never follow a symlink at its root.
  destination = resolve(destination);
  if (existsSync(destination)) {
    if (lstatSync(destination).isSymbolicLink()) throw new Error('Skill destination must not be a symlink.');
    destination = realpathSync(destination);
    if (!/^---\r?\nname: lindaui\r?\n/.test(readFileSync(join(destination, 'SKILL.md'), 'utf8'))) throw new Error('Refusing to replace a directory that is not a lindaui skill.');
  } else destination = join(realpathSync(dirname(destination)), basename(destination));
  if (contains(source, destination) || contains(destination, source)) throw new Error('Source and destination must be separate skill directories.');
  const expected = inventory(source);
  const present = existsSync(destination) ? inventory(destination) : { files: new Map(), hash: null };
  const paths = [...new Set([...expected.files.keys(), ...present.files.keys()])].sort();
  const changes = paths.filter(path => expected.files.get(path) !== present.files.get(path)).map(path => ({ path, action: !expected.files.has(path) ? 'remove' : present.files.has(path) ? 'update' : 'create', before: present.files.get(path) ?? null, after: expected.files.get(path) ?? null }));
  const report = { schemaVersion: 1, source, destination, expectedHash: expected.hash, actualHash: present.hash, changes, status: changes.length ? 'drift' : 'matched', backup: null };
  if (!apply || !changes.length) return report;
  // Back up the full previous copy, including files absent from the new release.
  if (present.hash) {
    report.backup = mkdtempSync(join(backupRoot, 'lindaui-skill-backup-'));
    for (const path of present.files.keys()) {
      const backup = join(report.backup, path); mkdirSync(dirname(backup), { recursive: true }); copyFileSync(join(destination, path), backup);
    }
  }
  try {
    mkdirSync(destination, { recursive: true });
    for (const change of changes) {
      const path = join(destination, change.path);
      if (change.action === 'remove') unlinkSync(path);
      else {
        mkdirSync(dirname(path), { recursive: true });
        const temporary = path + '.' + randomUUID() + '.tmp';
        writeFileSync(temporary, readFileSync(join(source, change.path)), { flag: 'wx' }); renameSync(temporary, path);
      }
    }
    report.actualHash = inventory(destination).hash;
    if (report.actualHash !== report.expectedHash) throw new Error(`Skill changed during synchronization; inspect ${destination} and backup ${report.backup}.`);
    report.status = 'synchronized';
    return report;
  } catch (error) {
    throw new Error(`Skill synchronization failed: ${error.message}. Previous copy backup: ${report.backup}. Inspect partial changes before retrying.`);
  }
}

export function syncCLI(args, options = {}) {
  if (!args.length || args[0] === '--help') return { status: 'help', usage: 'node <canonical-skill>/scripts/sync.mjs --destination <installed-skill> [--apply]. Read-only comparison by default; drift exits 1, errors exit 2. Updates back up the full previous copy.' };
  if (args[0] !== '--destination' || !args[1] || args[1].startsWith('--') || args.length > 3 || (args[2] && args[2] !== '--apply')) throw new Error('Expected --destination <installed-skill> [--apply].');
  return syncSkill(args[1], { ...options, apply: args[2] === '--apply' });
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { const report = syncCLI(process.argv.slice(2)); console.log(JSON.stringify(report, null, 2)); process.exitCode = report.status === 'drift' ? 1 : 0; }
  catch (error) { console.error(error.message); process.exitCode = 2; }
}
