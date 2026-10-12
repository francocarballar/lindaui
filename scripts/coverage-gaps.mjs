import { readFile } from "node:fs/promises";
import { resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const metrics = ["lines", "statements", "functions", "branches"];

/** Read V8/Istanbul evidence without treating absent reports as full coverage. */
export async function coverageGaps(reportDirectories, cwd = root) {
  if (!reportDirectories.length) throw new Error("At least one coverage report is required");
  const reports = [];
  for (const directory of reportDirectories) {
    const report = resolve(cwd, directory);
    const [summary, coverage] = await Promise.all([
      readFile(resolve(report, "coverage-summary.json"), "utf8").then(JSON.parse),
      readFile(resolve(report, "coverage-final.json"), "utf8").then(JSON.parse),
    ]);
    if (!summary.total || !Object.keys(coverage).length) throw new Error(`Empty coverage report: ${directory}`);
    for (const metric of metrics) {
      const value = summary.total[metric];
      if (!value || !Number.isFinite(value.total) || !Number.isFinite(value.covered) || value.covered > value.total || value.covered < 0) {
        throw new Error(`Invalid ${metric} summary: ${directory}`);
      }
    }
    const files = Object.entries(coverage).map(([path, entry]) => ({
      file: relative(cwd, path).replaceAll("\\", "/"),
      statements: Object.entries(entry.s).filter(([, count]) => count === 0).map(([id]) => entry.statementMap[id]),
      functions: Object.entries(entry.f).filter(([, count]) => count === 0).map(([id]) => ({ name: entry.fnMap[id].name, ...entry.fnMap[id].loc })),
      branches: Object.entries(entry.b).flatMap(([id, counts]) => counts.flatMap((count, index) => {
        if (count !== 0) return [];
        const branch = entry.branchMap[id];
        const location = branch.locations[index];
        // An implicit else has no range: report the enclosing condition instead.
        const range = location.start?.line === undefined ? branch.loc : location;
        return [{ type: branch.type, ...range }];
      })),
    })).filter((file) => file.statements.length || file.functions.length || file.branches.length).sort((a, b) => a.file.localeCompare(b.file));
    const complete = metrics.every((metric) => summary.total[metric].covered === summary.total[metric].total) && files.length === 0;
    reports.push({ directory, complete, totals: summary.total, files });
  }
  return { schemaVersion: 1, complete: reports.every((report) => report.complete), reports };
}

/** The CLI returns its status so agents can consume it without exiting a host. */
export async function runCoverageCLI(args, defaults = ["packages/ui/coverage", "packages/blocks/coverage", "apps/verona/coverage", "coverage/tooling"]) {
  const directories = [];
  let json = false;
  let check = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--json") json = true;
    else if (args[i] === "--check") check = true;
    else if (args[i] === "--report" && args[i + 1] && !args[i + 1].startsWith("--")) directories.push(args[++i]);
    else throw new Error(`Unknown or incomplete option: ${args[i]}`);
  }
  const result = await coverageGaps(directories.length ? directories : defaults);
  if (json) console.log(JSON.stringify(result, null, 2));
  else for (const report of result.reports) {
    console.log(`${report.directory}: ${report.complete ? "100%" : "incomplete"}`);
    for (const file of report.files) {
      const lines = [...new Set([...file.statements, ...file.functions, ...file.branches].map((location) => location.start.line))].sort((a, b) => a - b);
      console.log(`  ${file.file}:${lines.join(",")} (${file.statements.length} statements, ${file.functions.length} functions, ${file.branches.length} branches)`);
    }
  }
  return check && !result.complete ? 1 : 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runCoverageCLI(process.argv.slice(2)).then((status) => { process.exitCode = status; }).catch((error) => {
    console.error(`Coverage evidence error: ${error.message}. Run pnpm test:coverage first.`);
    process.exitCode = 2;
  });
}
