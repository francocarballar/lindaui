// GitHub releases are prepared for every package before npm receives any publish.
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createReleaseFlow } from './release-flow.mjs';
import { managerInvocation } from '../skills/lindaui/scripts/lib/process.mjs';
const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export async function publishOrdered({ root = repositoryRoot, execute = execFileSync,
  verify, flow = createReleaseFlow, invoke = managerInvocation, dryRun = false,
  now = Date.now, log = console.log } = {}) {
  const run = (command, args) => {
    const invocation = command === 'pnpm' ? invoke(command, args) : { command, args };
    return (execute(invocation.command, invocation.args, { cwd: root, encoding: 'utf8', shell: false, maxBuffer: 8 * 1024 * 1024 }) ?? '').trim();
  };
  const head = run('git', ['rev-parse', 'HEAD']);
  if (run('git', ['status', '--porcelain', '--untracked-files=normal'])) throw new Error('Working-tree changes must be committed before publication.');
  const packages = readdirSync(resolve(root, 'packages')).map(directory => {
    const manifest = JSON.parse(readFileSync(resolve(root, 'packages', directory, 'package.json'), 'utf8'));
    return { ...manifest, directory };
  }).filter(pkg => !pkg.private);
  const receipt = { schemaVersion: 1, head, startedAt: now(), status: 'running', dryRun, packages: [] };
  const directory = resolve(root, 'coverage', 'publication');
  mkdirSync(directory, { recursive: true });
  const save = () => writeFileSync(resolve(directory, 'ordering.json'), JSON.stringify(receipt, null, 2) + '\n');
  save();
  try {
    // Listing once distinguishes an absent release from authentication/network errors.
    const releases = JSON.parse(run('gh', ['release', 'list', '--limit', '1000', '--json', 'tagName,isDraft,isPrerelease']));
    for (const pkg of packages) {
      const tag = `${pkg.name}@${pkg.version}`;
      const changelog = readFileSync(resolve(root, 'packages', pkg.directory, 'CHANGELOG.md'), 'utf8');
      const heading = `## ${pkg.version}`;
      const start = changelog.indexOf(heading + '\n');
      if (start === -1) throw new Error(`${tag}: missing version changelog.`);
      const notes = changelog.slice(start + heading.length).split('\n## ')[0].trim();
      if (!notes) throw new Error(`${tag}: empty version changelog.`);
      const existing = releases.find(release => release.tagName === tag);
      const record = { name: pkg.name, version: pkg.version, tag, existing: Boolean(existing) };
      receipt.packages.push(record); save();
      if (existing) {
        if (existing.isDraft || existing.isPrerelease) throw new Error(`${tag}: existing release is not public/stable.`);
        run('git', ['fetch', 'origin', `refs/tags/${tag}:refs/tags/${tag}`, '--quiet']);
        const target = run('git', ['rev-parse', `${tag}^{commit}`]);
        // Tooling-only commits may follow a release; published package content must match.
        if (run('git', ['diff', '--name-only', target, head, '--', `packages/${pkg.directory}`])) throw new Error(`${tag}: existing tag has different package content.`);
        record.target = target;
      } else if (!dryRun) {
        const notesFile = resolve(directory, `${pkg.directory}-notes.md`);
        writeFileSync(notesFile, notes + '\n');
        run('gh', ['release', 'create', tag, '--target', head, '--title', tag, '--notes-file', notesFile]);
        run('git', ['fetch', 'origin', `refs/tags/${tag}:refs/tags/${tag}`, '--quiet']);
        record.target = run('git', ['rev-parse', `${tag}^{commit}`]);
        if (record.target !== head) throw new Error(`${tag}: remote tag does not match release HEAD.`);
      }
      if (!dryRun) {
        const release = JSON.parse(run('gh', ['release', 'view', tag, '--json', 'url,publishedAt,isDraft,isPrerelease']));
        if (release.isDraft || release.isPrerelease || !release.publishedAt) throw new Error(`${tag}: GitHub release is not published.`);
        record.github = release;
      }
      save();
    }
    if (!dryRun) {
      if (run('git', ['rev-parse', 'HEAD']) !== head || run('git', ['status', '--porcelain', '--untracked-files=normal'])) throw new Error('Checkout changed before npm publish.');
      receipt.npmStartedAt = now(); save();
      // pnpm reconciles versions already present in npm, including partial retries.
      log(run('pnpm', ['-r', 'publish', '--access', 'public', '--no-git-checks']));
      if (verify) await verify();
      else await flow({ root }).reportPublishedVersions();
    }
    receipt.status = dryRun ? 'planned' : 'passed';
  } catch (error) {
    receipt.status = 'failed'; receipt.error = error.message; throw error;
  } finally {
    receipt.finishedAt = now(); save();
  }
  return receipt;
}

export async function orderedCLI(args, options = {}) {
  if (args.some(arg => arg !== '--dry-run')) throw new Error('Usage: pnpm release:publish [--dry-run]');
  return publishOrdered({ ...options, dryRun: args.includes('--dry-run') });
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  orderedCLI(process.argv.slice(2)).catch(error => { console.error(error.message); process.exitCode = 1; });
}
