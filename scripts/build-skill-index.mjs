import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { recipe, recipeEntries } from '../skills/lindaui/scripts/lib/generate.mjs';
const root = fileURLToPath(new URL('..', import.meta.url));
const check = process.argv.includes('--check');
const packages = ['tokens', 'ui', 'blocks'].map(name => {
  const directory = join(root, 'packages', name);
  const manifest = JSON.parse(readFileSync(join(directory, 'package.json'), 'utf8'));
  return { name: manifest.name, version: manifest.version, peerDependencies: manifest.peerDependencies ?? {}, peerDependenciesMeta: manifest.peerDependenciesMeta ?? {}, entries: Object.keys(manifest.exports) };
});
const index = { schemaVersion: 1, source: 'Release manifests; always prefer consumer-installed declarations.', packages, recipes: recipeEntries };
const outputs = new Map([['assets/api-index.json', JSON.stringify(index, null, 2) + '\n']]);
for (const kind of Object.keys(recipeEntries)) {
  const name = { 'contact-form': 'ContactForm', 'searchable-list': 'SearchableList', 'confirmation-dialog': 'ConfirmationDialog', 'data-table': 'DataTable' }[kind];
  outputs.set(`assets/examples/${kind}.tsx`, recipe(kind, name, true));
}
for (const [relative, content] of outputs) {
  const path = join(root, 'skills/lindaui', relative);
  if (check) {
    if (!existsSync(path) || readFileSync(path, 'utf8') !== content) throw new Error(`Skill inventory/example drift: ${relative}; run pnpm skill:index.`);
  } else { mkdirSync(join(path, '..'), { recursive: true }); writeFileSync(path, content); }
}
