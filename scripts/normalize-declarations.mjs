// Normalize emitted declaration references for NodeNext without rewriting JS
// or printing whole files (which would alter comments, literals and directives).
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "@typescript/typescript6";
import { decode, encode } from "@jridgewell/sourcemap-codec";

const declarationPattern = /\.d\.(ts|mts|cts)$/;
const declarationExtensions = [".d.ts", ".d.mts", ".d.cts"];
const runtimeExtensions = [".js", ".mjs", ".cjs"];
const printer = ts.createPrinter();

function isFile(file) {
  try { return statSync(file).isFile(); }
  catch (error) {
    if (error.code === "ENOENT" || error.code === "ENOTDIR") return false;
    throw error;
  }
}

function isRelative(specifier) {
  return specifier === "." || specifier === ".." || /^\.\.?\//.test(specifier);
}

function relativeSpecifier(from, to) {
  const specifier = path.relative(path.dirname(from), to).split(path.sep).join("/");
  return specifier.startsWith("../") ? specifier : `./${specifier}`;
}

function runtimePath(declaration) {
  return declaration.replace(/\.d\.ts$/, ".js")
    .replace(/\.d\.mts$/, ".mjs").replace(/\.d\.cts$/, ".cjs");
}

function resolveReference(specifier, file, typeReference = false) {
  if (!isRelative(specifier)) return specifier;
  const target = path.resolve(path.dirname(file), specifier);
  const explicitRuntime = /\.(js|jsx|mjs|cjs)$/.test(specifier);
  const forceIndex = specifier === "." || specifier === ".." || specifier.endsWith("/");
  const stem = target.replace(/(?:\.d)?\.(ts|tsx|mts|cts)$/, "")
    .replace(/\.(js|jsx|mjs|cjs)$/, "");
  const extension = /\.(mts|mjs)$/.test(specifier) ? ".d.mts"
    : /\.(cts|cjs)$/.test(specifier) ? ".d.cts" : ".d.ts";
  const explicit = /\.(ts|tsx|mts|cts|js|jsx|mjs|cjs)$/.test(specifier);
  const declarations = forceIndex ? [] : explicit
    ? [stem + extension] : declarationExtensions.map((suffix) => target + suffix);
  if (!explicit) declarations.push(...declarationExtensions.map((suffix) => path.join(target, `index${suffix}`)));
  const declaration = declarations.find(isFile);
  if (declaration) {
    if (!typeReference && explicitRuntime) return specifier;
    return relativeSpecifier(file, typeReference ? declaration : runtimePath(declaration));
  }
  // Explicit assets/JS may legitimately have no separate declaration. Never
  // invent an extension for a missing internal dependency or a directory.
  if (isFile(target) && !/\.(ts|tsx|mts|cts)$/.test(specifier)) return specifier;
  if (!explicit && !typeReference) {
    const runtime = [
      ...(forceIndex ? [] : runtimeExtensions.map((suffix) => target + suffix)),
      ...runtimeExtensions.map((suffix) => path.join(target, `index${suffix}`)),
    ].find(isFile);
    if (runtime) return relativeSpecifier(file, runtime);
  }
  throw new Error(`${file}: cannot resolve relative declaration reference ${JSON.stringify(specifier)}`);
}

export function normalizeDeclaration(source, file) {
  const parsed = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  if (parsed.parseDiagnostics.length) {
    throw new Error(`${file}: ${ts.flattenDiagnosticMessageText(parsed.parseDiagnostics[0].messageText, "\n")}`);
  }
  const edits = [];
  function visit(node) {
    let literal;
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) literal = node.moduleSpecifier;
    else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)) literal = node.argument.literal;
    else if (ts.isExternalModuleReference(node)) literal = node.expression;
    else if (ts.isModuleDeclaration(node) && ts.isStringLiteral(node.name)) literal = node.name;
    if (literal && ts.isStringLiteral(literal)) {
      const normalized = resolveReference(literal.text, file);
      if (normalized !== literal.text) {
        const start = literal.getStart(parsed);
        const text = printer.printNode(ts.EmitHint.Unspecified,
          ts.factory.createStringLiteral(normalized, source[start] === "'"), parsed);
        edits.push({ start: start + 1, end: literal.end - 1, text: text.slice(1, -1) });
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(parsed);
  // Only actual leading triple-slash references recognized by the parser, not
  // arbitrary comment text. These target declaration files, not runtime JS.
  for (const reference of [...parsed.referencedFiles, ...parsed.typeReferenceDirectives]) {
    const normalized = resolveReference(reference.fileName, file, true);
    if (normalized !== reference.fileName) edits.push({ start: reference.pos, end: reference.end, text: normalized });
  }
  edits.sort((a, b) => a.start - b.start);
  let code = source;
  for (const edit of edits.toReversed()) code = code.slice(0, edit.start) + edit.text + code.slice(edit.end);
  return { code, edits, lineStarts: parsed.getLineStarts() };
}

export function normalizeDeclarationMap(sourceMap, { edits, lineStarts }) {
  const map = JSON.parse(sourceMap);
  const mappings = decode(map.mappings);
  // Replacements contain no newlines. Move generated columns only; original
  // source positions and source content still point at the unchanged TS source.
  for (const [line, segments] of mappings.entries()) {
    for (const segment of segments) {
      const offset = lineStarts[line] + segment[0];
      let shift = 0;
      for (const edit of edits) {
        if (edit.start < lineStarts[line] || edit.start >= (lineStarts[line + 1] ?? Infinity)) continue;
        if (offset >= edit.end) shift += edit.text.length - (edit.end - edit.start);
        else if (offset > edit.start) shift += Math.min(offset - edit.start, edit.text.length) - (offset - edit.start);
      }
      segment[0] += shift;
    }
  }
  map.mappings = encode(mappings);
  return JSON.stringify(map);
}

export function normalizeDeclarations(directory) {
  function declarations(dir) {
    return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) return declarations(file);
      return entry.isFile() && declarationPattern.test(entry.name) ? [file] : [];
    }).sort();
  }
  const files = declarations(path.resolve(directory));
  const writes = [];
  let references = 0;
  // Resolve and parse the entire tree before changing any emitted declaration.
  for (const file of files) {
    const result = normalizeDeclaration(readFileSync(file, "utf8"), file);
    if (!result.edits.length) continue;
    references += result.edits.length;
    writes.push([file, result.code]);
    if (isFile(`${file}.map`)) {
      writes.push([`${file}.map`, normalizeDeclarationMap(readFileSync(`${file}.map`, "utf8"), result)]);
    }
  }
  for (const [file, contents] of writes) writeFileSync(file, contents);
  return { files: files.length, references };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  if (process.argv.length !== 3) throw new Error("Usage: node scripts/normalize-declarations.mjs <declaration-directory>");
  const result = normalizeDeclarations(process.argv[2]);
  console.log(`✓ ${result.files} declarations checked; ${result.references} relative references normalized for NodeNext`);
}
