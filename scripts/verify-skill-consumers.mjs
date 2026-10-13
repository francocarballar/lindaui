// Real npm consumers of packed/public artifacts. Keeps fixtures and receipts for
// inspection; never links the contributor node_modules or copies library source.
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { runManager } from '../skills/lindaui/scripts/lib/process.mjs';

const usage = 'Choose --tarballs <directory> or --published; optional --json.';

/** Validate real consumers while allowing process boundaries to be fixture-tested. */
export function verifyConsumers({ tarballs, published = false, manager = runManager,
  spawn = spawnSync, log = console.log, errorLog = console.error,
  createRoot = () => mkdtempSync(join(tmpdir(), 'LindaUI real consumers spaces & á-')),
}) {
  if ((!tarballs && !published) || (tarballs && published)) throw new Error(usage);
  const root = createRoot();
  const expectedVersions = Object.fromEntries(['ui', 'blocks', 'tokens'].map(name => {
    const manifest = JSON.parse(readFileSync(new URL(`../packages/${name}/package.json`, import.meta.url), 'utf8'));
    return [manifest.name, manifest.version];
  }));
  const cli = fileURLToPath(new URL('../skills/lindaui/scripts/lindaui.mjs', import.meta.url));
  const report = { schemaVersion: 1, platform: process.platform, node: process.version, artifacts: tarballs ? resolve(tarballs) : 'public npm latest', expectedVersions, fixtures: [] };
  const save = () => writeFileSync(join(root, 'verification.json'), JSON.stringify(report, null, 2) + '\n');
  function file(app, path, content) {
    mkdirSync(join(app, path, '..'), { recursive: true });
    writeFileSync(join(app, path), typeof content === 'string' ? content : JSON.stringify(content, null, 2) + '\n');
  }
  function invoke(app, record, command, extras = []) {
    const result = spawn(process.execPath, [cli, command, '--project', app, ...extras, '--json'], { encoding: 'utf8', timeout: 300000, maxBuffer: 8 * 1024 * 1024 });
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
  import { Button } from "@lindaui/ui/button";
  ${Object.values(recipes).map(name => `import { ${name} } from "./components/${name}";`).join('\n')}
  export default function Demo() {
    const [open, setOpen] = useState(false);
    return <main style={{ padding: "1rem" }}><ContactForm onSubmit={async () => {}} /><SearchableList items={[{ id: "1", label: "Ada" }]} /><DataTable rows={[{ id: "1", name: "Ada", email: "ada@example.com" }]} /><Button onPress={() => setOpen(true)}>Open</Button><ConfirmationDialog open={open} onClose={() => setOpen(false)} onConfirm={async () => {}} /></main>;
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
        // create-next-app includes these references before the first build. They
        // provide Next's CSS side-effect and image types to standalone tsc.
        file(app, 'next-env.d.ts', '/// <reference types="next" />\n/// <reference types="next/image-types/global" />\n');
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
      record.receipts.push({ install: manager({ manager: 'npm', root: app }, ['install', '--no-audit', '--no-fund']) }); save();
      invoke(app, record, 'setup', ['--packages', 'ui,blocks', '--entry', entry, ...(tarballs ? ['--tarballs', resolve(tarballs), '--offline'] : []), '--apply']);
      record.installedVersions = {};
      for (const [name, version] of Object.entries(expectedVersions)) {
        const installed = JSON.parse(readFileSync(join(app, 'node_modules', name, 'package.json'), 'utf8'));
        record.installedVersions[name] = installed.version; save();
        if (installed.name !== name || installed.version !== version) throw new Error(`${name}: expected ${version}, installed ${installed.name}@${installed.version}; refusing stale consumer evidence.`);
      }
      invoke(app, record, 'api', ['--list']);
      invoke(app, record, 'activate', ['--apply']);
      invoke(app, record, 'theme', ['--entry', entry, '--primary', '#2563eb', '--primary-dark', '#60a5fa', '--apply']);
      for (const [recipe, name] of Object.entries(recipes)) invoke(app, record, 'scaffold', [recipe, '--language', ts ? 'ts' : 'js', '--out', `src/components/${name}.${ext}`, '--apply']);
      invoke(app, record, 'check', ts ? ['--typecheck'] : []);
      record.receipts.push({ build: manager({ manager: 'npm', root: app }, ['run', 'build']) });
      invoke(app, record, 'doctor');
      record.status = 'passed'; save(); log(`✓ ${kind}: installed, generated, checked and built`);
    } catch (error) {
      record.status = 'failed'; record.error = { message: error.message, details: error.details }; save();
      errorLog(`Fixture failed: ${app}\n${error.message}\n${JSON.stringify(error.details ?? {})}`); break;
    }
  }
  log(`Consumer verification artifacts: ${root}`);
  return { ...report, root, receiptPath: join(root, 'verification.json') };
}

export function consumerCLI(args, options = {}) {
  const json = args.includes('--json');
  const flags = args.filter(arg => arg !== '--json');
  if (flags.length === 1 && flags[0] === '--help') {
    console.log(usage);
    return 0;
  }
  let source;
  if (flags.length === 1 && flags[0] === '--published') source = { published: true };
  else if (flags.length === 2 && flags[0] === '--tarballs' && flags[1] && !flags[1].startsWith('--')) source = { tarballs: flags[1] };
  else throw new Error(usage);
  const result = verifyConsumers({ ...options, ...source, ...(json ? { log: () => {}, errorLog: () => {} } : {}) });
  if (json) console.log(JSON.stringify(result, null, 2));
  return result.fixtures.some(fixture => fixture.status === 'failed') ? 1 : 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { process.exitCode = consumerCLI(process.argv.slice(2)); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
