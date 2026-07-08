// Codegen de stories. Lee el `exports` map de cada paquete del design system
// y emite un .stories.tsx por entry en src/stories/generated/.
//
// Tres modos:
//   ARGS     -> meta { component, args } + Default {}. Storybook renderiza
//               <X {...args}/> y autogenera CONTROLS desde los tipos (react-docgen).
//   RENDER   -> render fn con composición real (compound/cross-entry). Smoke visual.
//   SCAFFOLD -> placeholder que lista exports (date/color/overlays que requieren
//               composición/estado pesado, o API aún no mapeada). Nunca crashea.
//
// Idempotente: re-correr sobrescribe generated/. NO toca stories a mano.
// Uso: node scripts/gen-stories.mjs [--check]
//   --check: no escribe; exit 1 si generated/ difiere de lo que se generaría
//            (para CI, igual que gen:exports --check).

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "../../..");
const outDir = resolve(__dirname, "../src/stories/generated");

const PACKAGES = [
  { pkg: "packages/ui/package.json", importBase: "@lindaui/ui", group: "WIP" },
  { pkg: "packages/blocks/package.json", importBase: "@lindaui/blocks", group: "Blocks" },
];

// Entries con story escrita a mano -> no generar (evita colisión de título).
const HANDWRITTEN = new Set([
  "field", "button", "input", "dialog", "alert", "spinner", "skeleton",
  "select", "menu", "table",
  "avatar", "badge", "chip", "switch", "checkbox", "card",
  "login-form",
  // blocks — handwritten
  "list-item", "list-pane", "detail-panel", "confirm-dialog",
  "image-viewer", "document-panel", "document-reader", "recording-overlay",
  "split-workspace", "field-array-form", "auth-provider", "auth-layout",
  // charts — handwritten
  "chart", "search",
  "area-chart", "bar-chart", "line-chart", "pie-chart", "radar-chart",
  "radial-chart", "stat-card", "chart-card", "stats-grid",
]);

// ARGS: render con props simples → Storybook da controls (solo @lindaui/ui).
const ARGS = {
  kbd: '{ children: "Ctrl" }',
  "toggle-button": '{ children: "Toggle" }',
  "close-button": '{ "aria-label": "Cerrar" }',
  "icon-button": '{ "aria-label": "Cerrar", children: "×" }',
  surface: '{ className: "p-4", children: "Contenido en una surface" }',
  text: '{ children: "Texto de ejemplo" }',
  link: '{ href: "#", children: "Un enlace" }',
  progress: '{ value: 60, "aria-label": "Progreso" }',
  "progress-circle": '{ value: 60, "aria-label": "Progreso" }',
  meter: '{ value: 40, "aria-label": "Uso de disco" }',
  "status-chip": '{ status: "FIRMADO" }',
  "number-input": '{ label: "Cantidad", defaultValue: 1 }',
  textarea: '{ label: "Notas", placeholder: "Escribí algo…" }',
  "search-field": '{ label: "Buscar", placeholder: "Buscar…" }',
  slider: '{ "aria-label": "Volumen", defaultValue: 30 }',
  combobox:
    '{ label: "País", placeholder: "Elegí…", items: [{ value: "ar", label: "Argentina" }, { value: "uy", label: "Uruguay" }, { value: "cl", label: "Chile" }] }',
};

// RENDER: composición real (solo @lindaui/ui). `M` = namespace del entry; `imports`
// agrega componentes de otros entries (ej. Radio para radio-group).
const RENDER = {
  divider: { jsx: '<div style={{ width: 220 }}><M.Divider /></div>' },
  "scroll-shadow": {
    jsx: '<M.ScrollShadow className="h-24 w-48"><div className="h-64 p-2">Contenido largo scrolleable para ver la sombra.</div></M.ScrollShadow>',
  },
  tabs: {
    jsx: '<M.Tabs><M.TabList><M.Tab id="a">Cuenta</M.Tab><M.Tab id="b">Seguridad</M.Tab></M.TabList><M.TabPanel id="a">Panel de cuenta</M.TabPanel><M.TabPanel id="b">Panel de seguridad</M.TabPanel></M.Tabs>',
  },
  accordion: {
    jsx: '<M.Accordion><M.AccordionItem id="a"><M.AccordionHeading><M.AccordionTrigger>Sección 1</M.AccordionTrigger></M.AccordionHeading><M.AccordionPanel>Contenido de la sección 1.</M.AccordionPanel></M.AccordionItem></M.Accordion>',
  },
  disclosure: {
    jsx: '<M.Disclosure><M.DisclosureHeading><M.DisclosureTrigger>Ver más</M.DisclosureTrigger></M.DisclosureHeading><M.DisclosureContent>Detalle revelado.</M.DisclosureContent></M.Disclosure>',
  },
  listbox: {
    jsx: '<M.ListBox aria-label="Frutas" selectionMode="single"><M.ListBoxItem id="a">Manzana</M.ListBoxItem><M.ListBoxItem id="b">Banana</M.ListBoxItem></M.ListBox>',
  },
  breadcrumbs: {
    jsx: '<M.Breadcrumbs><M.BreadcrumbsItem>Inicio</M.BreadcrumbsItem><M.BreadcrumbsItem>Sección</M.BreadcrumbsItem></M.Breadcrumbs>',
  },
  "radio-group": {
    imports: ['import { Radio } from "@lindaui/ui/radio";'],
    jsx: '<M.RadioGroup aria-label="Plan" defaultValue="basico"><Radio value="basico">Básico</Radio><Radio value="pro">Pro</Radio></M.RadioGroup>',
  },
  "checkbox-group": {
    imports: ['import { Checkbox } from "@lindaui/ui/checkbox";'],
    jsx: '<M.CheckboxGroup aria-label="Opciones" defaultValue={["a"]}><Checkbox value="a">Opción A</Checkbox><Checkbox value="b">Opción B</Checkbox></M.CheckboxGroup>',
  },
};

// Entries que no son componentes: no tiene sentido una story.
// "package.json" es el export estándar de tooling; use-* son hooks;
// cn/date/format/time-grouping son utils puras (sin JSX).
const NON_COMPONENT = new Set([
  "package.json", "cn", "date", "format", "time-grouping", "chat-types",
]);
const isComponentEntry = (entry) => !NON_COMPONENT.has(entry) && !entry.startsWith("use-");

const pascal = (s) =>
  s.split("-").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join("");

// Export cuyo nombre no es pascal(entry) (camel interno).
const NAME_OVERRIDE = { combobox: "ComboBox", listbox: "ListBox" };
const compName = (entry) => NAME_OVERRIDE[entry] ?? pascal(entry);

function argsStory(entry, importBase) {
  const Name = compName(entry);
  return `import type { Meta, StoryObj } from "@storybook/react";
import { ${Name} } from "${importBase}/${entry}";

const meta: Meta<typeof ${Name}> = {
  title: "Components/${Name}",
  component: ${Name},
  args: ${ARGS[entry]},
};
export default meta;
type Story = StoryObj<typeof ${Name}>;

export const Default: Story = {};
`;
}

function renderStory(entry, importBase) {
  const Name = pascal(entry);
  const { jsx, imports = [] } = RENDER[entry];
  const extra = imports.length ? imports.join("\n") + "\n" : "";
  return `import type { Meta, StoryObj } from "@storybook/react";
import * as M from "${importBase}/${entry}";
${extra}
const meta: Meta = { title: "Components/${Name}" };
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => (${jsx}) };
`;
}

function scaffoldStory(entry, importBase, group) {
  const Name = pascal(entry);
  return `import type { Meta, StoryObj } from "@storybook/react";
import * as Mod from "${importBase}/${entry}";

// Scaffold auto-generado. TODO: componer una story real (ver CLAUDE.md).
const exportNames = Object.keys(Mod);

function Scaffold() {
  return (
    <div style={{ padding: 16, fontFamily: "monospace", fontSize: 13 }}>
      <p><strong>${entry}</strong> &mdash; story pendiente.</p>
      <p>Exports: {exportNames.join(", ")}</p>
    </div>
  );
}

const meta: Meta<typeof Scaffold> = { title: "${group}/${Name}", component: Scaffold };
export default meta;
type Story = StoryObj<typeof Scaffold>;

export const Default: Story = {};
`;
}

// Valida que los exports nombrados que la story va a importar EXISTAN en el
// source del entry. Sin esto, un entry en ARGS cuyo export real no es
// pascal(entry) (y no está en NAME_OVERRIDE) emite un import roto que
// revienta el build de Storybook.
function validateNamedExports(entry, pkgDir, names) {
  const srcPath = resolve(repoRoot, pkgDir, "src", `${entry}.tsx`);
  const alt = resolve(repoRoot, pkgDir, "src", `${entry}.ts`);
  const src = readFileSync(existsSync(srcPath) ? srcPath : alt, "utf8");
  return names.filter((n) => {
    const direct = new RegExp(`export\\s+(?:function|const|class|interface|type)\\s+${n}\\b`);
    const braced = new RegExp(`export\\s*\\{[^}]*\\b${n}\\b[^}]*\\}`, "s");
    return !direct.test(src) && !braced.test(src);
  });
}

const check = process.argv.includes("--check");
const planned = new Map(); // filename -> content

let nArgs = 0, nRender = 0, nScaffold = 0, nSkipped = 0;
const invalid = [];

for (const { pkg, importBase, group } of PACKAGES) {
  const pkgPath = resolve(repoRoot, pkg);
  if (!existsSync(pkgPath)) continue;
  const pkgDir = dirname(pkg);
  const json = JSON.parse(readFileSync(pkgPath, "utf8"));
  const entries = Object.keys(json.exports ?? {})
    .map((k) => k.replace(/^\.\//, ""))
    .filter((k) => k !== "." && isComponentEntry(k));

  for (const entry of entries) {
    if (HANDWRITTEN.has(entry)) { nSkipped++; continue; }
    const isUi = importBase === "@lindaui/ui";
    let content, kind;
    if (isUi && entry in ARGS) {
      const missing = validateNamedExports(entry, pkgDir, [compName(entry)]);
      if (missing.length) invalid.push(`${entry}: export "${missing[0]}" no existe (¿falta NAME_OVERRIDE?)`);
      content = argsStory(entry, importBase); kind = "args";
    } else if (isUi && entry in RENDER) {
      const used = [...new Set([...(RENDER[entry].jsx.matchAll(/M\.([A-Za-z0-9]+)/g))].map((m) => m[1]))];
      const missing = validateNamedExports(entry, pkgDir, used);
      if (missing.length) invalid.push(`${entry}: exports [${missing.join(", ")}] no existen en el source`);
      content = renderStory(entry, importBase); kind = "render";
    } else {
      content = scaffoldStory(entry, importBase, group); kind = "scaffold";
    }
    planned.set(`${entry}.stories.tsx`, content);
    if (kind === "args") nArgs++;
    else if (kind === "render") nRender++;
    else nScaffold++;
  }
}

if (invalid.length) {
  console.error("✗ gen-stories: imports que no resolverían:");
  for (const msg of invalid) console.error(`  ${msg}`);
  process.exit(1);
}

if (check) {
  const onDisk = existsSync(outDir)
    ? readdirSync(outDir).filter((f) => f.endsWith(".stories.tsx"))
    : [];
  const missing = [...planned.keys()].filter((f) => !onDisk.includes(f));
  const extra = onDisk.filter((f) => !planned.has(f));
  const stale = [...planned.keys()].filter(
    (f) => onDisk.includes(f) && readFileSync(resolve(outDir, f), "utf8") !== planned.get(f),
  );
  if (missing.length || extra.length || stale.length) {
    console.error("✗ stories generadas desincronizadas:");
    if (missing.length) console.error(`  faltan: ${missing.join(", ")}`);
    if (extra.length) console.error(`  huérfanas: ${extra.join(", ")}`);
    if (stale.length) console.error(`  desactualizadas: ${stale.join(", ")}`);
    console.error("  Corré: pnpm --filter @lindaui/storybook gen:stories");
    process.exit(1);
  }
  console.log(`✓ stories generadas en sync (${planned.size} archivos)`);
  process.exit(0);
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
for (const [file, content] of planned) writeFileSync(resolve(outDir, file), content, "utf8");

console.log(
  `Generadas ${nArgs + nRender + nScaffold} stories ` +
    `(${nArgs} args/controls, ${nRender} render compuesto, ${nScaffold} scaffold). ` +
    `Saltadas ${nSkipped} a mano.`,
);
