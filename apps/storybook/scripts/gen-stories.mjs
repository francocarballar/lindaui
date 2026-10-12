// Codegen de stories. Lee el `exports` map de cada paquete del design system
// y emite un .stories.tsx por entry en src/stories/generated/.
//
// Dos modos:
//   ARGS     -> meta { component, args } + Default {}. Storybook renderiza
//               <X {...args}/> y autogenera CONTROLS desde los tipos (react-docgen).
//   RENDER   -> render fn con composición real (compound/cross-entry). Smoke visual.
// Todo entry nuevo requiere una demo real: faltar una composición falla antes de escribir.
//
// Idempotente: re-correr sobrescribe generated/. NO toca stories a mano.
// Uso: node scripts/gen-stories.mjs [--check]
//   --check: no escribe; exit 1 si generated/ difiere de lo que se generaría
//            (para CI, igual que gen:exports --check).

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
export function generateStories({ repoRoot = resolve(__dirname, "../../.."), check = false, log = console.log, error = console.error } = {}) {
const outDir = resolve(repoRoot, "apps/storybook/src/stories/generated");

const PACKAGES = [
  { pkg: "packages/ui/package.json", importBase: "@lindaui/ui" },
  { pkg: "packages/blocks/package.json", importBase: "@lindaui/blocks" },
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

// Las features nuevas tienen demos completas escritas a mano. Detectarlas por
// nombre evita generar demos duplicadas o colisionar con stories en subcarpetas.
function collectHandwritten(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "generated") continue;
    const location = resolve(dir, entry.name);
    if (entry.isDirectory()) collectHandwritten(location);
    else if (entry.name.endsWith(".stories.tsx")) {
      HANDWRITTEN.add(entry.name.replace(/\.stories\.tsx$/, ""));
    }
  }
}
collectHandwritten(resolve(repoRoot, "apps/storybook/src/stories"));
collectHandwritten(resolve(repoRoot, "packages/blocks/src"));

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
  "alert-dialog": {
    imports: ['import { useState } from "react";', 'import { Button } from "@lindaui/ui/button";',
      'function AlertDemo() { const [open, setOpen] = useState(false); const [confirmed, setConfirmed] = useState(false); return <><Button onPress={() => setOpen(true)}>Eliminar registro</Button><M.AlertDialog open={open} onClose={() => setOpen(false)} onConfirm={() => { setConfirmed(true); setOpen(false); }} title="¿Eliminar registro?" description="Esta acción elimina el registro seleccionado." confirmLabel="Eliminar" cancelLabel="Cancelar" isDestructive /><output role="status">{confirmed ? "Registro eliminado" : "Registro conservado"}</output></>; }'],
    jsx: '<AlertDemo />',
  },
  drawer: {
    jsx: '<M.Drawer><M.Drawer.Trigger>Abrir panel</M.Drawer.Trigger><M.Drawer.Backdrop><M.Drawer.Content><M.Drawer.Dialog><M.Drawer.Header><M.Drawer.Heading>Detalle del turno</M.Drawer.Heading></M.Drawer.Header><M.Drawer.Body>Turno confirmado para mañana.</M.Drawer.Body><M.Drawer.Footer><M.Drawer.CloseTrigger aria-label="Cerrar panel">Cerrar panel</M.Drawer.CloseTrigger></M.Drawer.Footer></M.Drawer.Dialog></M.Drawer.Content></M.Drawer.Backdrop></M.Drawer>',
  },
  popover: {
    jsx: '<M.Popover><M.Popover.Trigger tabIndex={0}>Ver detalles</M.Popover.Trigger><M.Popover.Content><M.Popover.Dialog><M.Popover.Heading>Información del turno</M.Popover.Heading><p>Traé tu documento de identidad.</p></M.Popover.Dialog></M.Popover.Content></M.Popover>',
  },
  toast: {
    imports: ['import { useEffect } from "react";', 'import { Button } from "@lindaui/ui/button";',
      'function ToastDemo() { useEffect(() => () => M.toastQueue.clear(), []); return <><M.ToastProvider /><Button onPress={() => M.toast.success("Cambios guardados", {description: "Tu información está actualizada.", timeout: 0})}>Guardar cambios</Button></>; }'],
    jsx: '<ToastDemo />',
  },
  "color-swatch-picker": {
    imports: ['import { useState } from "react";',
      'function SwatchesDemo() { const [color, setColor] = useState("#7c3aed"); return <><M.ColorSwatchPicker aria-label="Color del tema" value={color} onChange={value => setColor(value.toString("hex"))}>{["#7c3aed", "#0d9488", "#e11d48"].map(value => <M.ColorSwatchPicker.Item key={value} color={value}><M.ColorSwatchPicker.Swatch /><M.ColorSwatchPicker.Indicator /></M.ColorSwatchPicker.Item>)}</M.ColorSwatchPicker><output role="status">{color}</output></>; }'],
    jsx: '<SwatchesDemo />',
  },
  "color-picker": {
    imports: ['import { useState } from "react";', 'import { ColorArea, ColorSlider } from "@lindaui/ui/compound";',
      'function ColorPickerDemo() { const [color, setColor] = useState("#7c3aed"); return <><M.ColorPicker value={color} onChange={value => setColor(value.toString("hex"))}><M.ColorPicker.Trigger>Elegir color</M.ColorPicker.Trigger><M.ColorPicker.Popover><ColorArea aria-label="Saturación y brillo" colorSpace="hsb" xChannel="saturation" yChannel="brightness"><ColorArea.Thumb /></ColorArea><ColorSlider aria-label="Tono" colorSpace="hsb" channel="hue"><ColorSlider.Track><ColorSlider.Thumb /></ColorSlider.Track></ColorSlider></M.ColorPicker.Popover></M.ColorPicker><output role="status">{color}</output></>; }'],
    jsx: '<ColorPickerDemo />',
  },
  "date-picker": {
    imports: ['import { parseDate } from "@internationalized/date";', 'import { Label, DateField, Calendar } from "@lindaui/ui/compound";'],
    jsx: '<M.DatePicker defaultValue={parseDate("2026-10-12")}><Label>Fecha del turno</Label><DateField.Group><DateField.Input>{segment => <DateField.Segment segment={segment} />}</DateField.Input><DateField.Suffix><M.DatePicker.Trigger aria-label="Elegir fecha"><M.DatePicker.TriggerIndicator /></M.DatePicker.Trigger></DateField.Suffix></DateField.Group><M.DatePicker.Popover><Calendar aria-label="Fecha del turno"><Calendar.Header><Calendar.NavButton slot="previous" /><Calendar.Heading /><Calendar.NavButton slot="next" /></Calendar.Header><Calendar.Grid><Calendar.GridHeader>{day => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}</Calendar.GridHeader><Calendar.GridBody>{date => <Calendar.Cell date={date} />}</Calendar.GridBody></Calendar.Grid></Calendar></M.DatePicker.Popover></M.DatePicker>',
  },
  "date-range-picker": {
    imports: ['import { parseDate } from "@internationalized/date";', 'import { Label, DateField, RangeCalendar } from "@lindaui/ui/compound";'],
    jsx: '<M.DateRangePicker defaultValue={{start: parseDate("2026-10-12"), end: parseDate("2026-10-15")}}><Label>Período</Label><DateField.Group><DateField.InputContainer><DateField.Input slot="start">{segment => <DateField.Segment segment={segment} />}</DateField.Input><M.DateRangePicker.RangeSeparator /><DateField.Input slot="end">{segment => <DateField.Segment segment={segment} />}</DateField.Input></DateField.InputContainer><DateField.Suffix><M.DateRangePicker.Trigger aria-label="Elegir período"><M.DateRangePicker.TriggerIndicator /></M.DateRangePicker.Trigger></DateField.Suffix></DateField.Group><M.DateRangePicker.Popover><RangeCalendar aria-label="Período"><RangeCalendar.Header><RangeCalendar.NavButton slot="previous" /><RangeCalendar.Heading /><RangeCalendar.NavButton slot="next" /></RangeCalendar.Header><RangeCalendar.Grid><RangeCalendar.GridHeader>{day => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}</RangeCalendar.GridHeader><RangeCalendar.GridBody>{date => <RangeCalendar.Cell date={date} />}</RangeCalendar.GridBody></RangeCalendar.Grid></RangeCalendar></M.DateRangePicker.Popover></M.DateRangePicker>',
  },
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
  radio: {
    imports: ['import { RadioGroup } from "@lindaui/ui/radio-group";'],
    jsx: '<RadioGroup aria-label="Entrega" defaultValue="normal"><M.Radio value="normal">Normal</M.Radio><M.Radio value="express">Express</M.Radio></RadioGroup>',
  },
  "switch-group": {
    imports: ['import { Switch } from "@lindaui/ui/switch";'],
    jsx: '<M.SwitchGroup aria-label="Notificaciones"><Switch defaultSelected>Correo electrónico</Switch><Switch>Mensajes de texto</Switch></M.SwitchGroup>',
  },
  "input-group": {
    imports: ['import { InputGroup as Parts } from "@lindaui/ui/compound";'],
    jsx: '<M.InputGroup><Parts.Prefix>$</Parts.Prefix><Parts.Input aria-label="Importe" placeholder="0.00" /><Parts.Suffix>USD</Parts.Suffix></M.InputGroup>',
  },
  pagination: {
    imports: [
      'import { useState } from "react";',
      'function PaginationDemo() { const [page, setPage] = useState(1); return <M.Pagination aria-label="Páginas"><M.Pagination.Content><M.Pagination.Item><M.Pagination.Previous isDisabled={page === 1} onPress={() => setPage(page - 1)}>Anterior</M.Pagination.Previous></M.Pagination.Item>{[1, 2, 3].map(value => <M.Pagination.Item key={value}><M.Pagination.Link isActive={page === value} onPress={() => setPage(value)}>{value}</M.Pagination.Link></M.Pagination.Item>)}<M.Pagination.Item><M.Pagination.Next isDisabled={page === 3} onPress={() => setPage(page + 1)}>Siguiente</M.Pagination.Next></M.Pagination.Item></M.Pagination.Content><M.Pagination.Summary><output role="status">Página {page} de 3</output></M.Pagination.Summary></M.Pagination>; }',
    ],
    jsx: '<PaginationDemo />',
  },
  tooltip: {
    imports: ['import { Button } from "@lindaui/ui/button";'],
    jsx: '<M.Tooltip delay={0}><M.Tooltip.Trigger><Button>Ayuda</Button></M.Tooltip.Trigger><M.Tooltip.Content>Información adicional</M.Tooltip.Content></M.Tooltip>',
  },
  "color-field": {
    jsx: '<M.ColorField aria-label="Color" defaultValue="#7c3aed"><M.ColorField.Group><M.ColorField.Input /></M.ColorField.Group></M.ColorField>',
  },
  "color-swatch": {
    jsx: '<M.ColorSwatch color="#7c3aed" aria-label="Violeta" />',
  },
  "color-area": {
    jsx: '<M.ColorArea aria-label="Saturación y brillo" defaultValue="#7c3aed" colorSpace="hsb" xChannel="saturation" yChannel="brightness"><M.ColorArea.Thumb /></M.ColorArea>',
  },
  "color-slider": {
    jsx: '<M.ColorSlider aria-label="Tono" channel="hue" colorSpace="hsl" defaultValue="#7c3aed"><M.ColorSlider.Track><M.ColorSlider.Thumb /></M.ColorSlider.Track><M.ColorSlider.Output /></M.ColorSlider>',
  },
  "toggle-button-group": {
    imports: ['import { ToggleButton } from "@lindaui/ui/toggle-button";'],
    jsx: '<M.ToggleButtonGroup aria-label="Alineación" selectionMode="single" defaultSelectedKeys={["left"]}><ToggleButton id="left">Izquierda</ToggleButton><ToggleButton id="center">Centro</ToggleButton><ToggleButton id="right">Derecha</ToggleButton></M.ToggleButtonGroup>',
  },
  "disclosure-group": {
    imports: ['import { Disclosure, DisclosureHeading, DisclosureTrigger, DisclosureContent } from "@lindaui/ui/disclosure";'],
    jsx: '<M.DisclosureGroup><Disclosure id="shipping"><DisclosureHeading><DisclosureTrigger>Envíos</DisclosureTrigger></DisclosureHeading><DisclosureContent>Entregamos en todo el país.</DisclosureContent></Disclosure><Disclosure id="returns"><DisclosureHeading><DisclosureTrigger>Devoluciones</DisclosureTrigger></DisclosureHeading><DisclosureContent>Podés devolver tu pedido dentro de 30 días.</DisclosureContent></Disclosure></M.DisclosureGroup>',
  },
  tag: {
    imports: ['import { TagGroup } from "@lindaui/ui/tag-group";'],
    jsx: '<TagGroup aria-label="Tecnologías"><TagGroup.List><M.Tag id="react">React</M.Tag><M.Tag id="typescript">TypeScript</M.Tag></TagGroup.List></TagGroup>',
  },
  "tag-group": {
    imports: ['import { Tag } from "@lindaui/ui/tag";', 'import { useState } from "react";',
      'function TagsDemo() { const [tags, setTags] = useState(["React", "TypeScript", "LindaUI"]); return <M.TagGroup aria-label="Tecnologías" onRemove={keys => setTags(current => current.filter(tag => !keys.has(tag)))}><M.TagGroup.List>{tags.map(tag => <Tag key={tag} id={tag}>{tag}<Tag.RemoveButton /></Tag>)}</M.TagGroup.List></M.TagGroup>; }'],
    jsx: '<TagsDemo />',
  },
  "date-input": {
    imports: ['import { parseDate } from "@internationalized/date";', 'import { Label } from "@lindaui/ui/compound";'],
    jsx: '<M.DateInput defaultValue={parseDate("2026-10-12")}><Label>Fecha del turno</Label><M.DateInput.Group><M.DateInput.Input>{segment => <M.DateInput.Segment segment={segment} />}</M.DateInput.Input></M.DateInput.Group></M.DateInput>',
  },
  "time-input": {
    imports: ['import { Time } from "@internationalized/date";', 'import { Label } from "@lindaui/ui/compound";'],
    jsx: '<M.TimeInput defaultValue={new Time(14, 30)} hourCycle={24}><Label>Hora del turno</Label><M.TimeInput.Group><M.TimeInput.Input>{segment => <M.TimeInput.Segment segment={segment} />}</M.TimeInput.Input></M.TimeInput.Group></M.TimeInput>',
  },
  calendar: {
    imports: ['import { parseDate } from "@internationalized/date";'],
    jsx: '<M.Calendar aria-label="Fecha del turno" defaultValue={parseDate("2026-10-12")}><M.Calendar.Header><M.Calendar.NavButton slot="previous" /><M.Calendar.Heading /><M.Calendar.NavButton slot="next" /></M.Calendar.Header><M.Calendar.Grid><M.Calendar.GridHeader>{day => <M.Calendar.HeaderCell>{day}</M.Calendar.HeaderCell>}</M.Calendar.GridHeader><M.Calendar.GridBody>{date => <M.Calendar.Cell date={date} />}</M.Calendar.GridBody></M.Calendar.Grid></M.Calendar>',
  },
  "range-calendar": {
    imports: ['import { parseDate } from "@internationalized/date";'],
    jsx: '<M.RangeCalendar aria-label="Período" defaultValue={{start: parseDate("2026-10-12"), end: parseDate("2026-10-15")}}><M.RangeCalendar.Header><M.RangeCalendar.NavButton slot="previous" /><M.RangeCalendar.Heading /><M.RangeCalendar.NavButton slot="next" /></M.RangeCalendar.Header><M.RangeCalendar.Grid><M.RangeCalendar.GridHeader>{day => <M.RangeCalendar.HeaderCell>{day}</M.RangeCalendar.HeaderCell>}</M.RangeCalendar.GridHeader><M.RangeCalendar.GridBody>{date => <M.RangeCalendar.Cell date={date} />}</M.RangeCalendar.GridBody></M.RangeCalendar.Grid></M.RangeCalendar>',
  },
  "checkbox-group": {
    imports: ['import { Checkbox } from "@lindaui/ui/checkbox";'],
    jsx: '<M.CheckboxGroup aria-label="Opciones" defaultValue={["a"]}><Checkbox value="a">Opción A</Checkbox><Checkbox value="b">Opción B</Checkbox></M.CheckboxGroup>',
  },
};

const BLOCK_RENDER = {
  "audio-player": {
    jsx: '<div className="w-full max-w-xs"><M.AudioPlayer src="/audio/demo.wav" durationSeconds={5} /></div>',
  },
  "chat-header": {
    imports: ['import { ChatAvatar } from "@lindaui/blocks/chat-avatar";'],
    jsx: '<M.ChatHeader title="Ada Lovelace" subtitle="En línea" avatar={<ChatAvatar name="Ada Lovelace" />} />',
  },
  "chat-layout": {
    imports: ['import { useState } from "react";', 'import { Button } from "@lindaui/ui/button";',
      'function ChatLayoutDemo() { const [panel, setPanel] = useState<"sidebar" | "main" | "detail">("sidebar"); return <div className="h-80"><div className="flex gap-2">{(["sidebar", "main", "detail"] as const).map(value => <Button key={value} onPress={() => setPanel(value)}>{value}</Button>)}</div><M.ChatLayout activePanel={panel} sidebar={<p className="p-4">Conversaciones</p>} main={<p className="p-4">Mensajes</p>} detail={<p className="p-4">Detalles del contacto</p>} /></div>; }'],
    jsx: '<ChatLayoutDemo />',
  },
  "message-composer": {
    imports: ['import { useState } from "react";',
      'function ComposerDemo() { const [value, setValue] = useState(""); const [sent, setSent] = useState(""); return <div className="w-full max-w-lg"><M.MessageComposer value={value} onValueChange={setValue} onSend={() => { setSent(value); setValue(""); }} /><output role="status">{sent ? `Enviado: ${sent}` : "Sin mensajes enviados"}</output></div>; }'],
    jsx: '<ComposerDemo />',
  },
  "conversation-list-item": {
    imports: ['import { useState } from "react";',
      'function ConversationItemDemo() { const [selected, setSelected] = useState(false); return <M.ConversationListItem conversation={{id: "ada", title: "Ada Lovelace", subtitle: "¿Confirmamos el turno?", unreadCount: 2, lastMessageAt: "2026-10-12T12:00:00Z"}} selected={selected} onSelect={() => setSelected(!selected)} />; }'],
    jsx: '<ConversationItemDemo />',
  },
  "conversation-list": {
    imports: ['import { useState } from "react";',
      'function ConversationsDemo() { const [selected, setSelected] = useState("ada"); const [search, setSearch] = useState(""); const contacts = [{id: "ada", title: "Ada Lovelace", subtitle: "Turno confirmado", unreadCount: 2}, {id: "grace", title: "Grace Hopper", subtitle: "Nueva consulta"}]; return <div className="h-80 max-w-sm"><M.ConversationList conversations={contacts.filter(contact => contact.title.toLowerCase().includes(search.toLowerCase()))} selectedId={selected} onSelect={setSelected} searchValue={search} onSearchChange={setSearch} /></div>; }'],
    jsx: '<ConversationsDemo />',
  },
  "entity-health-card": {
    jsx: '<M.EntityHealthCard title="Salud del sistema" description="Estado de las integraciones" items={[{id: "messages", label: "Mensajes", value: 128, status: "success", statusLabel: "Operativo"}, {id: "queue", label: "Cola pendiente", value: 3, status: "warning", statusLabel: "Pendiente"}]} />',
  },
  "message-bubble": {
    jsx: '<div className="w-full max-w-lg space-y-3"><M.MessageBubble message={{id: "incoming", side: "incoming", text: "¿Podemos confirmar el turno?", sentAt: "2026-10-12T12:00:00Z"}} /><M.MessageBubble message={{id: "outgoing", side: "outgoing", text: "Sí, te esperamos mañana.", sentAt: "2026-10-12T12:01:00Z", status: "read"}} /></div>',
  },
  "conversation-thread": {
    jsx: '<div className="h-80 w-full max-w-lg"><M.ConversationThread messages={[{id: "a", side: "incoming", text: "Consulta del lunes", sentAt: "2026-10-12T12:00:00Z"}, {id: "b", side: "outgoing", text: "Respuesta del martes", sentAt: "2026-10-13T12:00:00Z", status: "delivered"}]} /></div>',
  },
  "table-pane": {
    imports: ['import { useState } from "react";',
      'function TablePaneDemo() { const [search, setSearch] = useState(""); const rows = [{name: "Ada Lovelace", status: "Confirmado"}, {name: "Grace Hopper", status: "Pendiente"}]; const filtered = rows.filter(row => row.name.toLowerCase().includes(search.toLowerCase())); return <M.TablePane columns={[{key: "name", label: "Nombre"}, {key: "status", label: "Estado"}]} rows={filtered} ariaLabel="Turnos" searchValue={search} onSearchChange={setSearch} footerCount={{shown: filtered.length, total: rows.length}} />; }'],
    jsx: '<TablePaneDemo />',
  },
  "time-range-picker": {
    imports: ['import { useState } from "react";',
      'function TimeRangeDemo() { const [preset, setPreset] = useState("today"); const [range, setRange] = useState({start: "2026-10-12", end: "2026-10-15"}); return <div className="space-y-3"><M.TimeRangePicker activePreset={preset} onPresetChange={setPreset} range={range} onRangeChange={setRange} /><output role="status">{preset === "custom" ? `${range.start} → ${range.end}` : preset}</output></div>; }'],
    jsx: '<TimeRangeDemo />',
  },
  "fetching-indicator": {
    jsx: '<M.FetchingIndicator label="Actualizando conversaciones…" />',
  },
  "workspace-back-button": {
    jsx: '<M.WorkspaceBackButton href="#conversations" label="Volver a conversaciones" />',
  },
  "chat-time-divider": {
    jsx: '<M.ChatTimeDivider label="Esta mañana" />',
  },
  "chat-date-divider": {
    jsx: '<M.ChatDateDivider date="2026-10-12T12:00:00Z" />',
  },
  "chat-avatar": {
    jsx: '<div className="flex items-center gap-3"><M.ChatAvatar name="Ada Lovelace" size="sm" /><M.ChatAvatar name="Grace Hopper" /><M.ChatAvatar name="Alan Turing" size="lg" /></div>',
  },
  "empty-chat-view": {
    jsx: '<div className="h-80"><M.EmptyChatView title="Elegí una conversación" description="Los mensajes de la conversación seleccionada aparecerán aquí." /></div>',
  },
  "legacy-kpi-card": {
    imports: ['import { Users } from "lucide-react";'],
    jsx: '<div style={{ width: 280 }}><M.KPICard title="Contactos activos" value={128} icon={Users} color="primary" trend={{ value: 12, isPositive: true }} /></div>',
  },
  "status-filters": {
    imports: [
      'import { useState } from "react";',
      'function StatusFilterDemo() { const [selected, setSelected] = useState(["active"]); return <M.StatusFilters availableStatuses={["new", "active", "complete"]} selectedStatuses={selected} onStatusToggle={(status) => setSelected((current) => current.includes(status) ? current.filter((value) => value !== status) : [...current, status])} labels={{ new: "Nuevos", active: "Activos", complete: "Completados" }} colors={{ new: "primary", active: "warning", complete: "success" }} counts={{ new: 4, active: 8, complete: 2 }} />; }',
    ],
    jsx: '<StatusFilterDemo />',
  },
};

// Entries que no son componentes: no tiene sentido una story.
// "package.json" es el export estándar de tooling; use-* son hooks;
// cn/date/format/time-grouping son utils puras (sin JSX).
const NON_COMPONENT = new Set([
  "package.json", "cn", "date", "format", "time-grouping", "chat-types",
  "compound", "motion", "notifications", "charts", "aria",
  "chat", "analytics", "compat",
]);
const isComponentEntry = (entry) => !NON_COMPONENT.has(entry)
  && !entry.startsWith("use-") && !entry.startsWith("compat-");

const pascal = (s) =>
  s.split("-").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join("");

// Export cuyo nombre no es pascal(entry) (camel interno).
const NAME_OVERRIDE = { combobox: "ComboBox", listbox: "ListBox" };
const compName = (entry) => Object.hasOwn(NAME_OVERRIDE, entry) ? NAME_OVERRIDE[entry] : pascal(entry);

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

function renderStory(entry, importBase, renders = RENDER) {
  const Name = pascal(entry);
  const { jsx, imports = [] } = renders[entry];
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

const planned = new Map(); // filename -> content

let nArgs = 0, nRender = 0, nSkipped = 0;
const invalid = [];

for (const { pkg, importBase } of PACKAGES) {
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
    if (isUi && Object.hasOwn(ARGS, entry)) {
      const missing = validateNamedExports(entry, pkgDir, [compName(entry)]);
      if (missing.length) invalid.push(`${entry}: export "${missing[0]}" no existe (¿falta NAME_OVERRIDE?)`);
      content = argsStory(entry, importBase); kind = "args";
    } else if (isUi && Object.hasOwn(RENDER, entry)) {
      const used = [...new Set([...(RENDER[entry].jsx.matchAll(/M\.([A-Za-z0-9]+)/g))].map((m) => m[1]))];
      const missing = validateNamedExports(entry, pkgDir, used);
      if (missing.length) invalid.push(`${entry}: exports [${missing.join(", ")}] no existen en el source`);
      content = renderStory(entry, importBase); kind = "render";
    } else if (!isUi && Object.hasOwn(BLOCK_RENDER, entry)) {
      const used = [...new Set([...(BLOCK_RENDER[entry].jsx.matchAll(/M\.([A-Za-z0-9]+)/g))].map((m) => m[1]))];
      const missing = validateNamedExports(entry, pkgDir, used);
      if (missing.length) invalid.push(`${entry}: exports [${missing.join(", ")}] no existen en el source`);
      content = renderStory(entry, importBase, BLOCK_RENDER); kind = "render";
    } else {
      invalid.push(`${entry}: falta una composición real en ARGS/RENDER o una story manual`);
      continue;
    }
    planned.set(`${entry}.stories.tsx`, content);
    if (kind === "args") nArgs++;
    else nRender++;
  }
}

if (invalid.length) {
  error("✗ gen-stories: demos inválidas o faltantes:");
  for (const msg of invalid) error(`  ${msg}`);
  return 1;
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
    error("✗ stories generadas desincronizadas:");
    if (missing.length) error(`  faltan: ${missing.join(", ")}`);
    if (extra.length) error(`  huérfanas: ${extra.join(", ")}`);
    if (stale.length) error(`  desactualizadas: ${stale.join(", ")}`);
    error("  Corré: pnpm --filter @lindaui/storybook gen:stories");
    return 1;
  }
  log(`✓ stories generadas en sync (${planned.size} archivos)`);
  return 0;
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
for (const [file, content] of planned) writeFileSync(resolve(outDir, file), content, "utf8");

log(
  `Generadas ${nArgs + nRender} stories ` +
    `(${nArgs} args/controls, ${nRender} render compuesto). ` +
    `Saltadas ${nSkipped} a mano.`,
);

return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = generateStories({ check: process.argv.includes("--check") });
}
