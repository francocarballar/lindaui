// Real npm consumers of packed/public artifacts. Keeps fixtures and receipts for
// inspection; never links the contributor node_modules or copies library source.
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { runManager } from '../skills/lindaui/scripts/lib/process.mjs';

const args = process.argv.slice(2);
const option = name => args.includes(name) ? args[args.indexOf(name) + 1] : null;
const tarballs = option('--tarballs');
const published = args.includes('--published');
if ((!tarballs && !published) || (tarballs && published)) throw new Error('Choose --tarballs <directory> or --published.');
const root = mkdtempSync(join(tmpdir(), 'LindaUI real consumers spaces & á-'));
const cli = fileURLToPath(new URL('../skills/lindaui/scripts/lindaui.mjs', import.meta.url));
const report = { schemaVersion: 1, platform: process.platform, node: process.version, artifacts: tarballs ? resolve(tarballs) : 'public npm latest', fixtures: [] };
const save = () => writeFileSync(join(root, 'verification.json'), JSON.stringify(report, null, 2) + '\n');
function file(app, path, content) {
  mkdirSync(join(app, path, '..'), { recursive: true });
  writeFileSync(join(app, path), typeof content === 'string' ? content : JSON.stringify(content, null, 2) + '\n');
}
function invoke(app, record, command, extras = []) {
  const result = spawnSync(process.execPath, [cli, command, '--project', app, ...extras, '--json'], { encoding: 'utf8', timeout: 300000, maxBuffer: 8 * 1024 * 1024 });
  const data = JSON.parse(result.stdout || '{}');
  record.receipts.push({ command, ...data }); save();
  if (result.error || result.status !== 0) throw new Error(`${command} failed: ${result.error?.message ?? result.stdout + result.stderr}`);
  return data;
}
const recipes = { 'contact-form': 'ContactForm', 'searchable-list': 'SearchableList', 'confirmation-dialog': 'ConfirmationDialog', 'data-table': 'DataTable' };
for (const kind of ['vite-ts', 'vite-js', 'next-app', 'next-pages']) {
  const app = join(root, kind); mkdirSync(app);
  const next = kind.startsWith('next'); const ts = kind !== 'vite-js';
  const record = { kind, project: app, receipts: [], status: 'running' }; report.fixtures.push(record); save();
  try {
    file(app, 'package.json', {
      name: `lindaui-skill-${kind}`, private: true, type: 'module', packageManager: 'npm@11.11.1',
      scripts: { build: next ? 'next build' : 'vite build', ...(ts ? { typecheck: 'tsc --noEmit' } : {}) },
      dependencies: { react: '19.3.0', 'react-dom': '19.3.0', 'react-hook-form': '7.89.0', 'lucide-react': '1.55.0', recharts: '3.10.1', ...(next ? { next: '16.4.0' } : {}) },
      devDependencies: { ...(ts ? { typescript: '6.0.3', '@types/react': '19.3.0', '@types/react-dom': '19.3.0', '@types/node': '26.6.5' } : {}), ...(!next ? { vite: '8.3.4', '@vitejs/plugin-react': '6.1.2' } : {}) }
    });
    if (ts) file(app, 'tsconfig.json', { compilerOptions: { target: 'ES2022', lib: ['DOM', 'DOM.Iterable', 'ES2022'], module: 'ESNext', moduleResolution: 'bundler', jsx: 'react-jsx', strict: true, noEmit: true, skipLibCheck: true, noUnusedLocals: true, noUnusedParameters: true, noUncheckedSideEffectImports: true, esModuleInterop: true, ...(next ? { plugins: [{ name: 'next' }] } : {}) }, include: ['**/*.ts', '**/*.tsx'], exclude: ['node_modules'] });
    const ext = ts ? 'tsx' : 'jsx';
    const demo = `"use client";
import { useState } from "react";
${Object.values(recipes).map(name => `import { ${name} } from "./components/${name}";`).join('\n')}
export default function Demo() {
  const [open, setOpen] = useState(false);
  return <main style={{ padding: "1rem" }}><ContactForm onSubmit={async () => {}} /><SearchableList items={[{ id: "1", label: "Ada" }]} /><DataTable rows={[{ id: "1", name: "Ada", email: "ada@example.com" }]} /><button onClick={() => setOpen(true)}>Open</button><ConfirmationDialog open={open} onClose={() => setOpen(false)} onConfirm={async () => {}} /></main>;
}
`;
    file(app, `src/Demo.${ext}`, demo);
    let entry;
    if (!next) {
      if (ts) file(app, 'src/vite-env.d.ts', '/// <reference types="vite/client" />\n');
      file(app, 'index.html', `<div id="root"></div><script type="module" src="/src/main.${ext}"></script>`);
      file(app, 'vite.config.mjs', 'import { defineConfig } from "vite"; import react from "@vitejs/plugin-react"; export default defineConfig({ plugins: [react()] });\n');
      entry = `src/main.${ext}`;
      file(app, entry, 'import { createRoot } from "react-dom/client"; import Demo from "./Demo"; createRoot(document.getElementById("root")' + (ts ? '!' : '') + ').render(<Demo />);\n');
    } else {
      file(app, 'next.config.mjs', 'export default { env: { NEXT_TELEMETRY_DISABLED: "1" }, experimental: { cpus: 2 } };\n');
      if (kind === 'next-app') {
        entry = 'src/app/layout.tsx';
        file(app, entry, 'import type { ReactNode } from "react"; export default function Layout({ children }: { children: ReactNode }) { return <html lang="en"><body>{children}</body></html>; }\n');
        file(app, 'src/app/page.tsx', 'import Demo from "../Demo"; export default function Page() { return <Demo />; }\n');
      } else {
        entry = 'src/pages/_app.tsx';
        file(app, entry, 'import type { AppProps } from "next/app"; export default function App({ Component, pageProps }: AppProps) { return <Component {...pageProps} />; }\n');
        file(app, 'src/pages/index.tsx', 'export { default } from "../Demo";\n');
      }
    }
    record.receipts.push({ install: runManager({ manager: 'npm', root: app }, ['install', '--no-audit', '--no-fund']) }); save();
    invoke(app, record, 'setup', ['--packages', 'ui,blocks', '--entry', entry, ...(tarballs ? ['--tarballs', resolve(tarballs), '--offline'] : []), '--apply']);
    invoke(app, record, 'api', ['--list']);
    invoke(app, record, 'activate', ['--apply']);
    invoke(app, record, 'theme', ['--entry', entry, '--primary', '#2563eb', '--primary-dark', '#60a5fa', '--apply']);
    for (const [recipe, name] of Object.entries(recipes)) invoke(app, record, 'scaffold', [recipe, '--language', ts ? 'ts' : 'js', '--out', `src/components/${name}.${ext}`, '--apply']);
    invoke(app, record, 'check', ts ? ['--typecheck'] : []);
    record.receipts.push({ build: runManager({ manager: 'npm', root: app }, ['run', 'build']) });
    invoke(app, record, 'doctor');
    record.status = 'passed'; save(); console.log(`✓ ${kind}: installed, generated, checked and built`);
  } catch (error) {
    record.status = 'failed'; record.error = { message: error.message, details: error.details }; save();
    console.error(`Fixture failed: ${app}\n${error.message}\n${JSON.stringify(error.details ?? {})}`); process.exitCode = 1; break;
  }
}
console.log(`Consumer verification artifacts: ${root}`);
