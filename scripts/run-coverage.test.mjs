import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { coverageCLI, coverageTasks, runCoverage } from './run-coverage.mjs';

test('coverage continues after exits, signals, spawn errors and resolution errors; persists evidence', async () => {
  const root = await mkdtemp(join(tmpdir(), 'Linda coverage & á '));
  try {
    const calls = [];
    const tasks = ['exit', 'signal', 'spawn', 'resolve', 'pass'].map(name => ({ name, args: [name] }));
    const options = {
      root, tasks, now: () => '2026-10-12T00:00:00.000Z',
      invoke(manager, args) {
        assert.equal(manager, 'pnpm');
        if (args[0] === 'resolve') throw new Error('manager unavailable');
        return { command: process.execPath, args };
      },
      launch(command, args, config) {
        calls.push(args[0]);
        assert.equal(command, process.execPath);
        assert.deepEqual(config, { cwd: root, stdio: 'inherit', shell: false });
        const child = new EventEmitter();
        queueMicrotask(() => {
          if (args[0] === 'spawn') child.emit('error', new Error('cannot spawn'));
          else child.emit('close', args[0] === 'exit' ? 3 : args[0] === 'signal' ? null : 0, args[0] === 'signal' ? 'SIGTERM' : null);
        });
        return child;
      },
    };
    assert.equal(await coverageCLI([], options), 1);
    assert.deepEqual(calls, ['exit', 'signal', 'spawn', 'pass']);
    const receipt = JSON.parse(await readFile(join(root, 'coverage/run.json'), 'utf8'));
    assert.equal(receipt.status, 'failed');
    assert.deepEqual(receipt.tasks.map(task => task.status), ['failed', 'failed', 'failed', 'failed', 'passed']);
    assert.equal(receipt.tasks[0].exitCode, 3);
    assert.equal(receipt.tasks[1].signal, 'SIGTERM');
    assert.equal(receipt.tasks[2].error, 'cannot spawn');
    assert.equal(receipt.tasks[3].error, 'manager unavailable');
    assert.equal(receipt.startedAt, receipt.finishedAt);
    assert.equal(receipt.schemaVersion, 1);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('successful coverage uses the real package manager without shell quoting', async () => {
  const root = await mkdtemp(join(tmpdir(), 'Linda coverage success & á '));
  try {
    const tasks = [{ name: 'manager', args: ['--version'] }];
    const result = await runCoverage({ root, tasks });
    assert.equal(result.status, 'passed');
    assert.equal(result.tasks[0].exitCode, 0);
    assert.equal(await coverageCLI([], { root, tasks }), 0);
    assert.deepEqual(coverageTasks.map(task => task.name), ['libraries', 'tooling']);
    assert.ok(coverageTasks[0].args.includes('--continue=always'));
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('coverage CLI documents receipts and rejects unsupported options before launching suites', async () => {
  const script = new URL('./run-coverage.mjs', import.meta.url).pathname;
  const help = spawnSync(process.execPath, [script, '--help'], { encoding: 'utf8' });
  assert.equal(help.status, 0, help.stderr);
  assert.match(help.stdout, /coverage\/run.json/);
  const invalid = spawnSync(process.execPath, [script, '--unexpected'], { encoding: 'utf8' });
  assert.equal(invalid.status, 2);
  assert.match(invalid.stderr, /Unknown coverage options/);
  await assert.rejects(coverageCLI(['--help', '--unexpected']), /Unknown coverage options/);
});
