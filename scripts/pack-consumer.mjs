// Pack built libraries for a portable consumer checkout; never publishes.
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const destinationArg = args[args.indexOf("--destination") + 1];
if (!args.includes("--destination") || !destinationArg || destinationArg.startsWith("--")) {
  throw new Error("Usage: pnpm pack:consumer --destination <consumer>/vendor (after build)");
}
const destination = resolve(process.cwd(), destinationArg);
const packages = ["tokens", "ui", "blocks"];

execFileSync("node", [resolve(root, "scripts/gen.mjs"), "exports", "--check"], {
  cwd: root,
  stdio: "inherit",
});

function outputPaths(value) {
  return typeof value === "string" ? [value] : Object.values(value).flatMap(outputPaths);
}

function sourceTimes(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const location = resolve(dir, entry.name);
    if (entry.isDirectory()) return sourceTimes(location);
    if (!/\.(tsx?|css)$/.test(entry.name) || /\.(test|stories)\.|test-setup/.test(entry.name)) return [];
    return [statSync(location).mtimeMs];
  });
}
const sourceFreshness = Object.fromEntries(packages.map((name) => [
  name, Math.max(...sourceTimes(resolve(root, "packages", name, "src"))),
]));

// Refuse to pack missing/stale output while another owner is still editing.
for (const name of packages) {
  const dir = resolve(root, "packages", name);
  const manifest = JSON.parse(readFileSync(resolve(dir, "package.json"), "utf8"));
  const newestSource = name === "tokens"
    ? Math.max(...Object.values(sourceFreshness))
    : sourceFreshness[name];
  for (const target of Object.values(manifest.exports).flatMap(outputPaths)) {
    const artifact = resolve(dir, target);
    const stat = statSync(artifact);
    if (target.startsWith("./dist/") && stat.mtimeMs < newestSource) {
      throw new Error(`${manifest.name}: ${target} is stale; build after feature owners finish`);
    }
  }
}

mkdirSync(destination, { recursive: true });
for (const name of packages) {
  const dir = resolve(root, "packages", name);
  const manifest = JSON.parse(readFileSync(resolve(dir, "package.json"), "utf8"));
  execFileSync("pnpm", ["pack", "--pack-destination", destination], { cwd: dir, stdio: "inherit" });
  const filename = `${manifest.name.replace(/^@/, "").replaceAll("/", "-")}-${manifest.version}.tgz`;
  const packed = JSON.parse(execFileSync("tar", ["-xOf", resolve(destination, filename), "package/package.json"], {
    encoding: "utf8",
  }));
  for (const section of ["dependencies", "peerDependencies", "devDependencies"]) {
    for (const [dependency, version] of Object.entries(packed[section] ?? {})) {
      if (/^(workspace:|link:|file:)/.test(version)) {
        throw new Error(`${filename}: non-portable ${dependency} in ${section}: ${version}`);
      }
    }
  }
  console.log(`✓ Portable ${filename}`);
}
