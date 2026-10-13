import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { managerInvocation } from '../skills/lindaui/scripts/lib/process.mjs';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const coverageTasks = [
  { name: 'libraries', args: ['exec', 'turbo', 'run', 'test:coverage', '--continue=always'] },
  { name: 'tooling', args: ['test:tooling:coverage'] },
];

// Preserve every suite's failure and still collect the remaining reports.
export async function runCoverage({ root = repoRoot, tasks = coverageTasks, invoke = managerInvocation, launch = spawn, now = () => new Date().toISOString() } = {}) {
  const report = { schemaVersion: 1, startedAt: now(), tasks: [] };
  for (const task of tasks) {
    const receipt = { name: task.name, args: task.args, startedAt: now() };
    try {
      const invocation = invoke('pnpm', task.args);
      const result = await new Promise((resolveResult, reject) => {
        const child = launch(invocation.command, invocation.args, { cwd: root, stdio: 'inherit', shell: false });
        child.once('error', reject);
        child.once('close', (exitCode, signal) => resolveResult({ exitCode, signal }));
      });
      Object.assign(receipt, result, { status: result.exitCode === 0 && result.signal === null ? 'passed' : 'failed' });
    } catch (error) {
      Object.assign(receipt, { status: 'failed', error: String(error.message) });
    }
    receipt.finishedAt = now();
    report.tasks.push(receipt);
  }
  report.finishedAt = now();
  report.status = report.tasks.every(task => task.status === 'passed') ? 'passed' : 'failed';
  const receiptPath = join(root, 'coverage', 'run.json');
  await mkdir(dirname(receiptPath), { recursive: true });
  await writeFile(receiptPath, JSON.stringify(report, null, 2) + '\n');
  return { ...report, receiptPath };
}

export async function coverageCLI(args = [], options) {
  if (args.length === 1 && args[0] === '--help') {
    console.log('Usage: pnpm test:coverage [--serial] [--help]\n--serial limits library task concurrency to one without changing thresholds or test timeouts. Runs every coverage suite and writes coverage/run.json. Exit: 0 passed, 1 suite failed, 2 runner error.');
    return 0;
  }
  if (args.length && !(args.length === 1 && args[0] === '--serial')) throw new Error(`Unknown coverage options: ${args.join(' ')}`);
  const configured = { ...options };
  if (args.includes('--serial')) configured.tasks = (configured.tasks ?? coverageTasks).map(task =>
    task.name === 'libraries' ? { ...task, args: [...task.args, '--concurrency=1'] } : task);
  const report = await runCoverage(configured);
  return report.status === 'passed' ? 0 : 1;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  coverageCLI(process.argv.slice(2)).then(code => { process.exitCode = code; }).catch(error => { console.error(error.message); process.exitCode = 2; });
}
