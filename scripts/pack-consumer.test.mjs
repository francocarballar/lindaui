import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, utimesSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { packConsumer } from './pack-consumer.mjs';

function project(t) {
  const root = mkdtempSync(join(tmpdir(), 'linda-pack-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const calls = [], logs = [];
  for (const name of ['tokens', 'ui', 'blocks']) {
    const directory = join(root, 'packages', name);
    mkdirSync(join(directory, 'src/nested'), { recursive: true });
    mkdirSync(join(directory, 'dist'), { recursive: true });
    const source = join(directory, name === 'tokens' ? 'src/main.css' : 'src/main.ts');
    writeFileSync(source, '/* fixture */'); utimesSync(source, 1, 1);
    writeFileSync(join(directory, 'src/nested/notes.json'), '{}');
    writeFileSync(join(directory, 'src/main.test.ts'), '// excluded');
    const exports = name === 'tokens' ? { './css': './dist/main.css' } : { './main': { types: './dist/main.d.ts', import: './dist/main.js', default: './dist/main.js' }, './package.json': './package.json' };
    writeFileSync(join(directory, 'package.json'), JSON.stringify({ name: `@fixture/${name}`, version: '1.2.3', exports }));
    for (const filename of ['main.css', 'main.js', 'main.d.ts']) {
      const file = join(directory, 'dist', filename); writeFileSync(file, '/* built */'); utimesSync(file, 3, 3);
    }
  }
  const options = {
    root, cwd: root,
    manager: (context, args) => { calls.push({ context, args }); return { stdout: 'packed' }; },
    readPackedManifest: () => ({ dependencies: { react: '^19' }, devDependencies: {} }),
    log: message => logs.push(message),
  };
  return { root, options, calls, logs };
}

test('portable packs target the selected project and verify each package receipt', t => {
  const s = project(t);
  packConsumer('vendor', s.options);
  assert.equal(s.calls.length, 3);
  assert.deepEqual(s.calls[0].args, ['pack', '--pack-destination', join(s.root, 'vendor')]);
  assert.equal(s.calls[1].context.root, join(s.root, 'packages/ui'));
  assert.equal(s.logs.filter(message => message.includes('Portable')).length, 3);
});

test('stale CSS from newer UI source blocks packing before creating tarballs', t => {
  const s = project(t);
  utimesSync(join(s.root, 'packages/ui/src/main.ts'), 4, 4);
  assert.throws(() => packConsumer('vendor', s.options), /@fixture\/tokens.*stale/);
  assert.equal(s.calls.length, 0);
});

test('exports drift and missing build outputs cannot produce portable receipts', t => {
  const s = project(t);
  const manifest = join(s.root, 'packages/ui/package.json');
  const before = readFileSync(manifest, 'utf8');
  const data = JSON.parse(before); data.exports['./main'].types = './wrong.d.ts';
  writeFileSync(manifest, JSON.stringify(data));
  assert.throws(() => packConsumer('vendor', s.options), /Exports drift/);
  writeFileSync(manifest, before);
  rmSync(join(s.root, 'packages/ui/dist/main.js'));
  assert.throws(() => packConsumer('vendor', s.options), /ENOENT/);
  assert.equal(s.calls.length, 0);
});

for (const protocol of ['workspace:*', 'link:../ui', 'file:../ui']) {
  test(`packed local dependency ${protocol} cannot be called portable`, t => {
    const s = project(t);
    s.options.readPackedManifest = () => ({ peerDependencies: { '@fixture/ui': protocol } });
    assert.throws(() => packConsumer('vendor', s.options), /non-portable.*peerDependencies/);
    assert.equal(s.logs.some(message => message.includes('Portable')), false);
  });
}

test('invalid destination flags fail before inspecting or packing', t => {
  const s = project(t);
  for (const value of [undefined, '', '--other']) assert.throws(() => packConsumer(value, s.options), /Usage:/);
  assert.throws(() => packConsumer(undefined), /Usage:/);
  const script = new URL('./pack-consumer.mjs', import.meta.url).pathname;
  for (const args of [[], ['--destination'], ['--destination', '--other'], ['--unknown', 'vendor']]) {
    const result = spawnSync(process.execPath, [script, ...args], { encoding: 'utf8' });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Usage:/);
  }
});

test('real built library tarballs remain portable with the actual package manager', t => {
  const directory = mkdtempSync(join(tmpdir(), 'linda-real-pack-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const result = spawnSync(process.execPath, [new URL('./pack-consumer.mjs', import.meta.url).pathname, '--destination', directory], { encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 });
  assert.equal(result.status, 0, result.stderr);
  assert.equal((result.stdout.match(/Portable /g) ?? []).length, 3);
});
