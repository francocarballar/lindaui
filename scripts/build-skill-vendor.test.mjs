import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSkillVendor } from './build-skill-vendor.mjs';

test('bundled parser/semver and licenses reject byte drift and regenerate deterministically', async () => {
  const outputRoot = await mkdtemp(join(tmpdir(), 'linda-vendor-'));
  const directory = join(outputRoot, 'skills/lindaui/scripts/lib');
  try {
    await mkdir(directory, { recursive: true });
    await buildSkillVendor({ outputRoot });
    const bundle = await readFile(join(directory, 'vendor.mjs'));
    const licenses = await readFile(join(directory, 'THIRD_PARTY_LICENSES.txt'), 'utf8');
    assert.match(licenses, /@babel\/parser@/);
    assert.match(licenses, /semver@/);
    await buildSkillVendor({ outputRoot, check: true });
    await writeFile(join(directory, 'vendor.mjs'), 'drift');
    await assert.rejects(buildSkillVendor({ outputRoot, check: true }), /vendor\/license drift/);
    await writeFile(join(directory, 'vendor.mjs'), bundle);
    await writeFile(join(directory, 'THIRD_PARTY_LICENSES.txt'), 'drift');
    await assert.rejects(buildSkillVendor({ outputRoot, check: true }), /vendor\/license drift/);
    await buildSkillVendor({ outputRoot });
    assert.deepEqual(await readFile(join(directory, 'vendor.mjs')), bundle);
    assert.equal(await readFile(join(directory, 'THIRD_PARTY_LICENSES.txt'), 'utf8'), licenses);
  } finally { await rm(outputRoot, { recursive: true, force: true }); }
});

test('repo CLI verifies the actual pinned dependency bundle', () => {
  const result = spawnSync(process.execPath, [new URL('./build-skill-vendor.mjs', import.meta.url).pathname, '--check'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /match the pinned dependencies/);
});
