import { mkdtempSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { verifyConsumers, consumerCLI } from './verify-skill-consumers.mjs';

function adapters(t, config = {}) {
  const calls = [], logs = [], errors = [], managed = [];
  let root;
  t.after(() => { if (root) rmSync(root, { recursive: true, force: true }); });
  const options = {
    createRoot: () => root = mkdtempSync(join(tmpdir(), 'linda-consumer-fixture-')),
    manager: (context, args) => {
      managed.push({ context, args });
      if (config.installError) throw Object.assign(new Error('install failed'), { details: { reason: 'offline' } });
      return { status: 0, stdout: 'fixture command receipt', stderr: '' };
    },
    spawn: (executable, args, settings) => {
      calls.push({ executable, args, settings });
      const command = args[1];
      if (config.invalidJSON) return { status: 0, stdout: 'invalid JSON', stderr: '' };
      if (config.spawnError) return { status: null, stdout: '', stderr: '', error: new Error('process unavailable') };
      if (config.failedCommand === command) return { status: 1, stdout: '{"error":"fixture failure"}', stderr: 'failed' };
      return { status: 0, stdout: '{"schemaVersion":1,"status":"fixture-verified"}', stderr: '' };
    },
    log: message => logs.push(message), errorLog: message => errors.push(message),
  };
  return { options, calls, logs, errors, managed };
}

test('all four fixture frameworks preserve generated entrypoints and verification receipts', t => {
  const s = adapters(t);
  const result = verifyConsumers({ ...s.options, tarballs: '/fixture/vendor' });
  assert.deepEqual(result.fixtures.map(fixture => fixture.kind), ['vite-ts', 'vite-js', 'next-app', 'next-pages']);
  assert.ok(result.fixtures.every(fixture => fixture.status === 'passed'));
  assert.ok(s.calls.filter(call => call.args[1] === 'setup').every(call => call.args.includes('--tarballs') && call.args.includes('--offline')));
  assert.ok(s.calls.filter(call => call.args[1] === 'scaffold').some(call => call.args.includes('js')));
  assert.ok(s.calls.filter(call => call.args[1] === 'scaffold').some(call => call.args.includes('ts')));
  assert.equal(s.managed.filter(call => call.args[0] === 'install').length, 4);
  assert.equal(s.managed.filter(call => call.args[0] === 'run').length, 4);
  assert.ok(existsSync(join(result.root, 'vite-ts/src/vite-env.d.ts')));
  assert.equal(existsSync(join(result.root, 'vite-js/tsconfig.json')), false);
  assert.match(readFileSync(join(result.root, 'next-app/src/app/layout.tsx'), 'utf8'), /<html lang="en">/);
  assert.match(readFileSync(join(result.root, 'next-pages/src/pages/_app.tsx'), 'utf8'), /AppProps/);
  const receipt = JSON.parse(readFileSync(result.receiptPath, 'utf8'));
  assert.ok(receipt.fixtures.every(fixture => fixture.status === 'passed'));
});

test('published fixtures omit offline tarballs and retain public registry provenance', t => {
  const s = adapters(t);
  const result = verifyConsumers({ ...s.options, published: true });
  assert.equal(result.artifacts, 'public npm latest');
  assert.equal(s.calls.some(call => call.args.includes('--offline')), false);
});

for (const config of [{ installError: true }, { failedCommand: 'setup' }, { spawnError: true }, { invalidJSON: true }]) {
  test(`fixture failure retains partial receipts and prevents later fixture execution ${JSON.stringify(config)}`, t => {
    const s = adapters(t, config);
    const result = verifyConsumers({ ...s.options, published: true });
    assert.equal(result.fixtures.length, 1);
    assert.equal(result.fixtures[0].status, 'failed');
    assert.ok(result.fixtures[0].error.message);
    assert.equal(JSON.parse(readFileSync(result.receiptPath, 'utf8')).fixtures[0].status, 'failed');
    assert.equal(s.errors.length, 1);
    assert.equal(s.managed.filter(call => call.args[0] === 'run').length, 0);
  });
}

test('exclusive source selection is required before allocating fixtures', t => {
  const s = adapters(t);
  assert.throws(() => verifyConsumers(s.options), /Choose --tarballs/);
  assert.throws(() => verifyConsumers({ ...s.options, tarballs: '/fixture/vendor', published: true }), /Choose --tarballs/);
});

test('CLI supports JSON success/failure receipts and rejects ambiguous flags', t => {
  const s = adapters(t);
  const messages = [];
  t.mock.method(console, 'log', message => messages.push(message));
  assert.equal(consumerCLI(['--published', '--json'], s.options), 0);
  assert.equal(JSON.parse(messages.pop()).fixtures.length, 4);
  const failed = adapters(t, { failedCommand: 'setup' });
  assert.equal(consumerCLI(['--tarballs', '/fixture/vendor', '--json'], failed.options), 1);
  assert.equal(JSON.parse(messages.pop()).fixtures[0].status, 'failed');
  const human = adapters(t);
  assert.equal(consumerCLI(['--published'], human.options), 0);
  assert.match(human.logs.at(-1), /Consumer verification artifacts/);
  for (const args of [[], ['--tarballs'], ['--tarballs', '--published'], ['--published', 'extra'], ['--unknown']]) assert.throws(() => consumerCLI(args, s.options), /Choose --tarballs/);
});

test('default artifact allocation remains caller-owned and inspectable', t => {
  const s = adapters(t);
  const { createRoot, log, errorLog, ...boundaries } = s.options;
  const result = verifyConsumers({ ...boundaries, published: true });
  t.after(() => rmSync(result.root, { recursive: true, force: true }));
  assert.ok(existsSync(result.receiptPath));
});

test('CLI help and invalid flags complete without installing any consumer', () => {
  const script = new URL('./verify-skill-consumers.mjs', import.meta.url).pathname;
  const help = spawnSync(process.execPath, [script, '--help'], { encoding: 'utf8' });
  assert.equal(help.status, 0, help.stderr);
  assert.match(help.stdout, /Choose --tarballs/);
  const invalid = spawnSync(process.execPath, [script, '--published', '--tarballs'], { encoding: 'utf8' });
  assert.equal(invalid.status, 1);
  assert.match(invalid.stderr, /Choose --tarballs/);
});
