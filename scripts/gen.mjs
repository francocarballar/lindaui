// Generador de unidades del design system. Mata el boilerplate por-componente
// y mantiene el `exports` map derivado (vía scripts/derive-exports.mjs).
//
// Uso:
//   node scripts/gen.mjs component <nombre-kebab>   -> packages/ui/src/<n>.tsx + test + entry
//   node scripts/gen.mjs block <nombre-kebab>       -> packages/blocks/src/<n>.tsx + test + entry
//   node scripts/gen.mjs exports [--check]          -> deriva exports de ui (+ blocks si existe)
//
// Templates string (mismo enfoque que apps/storybook/scripts/gen-stories.mjs).

import { writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const deriveScript = resolve(__dirname, "derive-exports.mjs");

const PKG_DIR = { component: "packages/ui", block: "packages/blocks" };
const DERIVABLE = ["packages/ui", "packages/blocks"];

const pascal = (s) =>
  s.split("-").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join("");

function deriveExports(pkgRel, check, root = repoRoot) {
  const args = [deriveScript, resolve(root, pkgRel)];
  if (check) args.push("--check");
  execFileSync(process.execPath, args, { stdio: "inherit" });
}

function componentTemplate(Name, kind) {
  const note =
    kind === "block"
      ? "// Block: sección compuesta. Importá primitivos de @lindaui/ui y armá la composición."
      : "// Componente: envolvé el primitivo de HeroUI o componé su API ergonómica.";
  return `"use client";
import type { ReactNode } from "react";

${note}
export interface ${Name}Props {
  children?: ReactNode;
  className?: string;
}

export function ${Name}({ children, className }: ${Name}Props) {
  return <div className={className}>{children}</div>;
}
`;
}

function testTemplate(Name, name) {
  return `import { render, screen } from "@testing-library/react";
import { ${Name} } from "./${name}";
import { describe, test, expect } from "vitest";

describe("${Name}", () => {
  // TODO: reemplazar por una aserción semántica real (getByRole / getByLabelText).
  test("renderiza children", () => {
    render(<${Name}>contenido</${Name}>);
    expect(screen.getByText("contenido")).toBeInTheDocument();
  });
});
`;
}

export function genUnit(kind, name, { root = repoRoot } = {}) {
  if (!Object.hasOwn(PKG_DIR, kind)) throw new Error(`Tipo inválido: ${kind}`);
  if (typeof name !== "string" || !/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(name)) {
    throw new Error(`Nombre inválido: "${name}". Usá kebab-case (ej: data-list).`);
  }
  const pkgRel = PKG_DIR[kind];
  const srcDir = resolve(root, pkgRel, "src");
  if (!existsSync(srcDir)) {
    throw new Error(`No existe ${pkgRel}/src. ¿Está creado el paquete?`);
  }
  const tsx = resolve(srcDir, `${name}.tsx`);
  const test = resolve(srcDir, `${name}.test.tsx`);
  if (existsSync(tsx) || existsSync(test)) {
    throw new Error(`Ya existe ${name}.tsx o ${name}.test.tsx en ${pkgRel}/src. Abortando.`);
  }
  const Name = pascal(name);
  writeFileSync(tsx, componentTemplate(Name, kind), "utf8");
  writeFileSync(test, testTemplate(Name, name), "utf8");
  deriveExports(pkgRel, false, root);
  console.log(`✓ ${kind} "${name}" creado en ${pkgRel}/src (+ test, + entry exports).`);
  console.log(`  Editá ${name}.tsx y reemplazá el smoke test por aserciones reales.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    const kind = args[0];

    if (kind === "exports") {
      const check = args.includes("--check");
      for (const pkgRel of DERIVABLE) {
        if (existsSync(resolve(repoRoot, pkgRel, "src"))) deriveExports(pkgRel, check);
      }
    } else if (kind === "component" || kind === "block") {
      const name = args[1];
      if (!name) {
        console.error(`Uso: node scripts/gen.mjs ${kind} <nombre-kebab>`);
        process.exit(1);
      }
      genUnit(kind, name);
    } else {
      console.error("Uso: node scripts/gen.mjs <component|block|exports> [nombre] [--check]");
      process.exit(1);
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
