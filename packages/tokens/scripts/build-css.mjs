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
// `@lindaui/tokens/css` rinde la lib completa en cualquier consumidor.
// SOLO sources publicables (ui + blocks). Las stories de apps/storybook NO
// entran acá: el CSS publicado no debe depender de una app privada (bloat +
// acople). Storybook genera sus utilities story-only con su propio pass de
// Tailwind (@tailwindcss/vite + .storybook/preview.css).
const entry = `@import "tailwindcss";
@source "../ui/src";
@source "../blocks/src";
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

child.on("exit", async (code) => {
  if (code === 0 && !watch) {
    await verifyOutput();
    console.log("✓ @lindaui/tokens built → dist/index.css");
  }
  process.exit(code ?? 0);
});

// Guardrail anti-regresión #10: un @source roto NO falla el build de Tailwind,
// solo emite un CSS sin utilities. Verificamos que el output tenga los markers
// de cada capa (utility Tailwind derivada del @theme, vars de field de HeroUI,
// keyframes bespoke) y un piso de tamaño.
async function verifyOutput() {
  const { readFile } = await import("node:fs/promises");
  const css = await readFile(path.join(root, "dist/index.css"), "utf8");
  const checks = [
    [".bg-primary", "utility del @theme inline (¿@source de ui/blocks roto?)"],
    ["--field-background", "vars --field-* de theme.css"],
    ["@keyframes ti-rec-pulse", "keyframes bespoke de theme.css"],
    ["--accent", "tokens HeroUI"],
  ];
  const missing = checks.filter(([marker]) => !css.includes(marker));
  if (missing.length || css.length < 50_000) {
    console.error("✗ dist/index.css inválido:");
    for (const [marker, why] of missing) console.error(`  falta "${marker}" (${why})`);
    if (css.length < 50_000) console.error(`  tamaño sospechoso: ${css.length} bytes (< 50KB)`);
    process.exit(1);
  }
}
