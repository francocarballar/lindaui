import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { publishOrdered, orderedCLI } from './publish-ordered.mjs';

function fixture(t, { existing = false, failure, dirty = '', drift = '', changeHead = false, draft = false, prerelease = false, unpublished = false, missingNotes = false, emptyNotes = false, publishFailure = false, verifyFailure = false } = {}) {
  const root = mkdtempSync(resolve(tmpdir(), 'lindaui ordered '));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const name of ['a', 'b', 'private']) {
    const dir = resolve(root, 'packages', name); mkdirSync(dir, { recursive: true });
    writeFileSync(resolve(dir, 'package.json'), JSON.stringify({ name: `@lindaui/${name}`, version: '1.2.3', private: name === 'private' }));
    writeFileSync(resolve(dir, 'CHANGELOG.md'), missingNotes ? '# Changelog\n' : `# Changelog\n\n## 1.2.3\n\n${emptyNotes ? '' : 'Fixed workflow.'}\n\n## 1.2.2\nOld notes.\n`);
  }
  const calls = []; let heads = 0;
  const execute = (command, args) => {
    calls.push([command, ...args]);
    if (failure && command === 'gh' && args[1] === 'list') throw new Error(failure);
    if (command === 'git') {
      if (args[0] === 'status') return dirty;
      if (args[0] === 'diff') return drift;
      if (args[0] === 'rev-parse') return changeHead && heads++ > 0 ? 'other' : 'head';
      return '';
    }
    if (command === 'gh') {
      if (args[1] === 'list') return JSON.stringify(existing ? ['a', 'b'].map(name => ({ tagName: `@lindaui/${name}@1.2.3`, isDraft: draft, isPrerelease: prerelease })) : []);
      if (args[1] === 'view') return JSON.stringify({ url: 'https://github.com/test/release', publishedAt: unpublished ? null : '2026-10-13T00:00:00Z', isDraft: draft, isPrerelease: prerelease });
      return undefined;
    }
    if (publishFailure) throw new Error('npm failed');
    return 'published';
  };
  const verify = async () => { calls.push(['verify']); if (verifyFailure) throw new Error('integrity mismatch'); };
  return { root, execute, verify, invoke: (command, args) => ({ command, args }), log: () => {}, now: () => 123, calls };
}

test('creates ALL GitHub releases before npm; saves order and verifies bytes', async t => {
  const f = fixture(t); const result = await publishOrdered(f);
  assert.equal(result.status, 'passed'); assert.equal(result.packages.length, 2);
  const publish = f.calls.findIndex(call => call[0] === 'pnpm');
  assert.equal(f.calls.slice(0, publish).filter(call => call[0] === 'gh' && call[1] === 'release' && call[2] === 'create').length, 2);
  assert.equal(f.calls.at(-1)[0], 'verify');
  assert.match(readFileSync(resolve(f.root, 'coverage/publication/a-notes.md'), 'utf8'), /^Fixed workflow\.\n$/);
  assert.equal(JSON.parse(readFileSync(resolve(f.root, 'coverage/publication/ordering.json'))).head, 'head');
});
test('existing releases reconcile tags without recreating them', async t => {
  const f = fixture(t, { existing: true }); await publishOrdered(f);
  assert.equal(f.calls.filter(call => call[2] === 'create').length, 0);
  assert.equal(f.calls.filter(call => call[1] === 'fetch').length, 2);
});
test('dry run reads notes and plans but never creates releases, publishes or verifies', async t => {
  const f = fixture(t); assert.equal((await orderedCLI(['--dry-run'], f)).status, 'planned');
  assert(!f.calls.some(call => ['pnpm', 'verify'].includes(call[0]) || call[2] === 'create'));
});
test('dry run reconciles existing release tags', async t => {
  const f = fixture(t, { existing: true }); await publishOrdered({ ...f, dryRun: true });
  assert(!f.calls.some(call => call[2] === 'view'));
});
for (const [name, options, pattern] of [
  ['dirty tree', { dirty: ' M package.json' }, /committed/],
  ['untracked source', { dirty: '?? packages/a/src/new.ts' }, /committed/],
  ['read authentication failure', { failure: 'auth failed' }, /auth failed/],
  ['missing changelog', { missingNotes: true }, /missing version/],
  ['empty changelog', { emptyNotes: true }, /empty version/],
  ['existing draft', { existing: true, draft: true }, /public\/stable/],
  ['existing prerelease', { existing: true, prerelease: true }, /public\/stable/],
  ['different tag payload', { existing: true, drift: 'packages/a/src.ts' }, /different package/],
  ['new draft', { draft: true }, /not published/],
  ['new prerelease', { prerelease: true }, /not published/],
  ['missing published timestamp', { unpublished: true }, /not published/],
  ['conflicting remote tag', { changeHead: true }, /remote tag/],
  ['npm error', { publishFailure: true }, /npm failed/],
  ['verification error', { verifyFailure: true }, /integrity mismatch/],
]) test(`rejects ${name}`, async t => {
  const f = fixture(t, options); await assert.rejects(publishOrdered(f), pattern);
  if (!options.dirty) assert.equal(JSON.parse(readFileSync(resolve(f.root, 'coverage/publication/ordering.json'))).status, 'failed');
});
test('unknown CLI flag cannot publish', async () => { await assert.rejects(orderedCLI(['--force']), /Usage/); });
test('empty CLI flags publish using injected boundaries', async t => { assert.equal((await orderedCLI([], fixture(t))).status, 'passed'); });
test('default verification path invokes the registry verifier', async t => {
  const f = fixture(t); let verified = false;
  await publishOrdered({ ...f, verify: undefined, flow: ({ root }) => { assert.equal(root, f.root); return { reportPublishedVersions: async () => { verified = true; } }; } });
  assert(verified);
});
test('CLI entry reports unknown option with exit 1', async () => {
  const { spawnSync } = await import('node:child_process');
  const result = spawnSync(process.execPath, ['scripts/publish-ordered.mjs', '--bad'], { encoding: 'utf8' });
  assert.equal(result.status, 1); assert.match(result.stderr, /Usage/);
});
test('receipt persistence failure prevents reporting publication success', async t => {
  const f = fixture(t);
  await assert.rejects(publishOrdered({ ...f, verify: async () => {
    const directory = resolve(f.root, 'coverage/publication');
    rmSync(directory, { recursive: true }); writeFileSync(directory, 'concurrent filesystem conflict');
  } }), /ENOTDIR/);
});

test('checkout becomes dirty after GitHub releases and blocks npm', async t => {
  const f = fixture(t); const original = f.execute; let statuses = 0;
  f.execute = (command, args) => command === 'git' && args[0] === 'status' && statuses++ > 0 ? ' M src' : original(command, args);
  await assert.rejects(publishOrdered(f), /Checkout changed/);
  assert(!f.calls.some(call => call[0] === 'pnpm'));
});
test('checkout HEAD changes after GitHub releases and blocks npm', async t => {
  const f = fixture(t); const original = f.execute; let heads = 0;
  f.execute = (command, args) => command === 'git' && args[0] === 'rev-parse' && args[1] === 'HEAD' && heads++ > 0 ? 'different' : original(command, args);
  await assert.rejects(publishOrdered(f), /Checkout changed/);
});
