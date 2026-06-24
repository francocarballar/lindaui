// Deriva el `exports` map de un paquete desde sus archivos fuente.
// Cada `src/<name>.{ts,tsx}` (excepto *.test.* y los IGNORE) es una entry
// `./<name>` con el shape dual { types, import } -> dist.
//
// Preserva el ORDEN curado existente (no re-ordena: las entries del map se
// agrupan a mano por dominio). Solo AGREGA al final las que faltan y DROPEA
// las huérfanas (entry sin archivo fuente), avisando.
//
// Modos:
//   node scripts/derive-exports.mjs [pkgDir]            -> reescribe package.json
//   node scripts/derive-exports.mjs [pkgDir] --check    -> exit 1 si hay drift (set, no orden)
//
// pkgDir por defecto: packages/ui. Reusable para packages/blocks.
// Idempotente: correr sobre un map ya sincronizado no cambia nada.

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");

// Archivos en src/ que NO son entries (helpers internos, setup de tests).
const IGNORE = new Set(["test-setup"]);

/** Nombres de componente derivados de los archivos fuente de un paquete. */
export function deriveNames(srcDir) {
  return readdirSync(srcDir)
    .filter((f) => /\.(ts|tsx)$/.test(f) && !/\.test\.(ts|tsx)$/.test(f))
    .map((f) => f.replace(/\.(ts|tsx)$/, ""))
    .filter((name) => !IGNORE.has(name))
    .sort();
}

/** entry value para un nombre. */
const entryFor = (name) => ({
  types: `./dist/${name}.d.ts`,
  import: `./dist/${name}.js`,
});

/**
 * Reordena exports: mantiene las existentes en su orden, agrega las nuevas
 * (sorted) al final, y dropea huérfanas. Devuelve { exports, added, dropped }.
 */
export function reconcileExports(existing, derivedNames) {
  const derivedSet = new Set(derivedNames);
  const existingKeys = Object.keys(existing).map((k) => k.replace(/^\.\//, ""));
  const existingSet = new Set(existingKeys);

  const kept = existingKeys.filter((n) => derivedSet.has(n));
  const added = derivedNames.filter((n) => !existingSet.has(n));
  const dropped = existingKeys.filter((n) => !derivedSet.has(n));

  const exports = {};
  for (const name of [...kept, ...added]) exports[`./${name}`] = entryFor(name);
  return { exports, added, dropped };
}

/**
 * Reescribe SOLO el bloque `"exports": { ... }` dentro del texto crudo del
 * package.json, dejando el resto del archivo byte-a-byte (cero diff colateral).
 * Las entries van a 4 espacios, una por línea, estilo del repo.
 */
function spliceExportsBlock(raw, exports) {
  const eol = raw.includes("\r\n") ? "\r\n" : "\n";
  const lines = raw.split(/\r?\n/);
  const startIdx = lines.findIndex((l) => /^\s*"exports":\s*\{/.test(l));
  if (startIdx === -1) throw new Error("No se encontró el bloque \"exports\" en package.json");
  let endIdx = -1;
  for (let i = startIdx + 1; i < lines.length; i++) {
    if (/^\s{2}\},?$/.test(lines[i])) { endIdx = i; break; }
  }
  if (endIdx === -1) throw new Error("No se encontró el cierre del bloque \"exports\"");

  const keys = Object.keys(exports);
  const entryLines = keys.map((k, i) => {
    const v = exports[k];
    const comma = i < keys.length - 1 ? "," : "";
    return `    "${k}": { "types": "${v.types}", "import": "${v.import}" }${comma}`;
  });

  return [
    ...lines.slice(0, startIdx + 1),
    ...entryLines,
    ...lines.slice(endIdx),
  ].join(eol);
}

function main() {
  const args = process.argv.slice(2);
  const check = args.includes("--check");
  const pkgArg = args.find((a) => !a.startsWith("--"));
  const pkgDir = resolve(repoRoot, pkgArg ?? "packages/ui");
  const pkgPath = resolve(pkgDir, "package.json");
  const srcDir = resolve(pkgDir, "src");

  const raw = readFileSync(pkgPath, "utf8");
  const pkg = JSON.parse(raw);
  const derived = deriveNames(srcDir);
  const { exports, added, dropped } = reconcileExports(pkg.exports ?? {}, derived);

  if (check) {
    if (added.length || dropped.length) {
      console.error(`✗ exports drift en ${pkgArg ?? "packages/ui"}:`);
      if (added.length) console.error(`  faltan (en src, no en exports): ${added.join(", ")}`);
      if (dropped.length) console.error(`  huérfanas (en exports, no en src): ${dropped.join(", ")}`);
      console.error(`  Corré: pnpm gen:exports`);
      process.exit(1);
    }
    console.log(`✓ exports sincronizado (${derived.length} entries) en ${pkgArg ?? "packages/ui"}`);
    return;
  }

  const out = spliceExportsBlock(raw, exports);
  writeFileSync(pkgPath, out, "utf8");

  const parts = [`${Object.keys(exports).length} entries`];
  if (added.length) parts.push(`+${added.length} (${added.join(", ")})`);
  if (dropped.length) parts.push(`-${dropped.length} huérfanas (${dropped.join(", ")})`);
  console.log(`✓ exports derivado en ${pkgArg ?? "packages/ui"}: ${parts.join(", ")}`);
}

// Solo correr si se invoca directo (permite importar las funciones puras).
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("derive-exports.mjs")) {
  main();
}
