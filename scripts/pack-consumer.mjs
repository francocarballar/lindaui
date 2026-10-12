// Pack built libraries for a portable consumer checkout; never publishes.
import { mkdirSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { runManager } from "../skills/lindaui/scripts/lib/process.mjs";
import { tarballManifest } from "../skills/lindaui/scripts/lib/setup.mjs";
import { deriveNames, reconcileExports } from "./derive-exports.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
function verifyPackageExports(root) {
  for (const name of ["ui", "blocks"]) {
    const directory = resolve(root, "packages", name);
    const manifest = JSON.parse(readFileSync(resolve(directory, "package.json"), "utf8"));
    const result = reconcileExports(manifest.exports, deriveNames(resolve(directory, "src")));
    if (result.added.length || result.dropped.length || result.changed.length) {
      throw new Error(`Exports drift in ${manifest.name}; run pnpm gen:exports.`);
    }
  }
}

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
/** Pack current artifacts with replaceable process boundaries for fixture testing. */
export function packConsumer(destinationArg, {
  root = repositoryRoot, cwd = process.cwd(), manager = runManager,
  readPackedManifest = tarballManifest, log = console.log,
  verifyExports = verifyPackageExports,
} = {}) {
  if (typeof destinationArg !== "string" || !destinationArg || destinationArg.startsWith("--")) {
    throw new Error("Usage: pnpm pack:consumer --destination <consumer>/vendor (after build)");
  }
  const destination = resolve(cwd, destinationArg);
  const packages = ["tokens", "ui", "blocks"];
  verifyExports(root);
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
    const receipt = manager({ root: dir, manager: "pnpm" }, ["pack", "--pack-destination", destination]);
    log(receipt.stdout);
    const filename = `${manifest.name.replace(/^@/, "").replaceAll("/", "-")}-${manifest.version}.tgz`;
    const packed = readPackedManifest(resolve(destination, filename));
    for (const section of ["dependencies", "peerDependencies", "devDependencies"]) {
      for (const [dependency, version] of Object.entries(packed[section] ?? {})) {
        if (/^(workspace:|link:|file:)/.test(version)) {
          throw new Error(`${filename}: non-portable ${dependency} in ${section}: ${version}`);
        }
      }
    }
    log(`✓ Portable ${filename}`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.length !== 2 || args[0] !== "--destination") {
    throw new Error("Usage: pnpm pack:consumer --destination <consumer>/vendor (after build)");
  }
  packConsumer(args[1]);
}
