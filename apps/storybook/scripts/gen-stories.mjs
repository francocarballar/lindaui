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
// Uso: node scripts/gen-stories.mjs

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
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

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

let nArgs = 0, nRender = 0, nScaffold = 0, nSkipped = 0;

for (const { pkg, importBase, group } of PACKAGES) {
  const pkgPath = resolve(repoRoot, pkg);
  if (!existsSync(pkgPath)) continue;
  const json = JSON.parse(readFileSync(pkgPath, "utf8"));
  const entries = Object.keys(json.exports ?? {})
    .map((k) => k.replace(/^\.\//, ""))
    .filter((k) => k !== ".");

  for (const entry of entries) {
    if (HANDWRITTEN.has(entry)) { nSkipped++; continue; }
    const isUi = importBase === "@lindaui/ui";
    let content, kind;
    if (isUi && entry in ARGS) { content = argsStory(entry, importBase); kind = "args"; }
    else if (isUi && entry in RENDER) { content = renderStory(entry, importBase); kind = "render"; }
    else { content = scaffoldStory(entry, importBase, group); kind = "scaffold"; }
    writeFileSync(resolve(outDir, `${entry}.stories.tsx`), content, "utf8");
    if (kind === "args") nArgs++;
    else if (kind === "render") nRender++;
    else nScaffold++;
  }
}

console.log(
  `Generadas ${nArgs + nRender + nScaffold} stories ` +
    `(${nArgs} args/controls, ${nRender} render compuesto, ${nScaffold} scaffold). ` +
    `Saltadas ${nSkipped} a mano.`,
);
