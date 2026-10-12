import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { generateStories } from '../apps/storybook/scripts/gen-stories.mjs';

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'Linda stories & á '));
  function write(file, value) {
    const target = join(root, file);
    mkdirSync(join(target, '..'), { recursive: true });
    writeFileSync(target, value);
  }
  mkdirSync(join(root, 'apps/storybook/src/stories/nested'), { recursive: true });
  mkdirSync(join(root, 'packages/blocks/src'), { recursive: true });
  const output = 'apps/storybook/src/stories/generated/';
  return { root, write, output, options: { repoRoot: root, log() {}, error() {} }, cleanup: () => rmSync(root, { recursive: true, force: true }) };
}

test('story generator writes deterministic compositions and preserves handwritten stories', () => {
  const f = fixture();
  try {
    const ui = ['kbd', 'combobox', 'accordion', 'radio-group', 'surface', 'button', 'manual-demo', 'use-theme', 'date', 'compat-button'];
    f.write('packages/ui/package.json', JSON.stringify({ exports: Object.fromEntries(['.', ...ui.map(name => './' + name)].map(name => [name, {}])) }));
    f.write('packages/blocks/package.json', JSON.stringify({ exports: { './legacy-kpi-card': {}, './status-filters': {} } }));
    f.write('packages/ui/src/kbd.tsx', 'export const Kbd = null;');
    f.write('packages/ui/src/combobox.ts', 'const ComboBox = null; export { ComboBox };');
    f.write('packages/ui/src/surface.tsx', 'export function Surface() {}');
    f.write('packages/ui/src/accordion.tsx', 'export { Accordion, AccordionItem, AccordionHeading, AccordionTrigger, AccordionPanel };');
    f.write('packages/ui/src/radio-group.tsx', 'export const RadioGroup = null;');
    f.write('packages/blocks/src/legacy-kpi-card.tsx', 'export const KPICard = null;');
    f.write('packages/blocks/src/status-filters.tsx', 'export function StatusFilters() {}');
    f.write('apps/storybook/src/stories/nested/manual-demo.stories.tsx', 'manual retained');
    const logs = [];
    assert.equal(generateStories({ ...f.options, check: true, error: message => logs.push(message) }), 1);
    assert.ok(logs.some(message => message.includes('faltan:')));
    assert.equal(existsSync(join(f.root, f.output)), false);
    assert.equal(generateStories(f.options), 0);
    assert.equal(generateStories({ ...f.options, check: true }), 0);
    assert.match(readFileSync(join(f.root, f.output, 'radio-group.stories.tsx'), 'utf8'), /import \{ Radio \}/);
    assert.match(readFileSync(join(f.root, f.output, 'combobox.stories.tsx'), 'utf8'), /component: ComboBox/);
    assert.equal(readFileSync(join(f.root, 'apps/storybook/src/stories/nested/manual-demo.stories.tsx'), 'utf8'), 'manual retained');
    const expected = readFileSync(join(f.root, f.output, 'kbd.stories.tsx'), 'utf8');
    f.write(f.output + 'kbd.stories.tsx', 'stale');
    f.write(f.output + 'orphan.stories.tsx', 'orphan');
    rmSync(join(f.root, f.output, 'accordion.stories.tsx'));
    logs.length = 0;
    assert.equal(generateStories({ ...f.options, check: true, error: message => logs.push(message) }), 1);
    for (const label of ['faltan:', 'huérfanas:', 'desactualizadas:']) assert.ok(logs.some(message => message.includes(label)));
    assert.equal(generateStories(f.options), 0);
    assert.equal(readFileSync(join(f.root, f.output, 'kbd.stories.tsx'), 'utf8'), expected);
    assert.equal(existsSync(join(f.root, f.output, 'orphan.stories.tsx')), false);
  } finally { f.cleanup(); }
});

test('story generator rejects missing named exports before touching generated files', () => {
  const f = fixture();
  try {
    f.write('packages/ui/package.json', JSON.stringify({ exports: { './kbd': {}, './tabs': {} } }));
    f.write('packages/blocks/package.json', JSON.stringify({ exports: { './legacy-kpi-card': {} } }));
    f.write('packages/ui/src/kbd.tsx', 'export const Wrong = null;');
    f.write('packages/ui/src/tabs.tsx', 'export const Wrong = null;');
    f.write('packages/blocks/src/legacy-kpi-card.tsx', 'export const Wrong = null;');
    f.write(f.output + 'preserved.stories.tsx', 'existing inventory');
    const messages = [];
    assert.equal(generateStories({ ...f.options, error: message => messages.push(message) }), 1);
    assert.ok(messages.some(message => message.includes('NAME_OVERRIDE')));
    assert.ok(messages.some(message => message.includes('tabs: exports')));
    assert.ok(messages.some(message => message.includes('legacy-kpi-card: exports')));
    assert.equal(readFileSync(join(f.root, f.output, 'preserved.stories.tsx'), 'utf8'), 'existing inventory');
  } finally { f.cleanup(); }
});

test('missing packages and manifests without exports generate an empty inventory', () => {
  const f = fixture();
  try {
    assert.equal(generateStories(f.options), 0);
    f.write('packages/ui/package.json', '{}');
    assert.equal(generateStories({ ...f.options, check: true }), 0);
  } finally { f.cleanup(); }
});

test('new components require a real demo and preserve the last valid inventory', () => {
  const f = fixture();
  try {
    f.write('packages/ui/package.json', JSON.stringify({ exports: { './new-widget': {}, './constructor': {} } }));
    f.write(f.output + 'preserved.stories.tsx', 'valid inventory');
    const errors = [];
    assert.equal(generateStories({ ...f.options, error: message => errors.push(message) }), 1);
    assert.ok(errors.some(message => message.includes('new-widget: falta una composición real')));
    assert.equal(readFileSync(join(f.root, f.output, 'preserved.stories.tsx'), 'utf8'), 'valid inventory');
  } finally { f.cleanup(); }
});
