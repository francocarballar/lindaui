import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs, { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync, symlinkSync } from 'node:fs';
import { syncBuiltinESMExports } from 'node:module';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { makePlan, change, applyPlan, verifyPlan, safePath, addImport, applicationEntry } from '../skills/lindaui/scripts/lib/operations.mjs';

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'Linda plan & á '));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  writeFileSync(join(root, 'package.json'), '{}');
  return { root, packages: {}, manager: 'npm', framework: 'react' };
}
function sign(body) { return { ...body, id: createHash('sha256').update(JSON.stringify(body)).digest('hex') }; }

test('plan validation rejects wrong schema/project, managers and invalid install specs', t => {
  const context = fixture(t);
  for (const install of [
    { manager: 'pnpm', specs: ['react@19'] },
    { manager: 'unknown', specs: ['react@19'] },
    { manager: 'npm', specs: ['--force'] },
    { manager: 'npm', specs: ['react@19\n--force'] },
  ]) assert.throws(() => verifyPlan(context, makePlan(context, 'setup', [], install)), { code: 'INVALID_PLAN' });
  assert.throws(() => verifyPlan({ ...context, manager: 'unknown' }, makePlan(context, 'setup', [], { manager: 'unknown', specs: [] })), { code: 'INVALID_PLAN' });
  const { id, ...body } = makePlan(context, 'setup');
  assert.throws(() => verifyPlan(context, sign({ ...body, schemaVersion: 2 })), { code: 'INVALID_PLAN' });
  assert.throws(() => verifyPlan(context, sign({ ...body, project: context.root + '/other' })), { code: 'INVALID_PLAN' });
  delete body.inputs;
  assert.doesNotThrow(() => verifyPlan(context, sign(body)));
});

test('installation receipts survive changed file preconditions without overwriting user edits', t => {
  const context = fixture(t);
  const file = join(context.root, 'owned.txt');
  writeFileSync(file, 'original');
  const plan = makePlan(context, 'setup', [change(context.root, 'owned.txt', 'planned')], { manager: 'npm', specs: ['fixture@file:vendor'] });
  const receipt = { exitCode: 0, stdout: 'installed' };
  assert.throws(() => applyPlan(context, plan, { install(current, args) {
    assert.equal(current, context);
    assert.deepEqual(args, ['install', 'fixture@file:vendor']);
    writeFileSync(file, 'human edit during install');
    return receipt;
  } }), error => {
    assert.equal(error.code, 'STALE_PLAN');
    assert.deepEqual(error.details.installation, receipt);
    assert.deepEqual(error.details.written, []);
    return true;
  });
  assert.equal(readFileSync(file, 'utf8'), 'human edit during install');
});

test('non-npm installation uses add and empty specs cause no installation', t => {
  const context = { ...fixture(t), manager: 'pnpm' };
  const plan = makePlan(context, 'setup', [], { manager: 'pnpm', specs: ['fixture@1.0.0'] });
  const result = applyPlan(context, plan, { install(_context, args) { assert.deepEqual(args, ['add', 'fixture@1.0.0']); return { exitCode: 0 }; } });
  assert.equal(result.installation.exitCode, 0);
  assert.equal(applyPlan(context, makePlan(context, 'setup', [], { manager: 'pnpm', specs: [] }), { install() { assert.fail('empty specs must not launch a manager'); } }).installation, null);
});

test('atomic writes detect concurrent edits and remove their staged temporary files', t => {
  const context = fixture(t);
  const file = join(context.root, 'owned.txt');
  writeFileSync(file, 'original');
  const plan = makePlan(context, 'theme', [change(context.root, 'owned.txt', 'planned')]);
  const originalWrite = fs.writeFileSync;
  const mock = t.mock.method(fs, 'writeFileSync', (path, ...args) => {
    originalWrite(path, ...args);
    if (String(path).endsWith('.tmp')) originalWrite(file, 'concurrent edit');
  });
  syncBuiltinESMExports();
  try {
    assert.throws(() => applyPlan(context, plan), { code: 'STALE_PLAN' });
    assert.equal(readFileSync(file, 'utf8'), 'concurrent edit');
    assert.equal(fs.readdirSync(context.root).some(name => name.endsWith('.tmp')), false);
  } finally { mock.mock.restore(); syncBuiltinESMExports(); }
});

test('partial write failures preserve completed receipts and do not reset written files', t => {
  const context = fixture(t);
  const plan = makePlan(context, 'activate', [change(context.root, 'first.txt', 'first'), change(context.root, 'second.txt', 'second')]);
  const originalWrite = fs.writeFileSync;
  const mock = t.mock.method(fs, 'writeFileSync', (path, ...args) => {
    if (String(path).endsWith('second.txt')) throw new Error('storage unavailable');
    return originalWrite(path, ...args);
  });
  syncBuiltinESMExports();
  try {
    assert.throws(() => applyPlan(context, plan), error => {
      assert.equal(error.code, 'WRITE_FAILED');
      assert.deepEqual(error.details.written, ['first.txt']);
      assert.match(error.details.recovery, /existing work was not reset/);
      return true;
    });
    assert.equal(readFileSync(join(context.root, 'first.txt'), 'utf8'), 'first');
    assert.equal(existsSync(join(context.root, 'second.txt')), false);
  } finally { mock.mock.restore(); syncBuiltinESMExports(); }
});

test('safe paths reject a symlink output and create nested paths inside the application', t => {
  const context = fixture(t);
  writeFileSync(join(context.root, 'real.txt'), 'original');
  symlinkSync('real.txt', join(context.root, 'link.txt'));
  assert.throws(() => safePath(context.root, 'link.txt'), { code: 'SYMLINK_OUTPUT' });
  assert.throws(() => safePath(context.root, '.'), { code: 'OUTSIDE_PROJECT' });
  assert.throws(() => safePath(context.root, '..'), { code: 'OUTSIDE_PROJECT' });
  const plan = makePlan(context, 'scaffold', [change(context.root, 'nested/deep/new.txt', 'new')]);
  applyPlan(context, plan);
  assert.equal(readFileSync(join(context.root, 'nested/deep/new.txt'), 'utf8'), 'new');
});

test('entry selection and imports preserve CSS charsets and JS directives', t => {
  const context = fixture(t);
  mkdirSync(join(context.root, 'src'));
  writeFileSync(join(context.root, 'src/index.jsx'), 'export {};');
  assert.equal(applicationEntry(context), join(context.root, 'src/index.jsx'));
  assert.equal(applicationEntry(context, 'src/index.jsx'), join(context.root, 'src/index.jsx'));
  assert.throws(() => applicationEntry(context, 'missing.tsx'), { code: 'INVALID_ENTRY' });
  assert.throws(() => applicationEntry(context, 'package.json'), { code: 'INVALID_ENTRY' });
  writeFileSync(join(context.root, 'src/main.tsx'), 'export {};');
  assert.throws(() => applicationEntry(context), { code: 'ENTRY_REQUIRED' });
  assert.equal(applicationEntry({ ...context, framework: 'vite' }, 'src/main.tsx'), join(context.root, 'src/main.tsx'));
  mkdirSync(join(context.root, 'app'));
  writeFileSync(join(context.root, 'app/layout.tsx'), 'export {};');
  assert.equal(applicationEntry({ ...context, framework: 'next' }), join(context.root, 'app/layout.tsx'));
  assert.equal(addImport('style.scss', '@charset "UTF-8";\nbody {}', '@import "base";'), '@charset "UTF-8";\n@import "base";\n\nbody {}');
  assert.equal(addImport('style.css', 'body {}', '@import "base";'), '@import "base";\nbody {}');
  assert.equal(addImport('main.jsx', 'export {};', 'import "base";'), 'import "base";\nexport {};');
  assert.equal(addImport('main.tsx', '"use client";\nexport {};', 'import "base";'), '"use client";\nimport "base";\n\nexport {};');
});
