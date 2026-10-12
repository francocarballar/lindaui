import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { mkdtemp, mkdir, writeFile, readFile, readdir, rm } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createStyleBuilder, verifyOutput } from '../packages/tokens/scripts/build-css.mjs';

const css = Object.fromEntries(['index', 'lead-converter'].map(name => [name, readFileSync(new URL(`../packages/tokens/dist/${name}.css`, import.meta.url), 'utf8')]));
async function until(predicate) {
  const deadline = Date.now() + 3000;
  while (!predicate()) {
    if (Date.now() > deadline) assert.fail('builder did not reach the expected state');
    await new Promise(resolve => setTimeout(resolve, 5));
  }
}
async function fixture(t, producer) {
  const root = await mkdtemp(join(tmpdir(), 'Linda CSS & á '));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, 'dist'));
  for (const name of Object.keys(css)) await writeFile(join(root, 'dist', name + '.css'), 'previous ' + name);
  const watchers = [], children = [], logs = [], errors = [];
  const signalHost = new EventEmitter();
  const builder = createStyleBuilder({
    root, signalHost, log: message => logs.push(message), error: message => errors.push(message),
    observe(path, options, callback) {
      assert.equal(options.recursive, true);
      const watcher = { path, callback, closed: false, close() { this.closed = true; } };
      watchers.push(watcher); return watcher;
    },
    launch(command, args, options) {
      assert.equal(command, process.execPath);
      assert.equal(options.cwd, root);
      const child = new EventEmitter();
      child.killed = false;
      child.kill = signal => { child.killed = true; child.signal = signal; child.emit('close', null); };
      children.push(child);
      const output = args[args.indexOf('-o') + 1];
      const name = output.endsWith('-index.output.css') ? 'index' : 'lead-converter';
      queueMicrotask(async () => {
        try {
          const result = await producer(name, children.length);
          if (child.killed) return;
          if (result instanceof Error) child.emit('error', result);
          else if (typeof result === 'number') child.emit('close', result);
          else { await writeFile(join(root, output), result); child.emit('close', 0); }
        } catch (error) { child.emit('error', error); }
      });
      return child;
    },
  });
  return { root, builder, signalHost, watchers, children, logs, errors };
}

test('CSS validation checks both themes, incomplete layers, minimum size and theme contamination', () => {
  verifyOutput('index', css.index);
  verifyOutput('lead-converter', css['lead-converter']);
  const errors = [];
  assert.throws(() => verifyOutput('index', css.index.replaceAll('.bg-primary', '.other'), message => errors.push(message)), /Refusing/);
  assert.ok(errors.some(message => message.includes('falta ".bg-primary"')));
  assert.throws(() => verifyOutput('index', '.bg-primary --field-background @keyframes ti-rec-pulse --accent', message => errors.push(message)), /Refusing/);
  assert.ok(errors.some(message => message.includes('tamaño sospechoso')));
  for (const contamination of ['font-size: 18px', '--accent: var(--primary)']) assert.throws(() => verifyOutput('lead-converter', css['lead-converter'] + contamination), /must not inherit/);
});

test('failed compiler exits and spawn errors preserve existing bundles and clean owned files', async t => {
  for (const result of [1, new Error('cannot start Tailwind')]) {
    const f = await fixture(t, () => result);
    await assert.rejects(f.builder.run(), /Tailwind .* exited|cannot start/);
    for (const name of Object.keys(css)) assert.equal(await readFile(join(f.root, 'dist', name + '.css'), 'utf8'), 'previous ' + name);
    assert.deepEqual((await readdir(f.root)).sort(), ['dist']);
    assert.deepEqual((await readdir(join(f.root, 'dist'))).sort(), ['index.css', 'lead-converter.css']);
    assert.equal(f.signalHost.listenerCount('SIGTERM'), 0);
  }
});

test('watch mode queues complete rebuilds and removes watchers/signal handlers on shutdown', async t => {
  const f = await fixture(t, name => css[name]);
  const running = f.builder.run({ watch: true });
  await until(() => f.logs.length === 2);
  assert.equal(f.watchers.length, 3);
  f.watchers[0].callback();
  await until(() => f.logs.length === 4);
  f.signalHost.emit('SIGTERM');
  await running;
  assert.ok(f.watchers.every(watcher => watcher.closed));
  assert.equal(f.signalHost.listenerCount('SIGINT'), 0);
  assert.equal(f.signalHost.listenerCount('SIGTERM'), 0);
  for (const name of Object.keys(css)) assert.equal(await readFile(join(f.root, 'dist', name + '.css'), 'utf8'), css[name]);
});

test('shutdown during compilation skips queued builds and never publishes an incomplete snapshot', async t => {
  let release;
  const held = new Promise(resolve => { release = resolve; });
  const f = await fixture(t, async name => { await held; return css[name]; });
  const running = f.builder.run({ watch: true });
  await until(() => f.children.length === 2);
  f.watchers[0].callback();
  await new Promise(resolve => setTimeout(resolve, 100));
  f.signalHost.emit('SIGINT');
  release();
  await running;
  assert.equal(f.children.length, 2);
  assert.ok(f.children.every(child => child.signal === 'SIGINT'));
  assert.equal(f.logs.length, 0);
  for (const name of Object.keys(css)) assert.equal(await readFile(join(f.root, 'dist', name + '.css'), 'utf8'), 'previous ' + name);
});

test('watch rebuild failures stop the watcher and keep the prior valid output', async t => {
  let fail = false;
  const f = await fixture(t, name => fail ? 2 : css[name]);
  const running = f.builder.run({ watch: true });
  // Attach the rejection handler before the watcher can fail.
  const failed = assert.rejects(running, /exited with 2/);
  await until(() => f.logs.length === 2);
  fail = true;
  f.watchers[0].callback();
  await failed;
  assert.ok(f.watchers.every(watcher => watcher.closed));
  for (const name of Object.keys(css)) assert.equal(await readFile(join(f.root, 'dist', name + '.css'), 'utf8'), css[name]);
});
