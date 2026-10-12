import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { genUnit } from './gen.mjs';

test('generator creates component/block sources, tests and per-entry exports in an isolated project', () => {
  const root = mkdtempSync(join(tmpdir(), 'linda-generator-'));
  try {
    for (const [kind, packageName] of [['component', 'ui'], ['block', 'blocks']]) {
      const pkg = join(root, 'packages', packageName);
      mkdirSync(join(pkg, 'src'), { recursive: true });
      writeFileSync(join(pkg, 'package.json'), JSON.stringify({ name: `@lindaui/${packageName}`, exports: { './package.json': './package.json' } }));
      genUnit(kind, 'new-item', { root });
      assert.match(readFileSync(join(pkg, 'src/new-item.tsx'), 'utf8'), /export function NewItem/);
      assert.match(readFileSync(join(pkg, 'src/new-item.test.tsx'), 'utf8'), /render\(<NewItem>contenido<\/NewItem>\)/);
      assert.equal(JSON.parse(readFileSync(join(pkg, 'package.json'), 'utf8')).exports['./new-item'].import, './dist/new-item.js');
      assert.throws(() => genUnit(kind, 'new-item', { root }), /Ya existe/);
      writeFileSync(join(pkg, 'src/test-only.test.tsx'), '// reserved test');
      assert.throws(() => genUnit(kind, 'test-only', { root }), /Ya existe/);
    }
    for (const kind of ['invalid', 'toString']) assert.throws(() => genUnit(kind, 'name', { root }), /Tipo inválido/);
    for (const name of ['Bad_Name', '', undefined, null]) assert.throws(() => genUnit('component', name, { root }), /Nombre inválido/);
    rmSync(join(root, 'packages/blocks/src'), { recursive: true });
    assert.throws(() => genUnit('block', 'valid-name', { root }), /No existe packages\/blocks\/src/);
    // A default-root validation failure must abort before writing anything.
    assert.throws(() => genUnit('component', 'Bad_Name'), /Nombre inválido/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
