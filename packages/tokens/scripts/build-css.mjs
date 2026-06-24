import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const watch = process.argv.includes("--watch");

await mkdir(path.join(root, "dist"), { recursive: true });

// Tailwind v4 entry: pull in Tailwind, HeroUI styles, then brand tokens.
// HeroUI v3 ships its Tailwind plugin + base styles via the `@heroui/styles`
// package; importing it after Tailwind layers the component styles in.
// `@source` hace que Tailwind v4 escanee el source de los paquetes de la lib y
// genere las utilities que usan (flex, gap, max-w, etc.). Sin esto, index.css
// trae HeroUI + tokens pero CERO utilities → los blocks/bespoke se ven sin
// estilo. Paths relativos a _entry.css (packages/tokens/). Así un solo
// `@ts/tokens/css` rinde la lib completa en cualquier consumidor.
const entry = `@import "tailwindcss";
@source "../ui/src";
@source "../blocks/src";
@source "../../apps/storybook/src";
@import "@heroui/styles";
@import "./src/theme.css";
`;

const entryPath = path.join(root, "_entry.css");
await writeFile(entryPath, entry);

// Tailwind v4 CLI does the @import resolution + JIT compilation. The bare
// `postcss` call in the original plan cannot process Tailwind v4 directives.
const args = [
  "@tailwindcss/cli",
  "-i",
  "_entry.css",
  "-o",
  "dist/index.css",
];
if (watch) args.push("--watch");

const child = spawn("npx", args, {
  cwd: root,
  stdio: "inherit",
  shell: process.platform === "win32",
});

child.on("exit", (code) => {
  if (code === 0 && !watch) {
    console.log("✓ @ts/tokens built → dist/index.css");
  }
  process.exit(code ?? 0);
});
