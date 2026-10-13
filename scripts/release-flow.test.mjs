import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createReleaseFlow, releaseCLI } from './release-flow.mjs';

function scenario(t, config = {}) {
  const root = mkdtempSync(join(tmpdir(), 'linda-release-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const [name, isPrivate] of [['public', false], ['private', true]]) {
    const directory = join(root, 'packages', name);
    mkdirSync(directory, { recursive: true });
    writeFileSync(join(directory, 'package.json'), JSON.stringify({ name: `@fixture/${name}`, version: '1.2.3', private: isPrivate }));
  }
  if (config.pendingVersions) {
    mkdirSync(join(root, '.changeset'));
    for (const name of ['README.md', 'config.json', 'delivery.md']) writeFileSync(join(root, '.changeset', name), 'version plan');
  }
  const calls = [], logs = [], requests = [];
  const header = Buffer.alloc(512);
  const body = Buffer.from(JSON.stringify(config.manifest ?? { name: '@fixture/public', version: '1.2.3' }));
  header.write('package/package.json'); header.write(body.length.toString(8), 124);
  const bytes = gzipSync(Buffer.concat([header, body, Buffer.alloc(512 - body.length % 512)]));
  const integrity = `sha512-${createHash('sha512').update(bytes).digest('base64')}`;
  const shasum = createHash('sha1').update(bytes).digest('hex');
  let clock = 1000, merged = false, pushed = false, watched = false, watchFailures = 0, polls = 0;
  const pr = { number: 7, headRefOid: 'version-head', url: 'https://example.test/pr/7' };
  const execute = (command, args, options) => {
    calls.push({ command, args, options });
    const key = args.slice(0, 2).join(' ');
    if (command === 'git') {
      if (args.join(' ') === 'rev-parse --abbrev-ref HEAD') return config.branch ?? 'main';
      if (args[0] === 'status') return config.dirty || (config.dirtyAfterWatch && watched) ? ' M tracked.txt' : '';
      if (args[0] === 'rev-list') return String(args.at(-1) === 'origin/main..main' ? (config.ahead ?? 1) : (config.behind ?? 0));
      if (args[0] === 'push') { pushed = true; return null; }
      if (args[0] === 'rev-parse') return args[1] === 'origin/main' ? 'merge-head' : config.headAfterWatch && watched ? 'other-head' : 'push-head';
      if (args[0] === 'fetch' || args[0] === 'pull') return '';
    }
    if (command === 'gh') {
      if (key === 'pr list') return JSON.stringify(config.pr || (pushed && config.prAfterPush) || (watched && config.prAfterWatch) ? [pr] : []);
      if (key === 'pr diff') return '+ "version": "1.2.3"\n+ unrelated';
      if (key === 'pr merge') { merged = true; return null; }
      if (key === 'run list') {
        if (config.timeout || (config.pollOnce && polls++ === 0)) return '[]';
        const branch = args[args.indexOf('--branch') + 1];
        const isPr = branch === 'changeset-release/main';
        const headSha = isPr ? 'version-head' : merged ? 'merge-head' : 'push-head';
        const event = isPr ? 'pull_request' : 'push';
        return JSON.stringify([
          { headSha: 'unrelated', event, name: 'CI' },
          { headSha, event: 'wrong', name: 'CI' },
          { headSha, event, name: 'Unrelated' },
          ...['CI', 'Release', 'LindaUI Skill'].map((name, index) => ({ databaseId: index + 1, name, headSha, event, url: `https://example.test/run/${index + 1}` })),
        ]);
      }
      if (key === 'run watch') {
        watched = true;
        if (config.watchFailure && (config.alwaysFail || watchFailures++ === 0)) throw new Error('watch failed');
        return null;
      }
      if (key === 'run view') return JSON.stringify(args.at(-1) === 'conclusion' ? { conclusion: config.watchFailure } : { databaseId: 1, name: 'CI', url: 'https://example.test/run/1' });
      if (key === 'run rerun') return '';
    }
    throw new Error(`Unexpected command: ${command} ${args.join(' ')}`);
  };
  const fetchRegistry = async (url, options) => {
    requests.push({ url, options });
    if (config.networkError) throw new Error('network unavailable');
    if (url === 'https://example.test/package.tgz') return {
      ok: !config.tarballStatus, status: config.tarballStatus ?? 200,
      arrayBuffer: async () => config.corrupt ? Buffer.from('corrupted') : bytes,
    };
    return {
      ok: !config.registryStatus && !(config.statusOnce && requests.length === 1), status: config.registryStatus ?? (requests.length === 1 ? config.statusOnce ?? 200 : 200),
      json: async () => config.staleOnce && requests.length === 1 ? {} : config.metadata ?? {
        versions: { '1.2.3': { dist: { tarball: 'https://example.test/package.tgz',
          ...(!config.shasum ? { integrity } : {}), shasum, ...config.dist } } },
        'dist-tags': { latest: '1.2.3' }, ...(!config.omitTime ? { time: { '1.2.3': '2026-10-13T00:00:00.000Z' } } : {}),
      },
    };
  };
  const options = { root, execute, fetchRegistry, now: () => clock, sleep: async (ms) => { clock += ms; }, log: (message) => logs.push(message), dryRun: config.dryRun ?? false };
  return { flow: createReleaseFlow(options), options, calls, logs, requests, root, integrity, shasum };
}

for (const [config, error] of [[{ branch: 'feature' }, /corre desde 'main'/], [{ dirty: true }, /sin commitear/], [{ behind: 2 }, /atrás de origin/]]) {
  test(`release preflight stops ${JSON.stringify(config)} before pushing or merging`, async t => {
    const s = scenario(t, config);
    await assert.rejects(s.flow.main(), error);
    assert.equal(s.calls.some(call => call.args[0] === 'push' || call.args[1] === 'merge'), false);
    assert.equal(s.requests.length, 0);
  });
}

test('nothing ahead and no Version PR performs no publishing work', async t => {
  const s = scenario(t, { ahead: 0 });
  await s.flow.main();
  assert.match(s.logs.join('\n'), /verificar la publicación/);
  assert.equal(s.requests.length, 2);
});

for (const config of [{ ahead: 1 }, { ahead: 0, pr: true }, { ahead: 1, pr: true }]) {
  test(`dry-run reports planned work without push, merge or registry fetch ${JSON.stringify(config)}`, async t => {
    const s = scenario(t, config);
    await releaseCLI(['--dry-run'], s.options);
    assert.equal(s.calls.some(call => call.args[0] === 'push' || call.args[1] === 'merge'), false);
    assert.equal(s.requests.length, 0);
    assert.match(s.logs.join('\n'), /dry-run/);
  });
}

test('direct releases wait for all workflows then verify only public package versions', async t => {
  const s = scenario(t, { pollOnce: true, shasum: true });
  await s.flow.main();
  assert.equal(s.calls.filter(call => call.args[0] === 'push').length, 1);
  assert.equal(s.calls.filter(call => call.args[1] === 'watch').length, 3);
  assert.equal(s.requests.length, 2);
  assert.match(s.requests[0].url, /%40fixture%2Fpublic\?release=/);
  assert.equal(s.requests[0].options.headers['cache-control'], 'no-cache');
  assert.ok(s.logs.some(message => message.includes(s.integrity)));
});

for (const config of [{ pr: true, ahead: 0 }, { prAfterPush: true, ahead: 1 }]) {
  test(`Version PR waits for its exact head, merges once and verifies the post-merge release ${JSON.stringify(config)}`, async t => {
    const s = scenario(t, config);
    await releaseCLI([], s.options);
    assert.equal(s.calls.filter(call => call.args[1] === 'merge').length, 1);
    const merge = s.calls.find(call => call.args[1] === 'merge');
    assert.equal(merge.args[merge.args.indexOf('--match-head-commit') + 1], 'version-head');
    assert.equal(s.calls.filter(call => call.args[0] === 'pull').length, 1);
    assert.equal(s.requests.length, 2);
    const mergeIndex = s.calls.findIndex(call => call.args[1] === 'merge');
    assert.ok(s.calls.slice(0, mergeIndex).filter(call => call.args[1] === 'watch').length >= 2);
    assert.match(s.logs.join('\n'), /post-merge para merge-head/);
  });
}

test('action_required retries are bounded and recover before a merge', async t => {
  const s = scenario(t, { pr: true, ahead: 0, watchFailure: 'action_required' });
  await s.flow.main();
  assert.equal(s.calls.filter(call => call.args[1] === 'rerun').length, 1);
  assert.equal(s.calls.filter(call => call.args[1] === 'merge').length, 1);
});

test('failed CI never merges a Version PR', async t => {
  const s = scenario(t, { pr: true, ahead: 0, watchFailure: 'failure' });
  await assert.rejects(s.flow.main(), /terminó en 'failure'/);
  assert.equal(s.calls.some(call => call.args[1] === 'merge'), false);
  assert.equal(s.requests.length, 0);
});

test('persistent action_required stops after three watches and two retries', async t => {
  const s = scenario(t, { pr: true, ahead: 0, watchFailure: 'action_required', alwaysFail: true });
  await assert.rejects(s.flow.main(), /tras 3 intentos/);
  assert.equal(s.calls.filter(call => call.args[1] === 'watch').length, 3);
  assert.equal(s.calls.filter(call => call.args[1] === 'rerun').length, 2);
  assert.equal(s.calls.some(call => call.args[1] === 'merge'), false);
});

test('missing workflow evidence times out without declaring publication', async t => {
  const s = scenario(t, { timeout: true });
  await assert.rejects(s.flow.main(), /Timeout esperando corridas/);
  assert.equal(s.requests.length, 0);
});

for (const config of [
  { registryStatus: 404 }, { metadata: {} },
  { metadata: { versions: { '1.2.3': {} }, 'dist-tags': { latest: '1.2.3' } } },
  { metadata: { versions: { '1.2.3': { dist: { tarball: 'https://example.test/p.tgz' } } }, 'dist-tags': { latest: 'old' } } },
]) {
  test(`registry errors or incomplete publication evidence reject success ${JSON.stringify(config)}`, async t => {
    const s = scenario(t, config);
    await assert.rejects(s.flow.reportPublishedVersions(), /registry respondió|no está publicado/);
    assert.equal(s.logs.some(message => message.includes('✓')), false);
  });
}

test('default process and timer boundaries remain usable for harmless local commands', async () => {
  const flow = createReleaseFlow({});
  assert.equal(flow.run(process.execPath, ['-e', 'process.stdout.write("ok")']), 'ok');
  assert.equal(flow.run(process.execPath, ['-e', ''], { inherit: true }), '');
  await flow.sleep(1);
});

test('help and unknown CLI flags never enter the release flow', async () => {
  const script = new URL('./release-flow.mjs', import.meta.url).pathname;
  const help = spawnSync(process.execPath, [script, '--help'], { encoding: 'utf8' });
  assert.equal(help.status, 0, help.stderr);
  assert.match(help.stdout, /Usage:/);
  const invalid = spawnSync(process.execPath, [script, '--invalid'], { encoding: 'utf8' });
  assert.equal(invalid.status, 1);
  assert.match(invalid.stderr, /Unknown release option/);
});

for (const config of [{ dirtyAfterWatch: true }, { headAfterWatch: true }]) {
  test(`concurrent checkout changes stop the merge without resetting work ${JSON.stringify(config)}`, async t => {
    const s = scenario(t, { ...config, pr: true, ahead: 0 });
    await assert.rejects(s.flow.main(), /checkout cambió/);
    assert.equal(s.calls.some(call => call.args[1] === 'merge'), false);
    assert.equal(s.calls.some(call => ['reset', 'checkout', 'clean'].includes(call.args[0])), false);
  });
}

test('stale registry metadata converges without another publish and preserves byte evidence', async t => {
  const s = scenario(t, { staleOnce: true });
  const result = await s.flow.reportPublishedVersions();
  assert.equal(result.status, 'passed');
  assert.equal(result.packages[0].attempts, 2);
  assert.equal(result.packages[0].publishedAt, '2026-10-13T00:00:00.000Z');
  assert.equal(result.packages[0].integrity, s.integrity);
  assert.equal(result.packages[0].shasum, s.shasum);
  assert.ok(readFileSync(result.packages[0].artifact).length > 0);
  assert.deepEqual(JSON.parse(readFileSync(result.receiptPath, 'utf8')).packages, result.packages);
  assert.equal(s.calls.length, 0);
});

for (const [config, message] of [
  [{ registryStatus: 401 }, /registry respondió 401/],
  [{ tarballStatus: 503 }, /tarball respondió 503/],
  [{ corrupt: true }, /integrity mismatch/],
  [{ dist: { shasum: 'wrong' } }, /shasum mismatch/],
  [{ dist: { integrity: null, shasum: null } }, /missing tarball integrity/],
  [{ dist: { tarball: 'http://example.test/package.tgz' } }, /must use HTTPS/],
  [{ manifest: { name: '@wrong/package', version: '1.2.3' } }, /manifest identity mismatch/],
  [{ manifest: { name: '@fixture/public', version: 'old' } }, /manifest identity mismatch/],
]) {
  test(`publication failures retain failed receipts ${JSON.stringify(config)}`, async t => {
    const s = scenario(t, config);
    await assert.rejects(s.flow.reportPublishedVersions(), message);
    const receipt = JSON.parse(readFileSync(join(s.root, 'coverage/publication/verification.json'), 'utf8'));
    assert.equal(receipt.status, 'failed');
    assert.equal(receipt.packages[0].status, 'failed');
    assert.ok(receipt.error);
    if (config.corrupt) assert.equal(readFileSync(receipt.packages[0].artifact, 'utf8'), 'corrupted');
    assert.equal(s.logs.some(message => message.includes('✓')), false);
  });
}

test('verify-only checks even a fully synchronized checkout without git/gh mutations', async t => {
  const s = scenario(t, { ahead: 0 });
  await releaseCLI(['--verify-only'], s.options);
  assert.equal(s.calls.length, 0);
  assert.equal(s.requests.length, 2);
  await assert.rejects(releaseCLI(['--verify-only', '--dry-run'], s.options), /Choose/);
});

for (const statusOnce of [404, 429, 503]) {
  test(`transient registry ${statusOnce} retries metadata without retrying publication`, async t => {
    const s = scenario(t, { statusOnce, omitTime: true });
    const result = await s.flow.reportPublishedVersions();
    assert.equal(result.packages[0].attempts, 2);
    assert.equal(result.packages[0].publishedAt, null);
    assert.equal(s.calls.length, 0);
  });
}

test('network errors retain failure evidence; tarball credentials and SHA-1 corruption are rejected', async t => {
  for (const [config, error] of [
    [{ networkError: true }, /network unavailable/],
    [{ dist: { tarball: 'https://user:secret@example.test/package.tgz' } }, /without credentials/],
    [{ shasum: true, corrupt: true }, /shasum mismatch/],
  ]) {
    const s = scenario(t, config);
    await assert.rejects(s.flow.reportPublishedVersions(), error);
    assert.equal(JSON.parse(readFileSync(join(s.root, 'coverage/publication/verification.json'), 'utf8')).status, 'failed');
  }
});

test('resumes a pushed changeset before the Version PR appears without another push', async t => {
  const s = scenario(t, { ahead: 0, pendingVersions: true, prAfterWatch: true });
  await s.flow.main();
  assert(!s.calls.some(call => call.command === 'git' && call.args[0] === 'push'));
  assert(s.calls.some(call => call.command === 'gh' && call.args[1] === 'merge'));
  assert.equal(s.requests.length, 2);
});
test('pending pushed versions dry run never watches, merges or verifies', async t => {
  const s = scenario(t, { ahead: 0, pendingVersions: true, dryRun: true });
  await s.flow.main();
  assert(!s.calls.some(call => call.args[1] === 'watch'));
  assert.equal(s.requests.length, 0);
});
test('no-op dry run does not query npm', async t => {
  const s = scenario(t, { ahead: 0, dryRun: true }); await s.flow.main(); assert.equal(s.requests.length, 0);
});
test('Changesets README and config are not a pending version plan', async t => {
  const s = scenario(t, { ahead: 0 });
  mkdirSync(join(s.options.root, '.changeset'));
  writeFileSync(join(s.options.root, '.changeset', 'README.md'), 'guide');
  writeFileSync(join(s.options.root, '.changeset', 'config.json'), '{}');
  await s.flow.main();
  assert(!s.calls.some(call => call.args[1] === 'watch'));
  assert.equal(s.requests.length, 2);
});
test('publication verification tolerates availability beyond the old 60 second window', async t => {
  const s = scenario(t); let metadataAttempts = 0;
  const fetchRegistry = async (url, options) => {
    if (url.includes('registry.npmjs.org') && metadataAttempts++ < 27) return { ok: true, json: async () => ({}) };
    return s.options.fetchRegistry(url, options);
  };
  const result = await createReleaseFlow({ ...s.options, fetchRegistry, verifyOnly: true }).main();
  assert.equal(result.status, 'passed');
  assert.equal(result.packages[0].attempts, 28);
  assert(s.options.now() >= 81000 && s.options.now() < 180000);
  assert(!s.calls.some(call => call.args[0] === 'push' || call.args[1] === 'merge'));
});
