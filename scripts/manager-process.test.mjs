import { mkdtempSync, mkdirSync, writeFileSync, symlinkSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nodeShimEntry, managerInvocation, runManager } from '../skills/lindaui/scripts/lib/process.mjs';

function binaries(t) {
  const root = mkdtempSync(join(tmpdir(), 'linda manager spaces & á-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return { root, environment: { execPath: join(root, 'engine/node'), env: { PATH: root }, platform: 'linux' } };
}

test('Windows shims select the actual manager entry instead of bootstrap helpers', t => {
  const { root } = binaries(t);
  const shim = join(root, 'npm.cmd');
  writeFileSync(join(root, 'npm-prefix.js'), '// helper');
  writeFileSync(join(root, 'npm-cli.js'), '// CLI');
  assert.equal(nodeShimEntry(shim, '"%~dp0\\npm-prefix.js"\n"%~dp0\\npm-cli.js"', 'npm'), join(root, 'npm-cli.js'));
  for (const [manager, entry] of [['pnpm', 'pnpm.cjs'], ['yarn', 'yarn.js'], ['corepack', 'corepack.js']]) {
    writeFileSync(join(root, entry), '// CLI');
    assert.equal(nodeShimEntry(shim, `"%dp0%/${entry}"`, manager), join(root, entry));
  }
  assert.equal(nodeShimEntry(shim, '"%~dp0\\missing-npm-cli.js"', 'npm'), null);
  assert.equal(nodeShimEntry(shim, '"%~dp0\\other.js"', 'npm'), null);
  assert.equal(nodeShimEntry(shim, 'no Node entry', 'npm'), null);
  assert.equal(nodeShimEntry(join(root, 'missing/npm.cmd'), '"%~dp0\\npm-cli.js"', 'npm'), null);
});

test('manager resolution preserves argument arrays for shebang, JS alias and binary entries', t => {
  const { root, environment } = binaries(t);
  const args = ['install', '@scope/library@file:vendor/a & b.tgz'];
  const npm = join(root, 'npm');
  writeFileSync(npm, '#!/usr/bin/env node\n');
  assert.deepEqual(managerInvocation('npm', args, environment), { command: environment.execPath, args: [npm, ...args] });
  const yarnScript = join(root, 'yarn.cjs'); writeFileSync(yarnScript, '// JS without shebang');
  symlinkSync(yarnScript, join(root, 'yarn'));
  assert.deepEqual(managerInvocation('yarn', args, environment), { command: environment.execPath, args: [yarnScript, ...args] });
  writeFileSync(join(root, 'bun'), 'native executable fixture');
  assert.deepEqual(managerInvocation('bun', args, environment), { command: join(root, 'bun'), args });
});

test('Windows manager search handles native exe, cmd shims and malformed shim fallback', t => {
  const { root, environment } = binaries(t);
  const first = join(root, 'first'), second = join(root, 'second'); mkdirSync(first); mkdirSync(second);
  const windows = { ...environment, platform: 'win32', env: { Path: `${first};${second}` } };
  writeFileSync(join(first, 'bun.exe'), 'binary');
  assert.equal(managerInvocation('bun', ['--version'], windows).command, join(first, 'bun.exe'));
  writeFileSync(join(first, 'npm.cmd'), 'no manager JS entry');
  writeFileSync(join(second, 'npm.cmd'), '"%~dp0\\npm-cli.js"');
  writeFileSync(join(second, 'npm-cli.js'), '// CLI');
  assert.deepEqual(managerInvocation('npm', ['--version'], windows).args, [join(second, 'npm-cli.js'), '--version']);
});

test('Corepack is used for pnpm/yarn only, and missing or unknown managers fail explicitly', t => {
  const { root, environment } = binaries(t);
  writeFileSync(join(root, 'corepack'), '#!/usr/bin/env node\n');
  for (const manager of ['pnpm', 'yarn']) {
    assert.deepEqual(managerInvocation(manager, ['--version'], environment), { command: environment.execPath, args: [join(root, 'corepack'), manager, '--version'] });
  }
  assert.throws(() => managerInvocation('bun', [], environment), { code: 'MANAGER_UNAVAILABLE' });
  assert.throws(() => managerInvocation('unsupported', [], environment), { code: 'AMBIGUOUS_MANAGER' });
  assert.throws(() => managerInvocation('npm', [], { ...environment, env: {} }), { code: 'MANAGER_UNAVAILABLE' });
  rmSync(join(root, 'corepack'));
  assert.throws(() => managerInvocation('pnpm', [], environment), { code: 'MANAGER_UNAVAILABLE' });
});

test('manager receipts never enable a shell and keep bounded success/failure diagnostics', () => {
  const invoke = (manager, args) => ({ command: '/fixture/node', args: [manager, ...args] });
  let settings;
  const receipt = runManager({ manager: 'npm', root: '/fixture/project' }, ['--version'], { invoke, spawn: (_command, _args, options) => { settings = options; return { status: 0, stdout: 'a'.repeat(3000) }; } });
  assert.equal(settings.shell, false);
  assert.equal(settings.env.COREPACK_ENABLE_DOWNLOAD_PROMPT, '0');
  assert.equal(receipt.stdout.length, 2000);
  assert.equal(receipt.exitCode, 0);
  assert.equal(runManager({ manager: 'npm', root: '/fixture/project' }, [], { invoke, spawn: () => ({ status: 0 }) }).stdout, undefined);
  for (const result of [
    { status: 2, stdout: 'a'.repeat(7000), stderr: 'b'.repeat(7000) },
    { status: null, stdout: null, stderr: null, error: new Error('spawn failed') },
  ]) {
    assert.throws(() => runManager({ manager: 'npm', root: '/fixture/project' }, [], { invoke, spawn: () => result }), error => {
      assert.equal(error.code, 'PACKAGE_MANAGER_FAILED');
      if (result.error) assert.match(error.message, /spawn failed/);
      else { assert.equal(error.details.stdout.length, 6000); assert.equal(error.details.stderr.length, 6000); }
      return true;
    });
  }
});

test('default manager discovery and execution produce a real npm version receipt', () => {
  const result = runManager({ manager: 'npm', root: process.cwd() }, ['--version']);
  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /^\d+\.\d+\.\d+/);
});
