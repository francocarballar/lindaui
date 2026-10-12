import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { watch as watchDirectory } from "node:fs";
import { createRequire } from "node:module";
import { mkdir, readFile, writeFile, rename, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultRoot = path.resolve(__dirname, "..");
const require = createRequire(import.meta.url);
const cliManifestPath = require.resolve("@tailwindcss/cli/package.json");
const cliPath = path.resolve(path.dirname(cliManifestPath), require(cliManifestPath).bin.tailwindcss);

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
@source not "../blocks/src/**/*.stories.tsx";
@import "@heroui/styles";
@import "./src/theme.css";
`;

const themes = [
  { name: "index", entry },
  {
    name: "lead-converter",
    entry: `@import "tailwindcss" source(none);
@source "../ui/src";
@source "../blocks/src";
@source not "../blocks/src/**/*.stories.tsx";
@import "./src/lead-converter.css";
`,
  },
];

export function createStyleBuilder({ root = defaultRoot, launch = spawn, observe = watchDirectory, log = console.log, error = console.error, signalHost = process } = {}) {
  const children = new Set();
  const watchers = [];
  const handlers = new Map();
  let stopping = false;
  let timer;
  let resolveStopped;
  const stopped = new Promise(resolve => { resolveStopped = resolve; });
  function stop(signal = "SIGTERM") {
    stopping = true;
    clearTimeout(timer);
    for (const watcher of watchers) watcher.close();
    for (const child of children) child.kill(signal);
    for (const [name, handler] of handlers) signalHost.removeListener(name, handler);
    resolveStopped();
  }
  // Source exports are for Tailwind applications; these independent bundles
  // include library utilities for consumers without a Tailwind pipeline.
  // Keep inputs beside the original entry so @import/@source paths stay identical.
  // Each process owns its temporary files; Tailwind never writes a public output.
  async function buildStyles() {
    await mkdir(path.join(root, "dist"), { recursive: true });
    const invocation = randomUUID();
    const results = await Promise.allSettled(themes.map(async ({ name, entry: content }) => {
      const input = `.build-css-${invocation}-${name}.input.css`;
      const output = `dist/.build-css-${invocation}-${name}.output.css`;
      const staged = `dist/.build-css-${invocation}-${name}.publish.css`;
      const publish = async () => {
        // Validate the exact completed snapshot before atomic replacement.
        const css = await readFile(path.join(root, output), "utf8");
        verifyOutput(name, css, error);
        await writeFile(path.join(root, staged), css);
        await rename(path.join(root, staged), path.join(root, `dist/${name}.css`));
        log(`✓ @lindaui/tokens built → dist/${name}.css`);
      };
      try {
        await writeFile(path.join(root, input), content);
        const args = [cliPath, "-i", input, "-o", output];
        // Execute the installed CLI directly: never auto-install during build.
        const child = launch(process.execPath, args, {
          cwd: root,
          stdio: "inherit",
        });
        children.add(child);
        try {
          await new Promise((resolve, reject) => {
            child.once("error", reject);
            child.once("close", (code) => code === 0 || stopping
              ? resolve()
              : reject(new Error(`Tailwind ${name} exited with ${code}`)));
          });
        } finally {
          children.delete(child);
        }
        if (!stopping) await publish();
      } finally {
        await Promise.all([input, output, staged].map((file) => rm(path.join(root, file), { force: true })));
      }
    }));
    const failed = results.find((result) => result.status === "rejected");
    if (failed) throw failed.reason;
  }

  async function run({ watch = false } = {}) {
    for (const signal of ["SIGINT", "SIGTERM"]) {
      const handler = () => stop(signal);
      handlers.set(signal, handler);
      signalHost.once(signal, handler);
    }
    // Watch only sources; queue complete builds behind the active compilation.
    let scheduled = Promise.resolve();
    try {
      if (watch) {
        for (const source of ["src", "../ui/src", "../blocks/src"]) {
          watchers.push(observe(path.resolve(root, source), { recursive: true }, () => {
            clearTimeout(timer);
            timer = setTimeout(() => {
              scheduled = scheduled.then(() => { if (!stopping) return buildStyles(); });
              scheduled.catch(() => stop());
            }, 80);
          }));
        }
      }
      scheduled = buildStyles();
      await scheduled;
      if (watch && !stopping) await stopped;
      await scheduled;
    } finally {
      stop();
    }
  }
  return { buildStyles, run, stop };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await createStyleBuilder().run({ watch: process.argv.includes("--watch") });
}

// Guardrail anti-regresión #10: un @source roto NO falla el build de Tailwind,
// solo emite un CSS sin utilities. Verificamos que el output tenga los markers
// de cada capa (utility Tailwind derivada del @theme, vars de field de HeroUI,
// keyframes bespoke) y un piso de tamaño.
export function verifyOutput(name, css, error = console.error) {
  const checks = [
    [name === "index" ? ".bg-primary" : ".flex", "utility de ui/blocks (¿@source roto?)"],
    ["--field-background", "vars --field-* de theme.css"],
    [name === "index" ? "@keyframes ti-rec-pulse" : ".notice-action.button--primary", "estilos del tema"],
    ["--accent", "tokens HeroUI"],
  ];
  if (name === "lead-converter") {
    checks.push(["oklch(0.541 0.281 293.009)", "accent violeta claro"]);
    checks.push(["oklch(0.606 0.25 292.717)", "accent violeta oscuro"]);
    if (css.includes("font-size: 18px") || css.includes("--accent: var(--primary)")) {
      throw new Error("LeadConverter must not inherit the default teal theme");
    }
  }
  const missing = checks.filter(([marker]) => !css.includes(marker));
  if (missing.length || css.length < 50_000) {
    error(`✗ dist/${name}.css inválido:`);
    for (const [marker, why] of missing) error(`  falta "${marker}" (${why})`);
    if (css.length < 50_000) error(`  tamaño sospechoso: ${css.length} bytes (< 50KB)`);
    throw new Error(`Refusing to publish incomplete dist/${name}.css`);
  }
}
