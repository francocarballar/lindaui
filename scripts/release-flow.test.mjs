import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
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
  const calls = [], logs = [], requests = [];
  let clock = 1000, merged = false, pushed = false, watchFailures = 0, polls = 0;
  const pr = { number: 7, headRefOid: 'version-head', url: 'https://example.test/pr/7' };
  const execute = (command, args, options) => {
    calls.push({ command, args, options });
    const key = args.slice(0, 2).join(' ');
    if (command === 'git') {
      if (args.join(' ') === 'rev-parse --abbrev-ref HEAD') return config.branch ?? 'main';
      if (args[0] === 'status') return config.dirty ? ' M tracked.txt' : '';
      if (args[0] === 'rev-list') return String(args.at(-1) === 'origin/main..main' ? (config.ahead ?? 1) : (config.behind ?? 0));
      if (args[0] === 'push') { pushed = true; return null; }
      if (args[0] === 'rev-parse') return args[1] === 'origin/main' ? 'merge-head' : 'push-head';
      if (args[0] === 'fetch' || args[0] === 'pull') return '';
    }
    if (command === 'gh') {
      if (key === 'pr list') return JSON.stringify(config.pr || (pushed && config.prAfterPush) ? [pr] : []);
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
    return {
      ok: !config.registryStatus, status: config.registryStatus ?? 200,
      json: async () => config.metadata ?? { versions: { '1.2.3': { dist: config.shasum ? { tarball: 'https://example.test/package.tgz', shasum: 'abc' } : { tarball: 'https://example.test/package.tgz', integrity: 'sha512-abc' } } }, 'dist-tags': { latest: '1.2.3' } },
    };
  };
  const options = { root, execute, fetchRegistry, now: () => clock, sleep: async (ms) => { clock += ms; }, log: (message) => logs.push(message), dryRun: config.dryRun ?? false };
  return { flow: createReleaseFlow(options), options, calls, logs, requests };
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
  assert.match(s.logs.join('\n'), /no hay nada que hacer/);
  assert.equal(s.requests.length, 0);
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
  assert.equal(s.requests.length, 1);
  assert.match(s.requests[0].url, /%40fixture%2Fpublic\?release=/);
  assert.equal(s.requests[0].options.headers['cache-control'], 'no-cache');
  assert.match(s.logs.join('\n'), /@fixture\/public@1.2.3 \(abc\)/);
});

for (const config of [{ pr: true, ahead: 0 }, { prAfterPush: true, ahead: 1 }]) {
  test(`Version PR waits for its exact head, merges once and verifies the post-merge release ${JSON.stringify(config)}`, async t => {
    const s = scenario(t, config);
    await releaseCLI([], s.options);
    assert.equal(s.calls.filter(call => call.args[1] === 'merge').length, 1);
    assert.equal(s.calls.filter(call => call.args[0] === 'pull').length, 1);
    assert.equal(s.requests.length, 1);
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
