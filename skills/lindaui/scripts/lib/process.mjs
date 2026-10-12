import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { spawnSync } from 'node:child_process';
import { DXError } from './project.mjs';

// Resolve Node package-manager shims to their actual JS entry. Never invoke a
// shell: cmd.exe quoting of spaces, &, %, and scoped file: specs is fragile.
export function nodeShimEntry(shim, text, manager) {
  const matches = [...text.matchAll(/%~?dp0%?[\\/]([^"\r\n]+?\.(?:cjs|mjs|js))/gi)];
  // npm.cmd also references npm-prefix.js, a bootstrap helper which exits 0
  // without executing npm. Resolve the manager entry, never that helper.
  const names = new Set(manager === 'npm' ? ['npm-cli.js', 'npm.js'] : manager === 'pnpm' ? ['pnpm.cjs', 'pnpm.js'] : manager === 'yarn' ? ['yarn.js', 'yarn.cjs'] : ['corepack.js', 'corepack.cjs']);
  for (const match of matches) {
    const script = join(dirname(shim), ...match[1].split(/[\\/]/));
    if (names.has(basename(script).toLowerCase()) && existsSync(script)) return script;
  }
  return null;
}
function executable(name, { platform, env, execPath }) {
  const pathEnv = Object.entries(env).find(([key]) => key.toLowerCase() === 'path')?.[1] ?? '';
  const dirs = [...new Set([dirname(execPath), ...pathEnv.split(platform === 'win32' ? ';' : ':').filter(Boolean)])];
  const names = platform === 'win32' ? [name + '.exe', name + '.cmd', name] : [name];
  for (const dir of dirs) for (const filename of names) {
    const path = join(dir, filename); if (!existsSync(path)) continue;
    const actual = realpathSync(path);
    if (/\.exe$/i.test(actual)) return { command: actual, prefix: [] };
    const text = readFileSync(actual).subarray(0, 12000).toString();
    if (/\.cmd$/i.test(actual)) {
      const script = nodeShimEntry(actual, text, name);
      if (script) return { command: execPath, prefix: [script] };
      continue;
    }
    if (/^#![^\n]*\bnode\b/.test(text) || /\.(?:cjs|mjs|js)$/.test(actual)) return { command: execPath, prefix: [actual] };
    return { command: actual, prefix: [] };
  }
  return null;
}
export function managerInvocation(manager, args, { platform = process.platform, env = process.env, execPath = process.execPath } = {}) {
  const environment = { platform, env, execPath };
  if (!['npm', 'pnpm', 'yarn', 'bun'].includes(manager)) throw new DXError('AMBIGUOUS_MANAGER', 'Supported managers: npm, pnpm, yarn, bun.');
  let binary = executable(manager, environment);
  if (!binary && ['pnpm', 'yarn'].includes(manager)) {
    const corepack = executable('corepack', environment);
    if (corepack) binary = { ...corepack, prefix: [...corepack.prefix, manager] };
  }
  if (!binary) throw new DXError('MANAGER_UNAVAILABLE', `Install ${manager}, or Corepack for pnpm/yarn, before applying this plan.`);
  return { command: binary.command, args: [...binary.prefix, ...args] };
}
export function runManager(context, args, { invoke = managerInvocation, spawn = spawnSync } = {}) {
  const invocation = invoke(context.manager, args);
  const result = spawn(invocation.command, invocation.args, { cwd: context.root, encoding: 'utf8', shell: false, timeout: 300000, maxBuffer: 8 * 1024 * 1024, env: { ...process.env, COREPACK_ENABLE_DOWNLOAD_PROMPT: '0' } });
  if (result.error || result.status !== 0) throw new DXError('PACKAGE_MANAGER_FAILED', result.error?.message ?? `${context.manager} exited with ${result.status}.`, { stdout: result.stdout?.slice(-6000), stderr: result.stderr?.slice(-6000), exitCode: result.status });
  return { command: invocation.command, args: invocation.args, exitCode: result.status, stdout: result.stdout?.slice(-2000) };
}
