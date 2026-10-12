import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSkillIndex } from './build-skill-index.mjs';

test('inventory uses release manifests, preserves peers and generates executable recipes', () => {
  const root = mkdtempSync(join(tmpdir(), 'linda-skill-index-'));
  try {
    for (const name of ['tokens', 'ui', 'blocks']) {
      const directory = join(root, 'packages', name);
      mkdirSync(directory, { recursive: true });
      writeFileSync(join(directory, 'package.json'), JSON.stringify({ name: `@lindaui/${name}`, version: '1.2.3', exports: { './button': {} }, ...(name === 'ui' ? { peerDependencies: { react: '>=19' }, peerDependenciesMeta: { react: { optional: true } } } : {}) }));
    }
    buildSkillIndex({ root });
    const inventory = JSON.parse(readFileSync(join(root, 'skills/lindaui/assets/api-index.json'), 'utf8'));
    assert.equal(inventory.schemaVersion, 1);
    assert.deepEqual(inventory.packages[0].peerDependencies, {});
    assert.deepEqual(inventory.packages[0].peerDependenciesMeta, {});
    assert.deepEqual(inventory.packages[1].peerDependencies, { react: '>=19' });
    assert.deepEqual(inventory.packages[1].peerDependenciesMeta, { react: { optional: true } });
    assert.deepEqual(inventory.packages[1].entries, ['./button']);
    assert.match(readFileSync(join(root, 'skills/lindaui/assets/examples/contact-form.tsx'), 'utf8'), /export function ContactForm/);
    buildSkillIndex({ root, check: true });
    writeFileSync(join(root, 'skills/lindaui/assets/api-index.json'), '{}');
    assert.throws(() => buildSkillIndex({ root, check: true }), /inventory\/example drift/);
    rmSync(join(root, 'skills/lindaui/assets/api-index.json'));
    assert.throws(() => buildSkillIndex({ root, check: true }), /inventory\/example drift/);
    buildSkillIndex({ root });
    assert.doesNotThrow(() => buildSkillIndex({ root, check: true }));
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('repository inventory remains current and CLI check is read-only', () => {
  buildSkillIndex({ check: true });
  const result = spawnSync(process.execPath, [new URL('./build-skill-index.mjs', import.meta.url).pathname, '--check'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
});
