// Tests de las funciones puras del derivador de exports.
// Corre con el runner nativo: node --test scripts/
// (sin vitest a propósito: scripts/ no tiene package propio y node:test alcanza)

import { test } from "node:test";
import assert from "node:assert/strict";
import { reconcileExports } from "./derive-exports.mjs";

const entry = (name) => ({
  types: `./dist/${name}.d.ts`,
  import: `./dist/${name}.js`,
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
