import { build } from 'esbuild';
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const path = 'skills/lindaui/scripts/lib/vendor.mjs';
const result = await build({ stdin: { contents: 'export { parse } from "@babel/parser"; export { default as semver } from "semver";', resolveDir: process.cwd() }, outfile: path, write: false, bundle: true, platform: 'node', target: 'node20', format: 'esm', minify: true, legalComments: 'inline' });
const licenses = ['@babel/parser', 'semver'].map(name => {
  const root = require.resolve(`${name}/package.json`).replace(/package\.json$/, '');
  const manifest = JSON.parse(readFileSync(root + 'package.json', 'utf8'));
  return `${name}@${manifest.version}\n${readFileSync(root + 'LICENSE', 'utf8')}`;
});
const licensePath = 'skills/lindaui/scripts/lib/THIRD_PARTY_LICENSES.txt';
if (process.argv.includes('--check')) {
  if (!readFileSync(path).equals(Buffer.from(result.outputFiles[0].contents)) || readFileSync(licensePath, 'utf8') !== licenses.join('\n\n')) throw new Error('Skill vendor/license drift; run pnpm skill:vendor.');
  console.log('Skill vendor and licenses match the pinned dependencies.');
} else {
  writeFileSync(path, result.outputFiles[0].contents);
  writeFileSync(licensePath, licenses.join('\n\n'));
}
