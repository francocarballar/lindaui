import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const root = fileURLToPath(new URL('..', import.meta.url));
const skill = join(root, 'skills/lindaui'); const text = readFileSync(join(skill, 'SKILL.md'), 'utf8');
assert.match(text, /^---\r?\nname: lindaui\r?\n/);
assert.ok(text.split(/\r?\n/).length < 500);
assert.match(text, /description:/); assert.match(text, /version: "\d+\.\d+\.\d+"/);
for (const file of [join(skill, 'SKILL.md'), ...readdirSync(join(skill, 'references')).map(name => join(skill, 'references', name))]) {
  for (const match of readFileSync(file, 'utf8').matchAll(/\]\(([^)]+)\)/g)) {
    if (!/^https?:/.test(match[1])) assert.ok(existsSync(join(dirname(file), match[1])), `Broken reference: ${file} -> ${match[1]}`);
  }
}
for (const path of ['LICENSE', 'agents/openai.yaml', 'scripts/lib/vendor.mjs', 'scripts/lib/THIRD_PARTY_LICENSES.txt', 'assets/api-index.json']) assert.ok(existsSync(join(skill, path)), `Missing ${path}`);
const index = spawnSync(process.execPath, [join(root, 'scripts/build-skill-index.mjs'), '--check'], { encoding: 'utf8' });
assert.equal(index.status, 0, index.stderr);
console.log('LindaUI skill: structure, references, licenses, inventory and examples verified.');
