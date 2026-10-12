import { build } from 'esbuild';
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));

/** Build pinned dependencies into a selected destination or verify byte drift. */
export async function buildSkillVendor({ outputRoot = repositoryRoot, check = false }) {
  const path = join(outputRoot, 'skills/lindaui/scripts/lib/vendor.mjs');
  const result = await build({ stdin: { contents: 'export { parse } from "@babel/parser"; export { default as semver } from "semver";', resolveDir: repositoryRoot }, outfile: path, write: false, bundle: true, platform: 'node', target: 'node20', format: 'esm', minify: true, legalComments: 'inline' });
  const licenses = ['@babel/parser', 'semver'].map(name => {
    const root = require.resolve(`${name}/package.json`).replace(/package\.json$/, '');
    const manifest = JSON.parse(readFileSync(root + 'package.json', 'utf8'));
    return `${name}@${manifest.version}\n${readFileSync(root + 'LICENSE', 'utf8')}`;
  });
  const licensePath = join(outputRoot, 'skills/lindaui/scripts/lib/THIRD_PARTY_LICENSES.txt');
  if (check) {
    if (!readFileSync(path).equals(Buffer.from(result.outputFiles[0].contents)) || readFileSync(licensePath, 'utf8') !== licenses.join('\n\n')) throw new Error('Skill vendor/license drift; run pnpm skill:vendor.');
    console.log('Skill vendor and licenses match the pinned dependencies.');
  } else {
    writeFileSync(path, result.outputFiles[0].contents);
    writeFileSync(licensePath, licenses.join('\n\n'));
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await buildSkillVendor({ check: process.argv.includes('--check') });
}
