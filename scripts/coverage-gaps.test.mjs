import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import assert from "node:assert/strict";
import { coverageGaps } from "./coverage-gaps.mjs";

test("missing evidence and empty reports cannot pass the coverage gate", async () => {
  const root = await mkdtemp(join(tmpdir(), "linda-coverage-"));
  try {
    await assert.rejects(coverageGaps([], root), /At least one/);
    await assert.rejects(coverageGaps(["coverage"], root), /ENOENT/);
    await mkdir(join(root, "coverage"));
    await writeFile(join(root, "coverage/coverage-summary.json"), JSON.stringify({ total: {} }));
    await writeFile(join(root, "coverage/coverage-final.json"), "{}");
    await assert.rejects(coverageGaps(["coverage"], root), /Empty coverage/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("reports uncovered branches even when every line was executed", async () => {
  const root = await mkdtemp(join(tmpdir(), "linda-coverage-"));
  try {
    await mkdir(join(root, "coverage"));
    const totals = Object.fromEntries(["lines", "statements", "functions", "branches"].map((metric) => [metric, { total: 1, covered: metric === "branches" ? 0 : 1, pct: metric === "branches" ? 0 : 100 }]));
    const location = { start: { line: 7, column: 2 }, end: { line: 7, column: 15 } };
    const entry = { s: { 0: 1 }, f: { 0: 1 }, b: { 0: [0] }, statementMap: { 0: location }, fnMap: { 0: { name: "render", loc: location } }, branchMap: { 0: { type: "if", loc: location, locations: [{ start: {}, end: {} }] } } };
    await writeFile(join(root, "coverage/coverage-summary.json"), JSON.stringify({ total: totals }));
    await writeFile(join(root, "coverage/coverage-final.json"), JSON.stringify({ [join(root, "src/component.tsx")]: entry }));
    const result = await coverageGaps(["coverage"], root);
    assert.equal(result.complete, false);
    assert.equal(result.reports[0].files[0].file, "src/component.tsx");
    assert.deepEqual(result.reports[0].files[0].branches, [{ type: "if", ...location }]);
    totals.branches.covered = 1;
    totals.branches.pct = 100;
    entry.b[0] = [1];
    await writeFile(join(root, "coverage/coverage-summary.json"), JSON.stringify({ total: totals }));
    await writeFile(join(root, "coverage/coverage-final.json"), JSON.stringify({ [join(root, "src/component.tsx")]: entry }));
    assert.equal((await coverageGaps(["coverage"], root)).complete, true);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("invalid numeric summaries cannot manufacture full coverage", async () => {
  const root = await mkdtemp(join(tmpdir(), "linda-coverage-invalid-"));
  try {
    await mkdir(join(root, "coverage"));
    await writeFile(join(root, "coverage/coverage-final.json"), JSON.stringify({ source: {} }));
    for (const value of [undefined, { total: null, covered: 0 }, { total: 1, covered: null }, { total: 1, covered: 2 }, { total: 1, covered: -1 }]) {
      await writeFile(join(root, "coverage/coverage-summary.json"), JSON.stringify({ total: { lines: value } }));
      await assert.rejects(coverageGaps(["coverage"], root), /Invalid lines summary/);
    }
    await writeFile(join(root, "coverage/coverage-summary.json"), '{}');
    await assert.rejects(coverageGaps(["coverage"], root), /Empty coverage/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("CLI emits machine-readable evidence and distinct failure statuses", async (t) => {
  const { runCoverageCLI } = await import('./coverage-gaps.mjs');
  const { spawnSync } = await import('node:child_process');
  const directory = await mkdtemp(join(tmpdir(), 'linda-coverage-cli-'));
  const location = { start: { line: 3, column: 0 }, end: { line: 3, column: 5 } };
  const totals = Object.fromEntries(['lines', 'statements', 'functions', 'branches'].map(metric => [metric, { total: 1, covered: 1, pct: 100 }]));
  const entry = { s: { 0: 0 }, f: { 0: 0 }, b: { 0: [0, 1] }, statementMap: { 0: location }, fnMap: { 0: { name: 'missing', loc: location } }, branchMap: { 0: { type: 'if', loc: location, locations: [location, location] } } };
  const logs = [];
  t.mock.method(console, 'log', (...args) => logs.push(args.join(' ')));
  const script = new URL('./coverage-gaps.mjs', import.meta.url);
  try {
    await writeFile(join(directory, 'coverage-summary.json'), JSON.stringify({ total: totals }));
    await writeFile(join(directory, 'coverage-final.json'), JSON.stringify({ [join(directory, 'source.ts')]: entry }));
    assert.equal(await runCoverageCLI(['--json', '--check'], [directory]), 1);
    assert.equal(JSON.parse(logs.pop()).complete, false);
    assert.equal(await runCoverageCLI(['--report', directory]), 0);
    assert.match(logs.pop(), /source.ts:3 \(1 statements, 1 functions, 1 branches\)/);
    assert.match(logs.pop(), /incomplete/);
    await assert.rejects(runCoverageCLI(['--report']), /Unknown or incomplete/);
    await assert.rejects(runCoverageCLI(['--unknown']), /Unknown or incomplete/);
    entry.s[0] = 1; entry.f[0] = 1; entry.b[0] = [1, 1];
    await writeFile(join(directory, 'coverage-final.json'), JSON.stringify({ [join(directory, 'source.ts')]: entry }));
    assert.equal(await runCoverageCLI(['--report', directory, '--check']), 0);
    assert.match(logs.pop(), /100%/);
    const success = spawnSync(process.execPath, [script.pathname, '--report', directory, '--check', '--json'], { encoding: 'utf8' });
    assert.equal(success.status, 0, success.stderr);
    assert.equal(JSON.parse(success.stdout).complete, true);
    const error = spawnSync(process.execPath, [script.pathname, '--report'], { encoding: 'utf8' });
    assert.equal(error.status, 2);
    assert.match(error.stderr, /Coverage evidence error/);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
