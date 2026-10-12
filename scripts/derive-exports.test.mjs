// Tests de las funciones puras del derivador de exports.
// Corre con el runner nativo: node --test scripts/
// (sin vitest a propósito: scripts/ no tiene package propio y node:test alcanza)

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";
import { join } from "node:path";
import { deriveNames, reconcileExports } from "./derive-exports.mjs";

const entry = (name) => ({
  types: `./dist/${name}.d.ts`,
  import: `./dist/${name}.js`,
  default: `./dist/${name}.js`,
});

test("deriva sólo entradas públicas, sin tests ni stories anidadas", () => {
  const dir = mkdtempSync(join(tmpdir(), "derive-exports-"));
  try {
    for (const name of ["button.tsx", "compound.ts", "button.test.tsx", "format.test.ts", "chat.stories.tsx", "analytics.stories.ts", "test-setup.ts"]) {
      writeFileSync(join(dir, name), "");
    }
    mkdirSync(join(dir, "compat-chat"));
    writeFileSync(join(dir, "compat-chat", "chat.stories.tsx"), "");
    assert.deepEqual(deriveNames(dir), ["button", "compound"]);
  } finally {
    rmSync(dir, { recursive: true });
  }
});

test("agrega entries nuevas al final (recibe la lista ya ordenada de deriveNames)", () => {
  const existing = { "./button": entry("button") };
  const { exports, added, dropped } = reconcileExports(existing, ["alert", "button", "chip"]);
  assert.deepEqual(Object.keys(exports), ["./button", "./alert", "./chip"]);
  assert.deepEqual(added, ["alert", "chip"]);
  assert.deepEqual(dropped, []);
});

test("dropea huérfanas (entry sin archivo fuente)", () => {
  const existing = { "./button": entry("button"), "./viejo": entry("viejo") };
  const { exports, dropped } = reconcileExports(existing, ["button"]);
  assert.deepEqual(Object.keys(exports), ["./button"]);
  assert.deepEqual(dropped, ["viejo"]);
});

test("preserva el orden curado de las existentes", () => {
  const existing = { "./b": entry("b"), "./a": entry("a") };
  const { exports } = reconcileExports(existing, ["a", "b"]);
  assert.deepEqual(Object.keys(exports), ["./b", "./a"]);
});

test('preserva "./package.json" verbatim (no es huérfana)', () => {
  const existing = {
    "./button": entry("button"),
    "./package.json": "./package.json",
  };
  const { exports, dropped } = reconcileExports(existing, ["button"]);
  assert.deepEqual(dropped, []);
  assert.equal(exports["./package.json"], "./package.json");
});

test("idempotente: map sincronizado no cambia", () => {
  const existing = {
    "./a": entry("a"),
    "./b": entry("b"),
    "./package.json": "./package.json",
  };
  const { exports, added, dropped } = reconcileExports(existing, ["a", "b"]);
  assert.deepEqual(exports, existing);
  assert.deepEqual(added, []);
  assert.deepEqual(dropped, []);
});

test("cada entrada conserva types primero y el mismo target ESM para import/default", () => {
  const old = { types: "./dist/analytics.d.ts", import: "./dist/analytics.js" };
  const { exports, changed } = reconcileExports({ "./analytics": old }, ["analytics", "chat"]);
  assert.deepEqual(changed, ["analytics"]);
  for (const value of Object.values(exports)) {
    assert.deepEqual(Object.keys(value), ["types", "import", "default"]);
    assert.equal(value.import, value.default);
    assert.equal(value.require, undefined);
  }
});

test("el CLI detecta condiciones incompletas y normaliza el fallback sin cambiar el orden curado", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "derive-exports-conditions-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  mkdirSync(join(dir, "src"));
  for (const name of ["chat", "analytics"]) writeFileSync(join(dir, "src", `${name}.ts`), "export {};\n");
  const manifest = join(dir, "package.json");
  const old = Object.fromEntries(["chat", "analytics"].map((name) => [
    `./${name}`, { types: `./dist/${name}.d.ts`, import: `./dist/${name}.js` },
  ]));
  writeFileSync(manifest, JSON.stringify({ name: "fixture", type: "module", exports: old }, null, 2));
  const script = fileURLToPath(new URL("./derive-exports.mjs", import.meta.url));
  const before = spawnSync(process.execPath, [script, dir, "--check"], { encoding: "utf8" });
  assert.equal(before.status, 1);
  assert.match(before.stderr, /condiciones\/targets desincronizados/);
  execFileSync(process.execPath, [script, dir]);
  const { exports } = JSON.parse(readFileSync(manifest, "utf8"));
  assert.deepEqual(Object.keys(exports), ["./chat", "./analytics"]);
  assert.deepEqual(exports, { "./chat": entry("chat"), "./analytics": entry("analytics") });
  execFileSync(process.execPath, [script, dir, "--check"]);
  const once = readFileSync(manifest, "utf8");
  execFileSync(process.execPath, [script, dir]);
  assert.equal(readFileSync(manifest, "utf8"), once);
});

test("el fallback resuelve lookup CommonJS sin cambiar la identidad ni el formato ESM", async (t) => {
  const dir = mkdtempSync(join(tmpdir(), "derive-exports-esm-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  mkdirSync(join(dir, "dist"));
  writeFileSync(join(dir, "dist", "analytics.js"), "export const identity = {};\n");
  writeFileSync(join(dir, "package.json"), JSON.stringify({
    name: "esm-fixture", type: "module", exports: { "./analytics": entry("analytics") },
  }));
  const require = createRequire(join(dir, "package.json"));
  const lookup = require.resolve("esm-fixture/analytics");
  assert.equal(lookup, join(dir, "dist", "analytics.js"));
  const runtime = await import(pathToFileURL(lookup).href);
  assert.equal(runtime.identity, (await import(pathToFileURL(join(dir, "dist", "analytics.js")).href)).identity);
  assert.match(readFileSync(lookup, "utf8"), /^export /);
});
