import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const root = fileURLToPath(new URL('../', import.meta.url));
function node(script, args = []) {
  return spawnSync(process.execPath, [script, ...args], { cwd: root, encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 });
}

test('skill validation checks references, licenses and release inventory without writing', () => {
  const result = node('scripts/validate-lindaui-skill.mjs');
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /structure, references, licenses, inventory and examples verified/);
});

test('exports CLI checks both public libraries against their actual sources', () => {
  const result = node('scripts/gen.mjs', ['exports', '--check']);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /packages\/ui/);
  assert.match(result.stdout, /packages\/blocks/);
});

test('Storybook CLI verifies generated inventory without replacing manual stories', () => {
  const result = node('apps/storybook/scripts/gen-stories.mjs', ['--check']);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /stories generadas en sync/);
});

for (const [args, message] of [
  [[], /Uso:/],
  [['unknown'], /Uso:/],
  [['component'], /Uso:/],
  [['block'], /Uso:/],
  [['component', 'Invalid_Name'], /Nombre inválido/],
  [['block', 'Invalid_Name'], /Nombre inválido/],
  [['component', 'button'], /Ya existe button/],
  [['block', 'login-form'], /Ya existe login-form/],
]) {
  test(`component generator rejects ${JSON.stringify(args)} without touching source`, () => {
    const result = node('scripts/gen.mjs', args);
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, message);
  });
}
