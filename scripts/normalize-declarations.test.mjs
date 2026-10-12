import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync, symlinkSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
import ts from "@typescript/typescript6";
import { decode, encode } from "@jridgewell/sourcemap-codec";
import { normalizeDeclaration, normalizeDeclarationMap, normalizeDeclarations } from "./normalize-declarations.mjs";

function fixture(t, files) {
  const root = mkdtempSync(path.join(tmpdir(), "lindaui-declarations-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const [name, source] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(root, name)), { recursive: true });
    writeFileSync(path.join(root, name), source);
  }
  return root;
}

test("normalizes static import/export declarations, including aliases, type-only and side-effect imports", (t) => {
  const root = fixture(t, { "value.d.ts": "export declare const value: number;" });
  const source = `"use client";
import { value as local } from './value';
import type { value } from "./value";
import './value';
export { local } from './value';
export type { value } from "./value";
export * from "./value";
export * as namespace from "./value";
`;
  const result = normalizeDeclaration(source, path.join(root, "index.d.ts"));
  assert.equal(result.edits.length, 7);
  assert.equal(result.code, source.replaceAll("'./value'", "'./value.js'").replaceAll('"./value"', '"./value.js"'));
});

test("normalizes nested import types, typeof imports, import-equals and relative module augmentations", (t) => {
  const root = fixture(t, { "value.d.ts": "export interface Value { id: string }" });
  const source = `export type Value = import("./value").Value;
export type Namespace = typeof import('./value');
export type Nested = Promise<Array<import('./value').Value>>;
import external = require("./value");
declare module './value' { interface Value { label: string } }
`;
  assert.equal(normalizeDeclaration(source, path.join(root, "index.d.ts")).code,
    source.replaceAll('"./value"', '"./value.js"').replaceAll("'./value'", "'./value.js'"));
});

test("resolves real files before directory indexes, including dot and parent paths", (t) => {
  const root = fixture(t, {
    "index.d.ts": "export {};", "nested/index.d.ts": "export {};",
    "value.d.ts": "export {};", "value/index.d.ts": "export {};",
    "directory/index.d.ts": "export {};",
  });
  const file = path.join(root, "nested/entry.d.ts");
  const source = `export * from '../value';
export * from '../directory';
export * from '../value/';
export * from '.';
export * from '..';
`;
  assert.equal(normalizeDeclaration(source, file).code, `export * from '../value.js';
export * from '../directory/index.js';
export * from '../value/index.js';
export * from './index.js';
export * from '../index.js';
`);
});

test("maps source/declaration extensions to their correct JS, MJS and CJS specifiers", (t) => {
  const root = fixture(t, {
    "value.d.ts": "export {};", "module.d.mts": "export {};", "common.d.cts": "export {};",
  });
  const source = `export * from './value.ts';
export * from './value.tsx';
export * from './value.d.ts';
export * from './module.mts';
export * from './module.d.mts';
export * from './common.cts';
export * from './common.d.cts';
`;
  assert.equal(normalizeDeclaration(source, path.join(root, "index.d.ts")).code, `export * from './value.js';
export * from './value.js';
export * from './value.js';
export * from './module.mjs';
export * from './module.mjs';
export * from './common.cjs';
export * from './common.cjs';
`);
});

test("preserves explicit runtime extensions, external dependencies, protocols, aliases and assets", (t) => {
  const root = fixture(t, {
    "value.d.ts": "export {};", "module.d.mts": "export {};", "common.d.cts": "export {};",
    "data.json": "{}",
  });
  const source = `export * from './value.js';
export * from './value.jsx';
export * from './module.mjs';
export * from './common.cjs';
export * from 'react';
export * from 'node:fs';
export * from '#internal';
export type Data = typeof import('./data.json');
`;
  assert.equal(normalizeDeclaration(source, path.join(root, "index.d.ts")).code, source);
});

test("normalizes only real triple-slash path/types references to declaration paths", (t) => {
  const root = fixture(t, { "globals.d.ts": "declare const globalValue: string;", "types/index.d.ts": "export {};" });
  const source = `/// <reference path='./globals.ts' preserve="true" />
/// <reference types="./types" resolution-mode="import" />
/// <reference types="react" />
export {};
// A normal comment: <reference path='./globals.ts' />
`;
  assert.equal(normalizeDeclaration(source, path.join(root, "index.d.ts")).code, `/// <reference path='./globals.d.ts' preserve="true" />
/// <reference types="./types/index.d.ts" resolution-mode="import" />
/// <reference types="react" />
export {};
// A normal comment: <reference path='./globals.ts' />
`);
});

test("never rewrites lookalike string literals, comments, JSDoc, directives or source map URLs", (t) => {
  const root = fixture(t, { "value.d.ts": "export {};" });
  const source = `\uFEFF'use client';\r\n
// export * from './value';
/* import { Value } from "./value"; */
/** @example import("./value") */
export type Literal = './value' | "./value";
export interface Keys { "./value": string }
export declare const text: "export * from './value'";
export type Real = import('./value');
//# sourceMappingURL=./value
`;
  assert.equal(normalizeDeclaration(source, path.join(root, "index.d.ts")).code,
    source.replace("import('./value');", "import('./value.js');"));
});

test("handles escaped import specifiers without breaking their quote delimiters", (t) => {
  const root = fixture(t, { "quo'te.d.ts": "export {};" });
  const source = String.raw`export * from './quo\'te';`;
  const result = normalizeDeclaration(source, path.join(root, "index.d.ts"));
  const parsed = ts.createSourceFile("index.d.ts", result.code, ts.ScriptTarget.Latest, true);
  assert.equal(parsed.parseDiagnostics.length, 0);
  assert.equal(parsed.statements[0].moduleSpecifier.text, "./quo'te.js");
});

test("rejects missing dependencies and invalid declarations without writing a partially normalized tree", (t) => {
  const root = fixture(t, {
    "a.d.ts": "export * from './value';", "value.d.ts": "export {};",
    "z.d.ts": "export * from './missing';",
  });
  assert.throws(() => normalizeDeclarations(root), /cannot resolve relative declaration reference/);
  assert.equal(readFileSync(path.join(root, "a.d.ts"), "utf8"), "export * from './value';");
  assert.throws(() => normalizeDeclaration("export type Broken = ;", path.join(root, "broken.d.ts")), /Type expected/);
});

test("updates declaration map generated columns without altering original source mappings", (t) => {
  const root = fixture(t, { "value.d.ts": "export {};", "directory/index.d.ts": "export {};" });
  const source = `export * from './value'; export * from './directory'; // tail\r\nexport {};`;
  const result = normalizeDeclaration(source, path.join(root, "index.d.ts"));
  const columns = [0, source.indexOf("./value"), source.indexOf("';") + 1, source.indexOf("export *", 1), source.indexOf("// tail")];
  const mappings = [columns.map((column, i) => [column, 0, 0, i]), [[0, 0, 1, 0]]];
  const original = { version: 3, file: "index.d.ts", sources: ["../src/index.ts"], names: [], mappings: encode(mappings) };
  const map = JSON.parse(normalizeDeclarationMap(JSON.stringify(original), result));
  const expected = columns.map((column) => column + result.edits
    .filter((edit) => column >= edit.end).reduce((sum, edit) => sum + edit.text.length - (edit.end - edit.start), 0));
  assert.deepEqual(decode(map.mappings)[0].map((segment) => segment[0]), expected);
  assert.deepEqual(decode(map.mappings).map((line) => line.map((segment) => segment.slice(1))),
    mappings.map((line) => line.map((segment) => segment.slice(1))));
  assert.deepEqual({ ...map, mappings: undefined }, { ...original, mappings: undefined });
});

test("recursively processes declarations only, preserves JS/client directives, and is idempotent", (t) => {
  const js = `'use client';\nexport { value } from './value.js';\n`;
  const root = fixture(t, {
    "index.d.ts": "export * from './nested';", "nested/index.d.ts": "export * from '../value';",
    "value.d.ts": "export declare const value: number;", "index.js": js,
    "source.ts": "export * from './value';", "other.txt": "./value",
  });
  assert.deepEqual(normalizeDeclarations(root), { files: 3, references: 2 });
  assert.equal(readFileSync(path.join(root, "index.js"), "utf8"), js);
  assert.equal(readFileSync(path.join(root, "source.ts"), "utf8"), "export * from './value';");
  assert.deepEqual(normalizeDeclarations(root), { files: 3, references: 0 });
});

test("normalized declarations resolve in a real NodeNext typecheck with skipLibCheck disabled", (t) => {
  const root = fixture(t, {
    "package.json": '{"type":"module"}',
    "globals.d.ts": "declare namespace GlobalTypes { interface Id { id: string } }",
    "value.d.ts": "export interface Value extends GlobalTypes.Id { label: string }",
    "directory/index.d.ts": "export { type Value } from '../value';",
    "index.d.ts": `/// <reference path="./globals.ts" />
/// <reference types="./globals" resolution-mode="import" />
import type { Value } from './directory';
export declare function identity(value: Value): import('./value').Value;
export type Namespace = typeof import('./directory');
`,
    "consumer.mts": "import { identity } from './index.js'; const value: string = identity({ id: 'a', label: 'b' }).label;",
  });
  normalizeDeclarations(root);
  const program = ts.createProgram([path.join(root, "consumer.mts")], {
    module: ts.ModuleKind.NodeNext, moduleResolution: ts.ModuleResolutionKind.NodeNext,
    strict: true, noEmit: true, skipLibCheck: false, types: [], target: ts.ScriptTarget.ES2022,
  });
  assert.deepEqual(ts.getPreEmitDiagnostics(program).map((diagnostic) =>
    ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")), []);
});

test("shared declaration build inputs retain dependency ordering and cached dist outputs", () => {
  const { tasks } = JSON.parse(readFileSync(new URL("../turbo.json", import.meta.url), "utf8"));
  for (const name of ["@lindaui/ui", "@lindaui/blocks"]) {
    const task = tasks[`${name}#build`];
    assert.deepEqual(task.dependsOn, ["^build"]);
    assert(task.outputs.includes("dist/**"));
    assert(task.inputs.includes("$TURBO_DEFAULT$"));
    assert(task.inputs.includes("$TURBO_ROOT$/scripts/normalize-declarations.mjs"));
  }
});

test("runtime-only files and directory indexes resolve without inventing declaration files", (t) => {
  const root = fixture(t, {
    "runtime.js": "export {};", "folder/index.mjs": "export {};", "nested/index.cjs": "module.exports = {};",
  });
  const source = `export * from './runtime'; export * from './folder/'; export * from './nested';`;
  assert.equal(normalizeDeclaration(source, path.join(root, 'index.d.ts')).code,
    `export * from './runtime.js'; export * from './folder/index.mjs'; export * from './nested/index.cjs';`);
  assert.throws(() => normalizeDeclaration(`/// <reference path="./runtime" />\nexport {};`, path.join(root, 'index.d.ts')), /cannot resolve/);
  assert.throws(() => normalizeDeclaration(`export * from './runtime/child';`, path.join(root, 'index.d.ts')), /cannot resolve/);
  symlinkSync('loop.d.ts', path.join(root, 'loop.d.ts'));
  assert.throws(() => normalizeDeclaration(`export * from './loop';`, path.join(root, 'index.d.ts')), { code: 'ELOOP' });
});

test("declaration maps shift columns inside shortened literals and on the final line", (t) => {
  const root = fixture(t, { 'value.d.ts': 'export {};', 'nested/index.d.ts': 'export {};' });
  const source = `export * from './value';\nexport * from './nested/index.d.ts';`;
  const result = normalizeDeclaration(source, path.join(root, 'index.d.ts'));
  const edit = result.edits[1];
  const lineStart = result.lineStarts[1];
  const columns = [0, edit.start - lineStart + 2, edit.end - lineStart - 1, edit.end - lineStart + 1];
  const original = { version: 3, sources: ['source.ts'], names: [], mappings: encode([[[0]], columns.map(column => [column])]) };
  const map = JSON.parse(normalizeDeclarationMap(JSON.stringify(original), result));
  const shift = edit.text.length - (edit.end - edit.start);
  assert.deepEqual(decode(map.mappings)[1].map(segment => segment[0]), [columns[0], columns[1], edit.start - lineStart + edit.text.length, columns[3] + shift]);
  writeFileSync(path.join(root, 'index.d.ts'), source);
  writeFileSync(path.join(root, 'index.d.ts.map'), JSON.stringify(original));
  normalizeDeclarations(root);
  assert.deepEqual(JSON.parse(readFileSync(path.join(root, 'index.d.ts.map'), 'utf8')), map);
});

test("declaration CLI reports its results and rejects missing directory arguments", (t) => {
  const root = fixture(t, { 'value.d.ts': 'export {};', 'index.d.ts': "export * from './value';" });
  const script = new URL('./normalize-declarations.mjs', import.meta.url);
  const result = spawnSync(process.execPath, [script.pathname, root], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /2 declarations checked; 1 relative references normalized/);
  const invalid = spawnSync(process.execPath, [script.pathname], { encoding: 'utf8' });
  assert.equal(invalid.status, 1);
  assert.match(invalid.stderr, /Usage:/);
});
