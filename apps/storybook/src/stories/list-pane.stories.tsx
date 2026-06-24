import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { User } from "lucide-react";
import { ListPane } from "@ts/blocks/list-pane";
import { ListItem } from "@ts/blocks/list-item";
import { matchesSearch } from "@ts/ui/search";

const meta: Meta<typeof ListPane> = {
  title: "Blocks/ListPane",
  component: ListPane,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof ListPane>;

const STUDIES = [
  { estado: "signed", title: "García Pérez, María", subtitle: "RMN Rodilla Derecha", meta: "12/06/2026", badge: { label: "FIRMADO", variant: "success" as const } },
  { estado: "pending", title: "López Torres, Juan", subtitle: "RX Tórax AP", meta: "10/06/2026", badge: { label: "PENDIENTE", variant: "warning" as const } },
  { estado: "other", title: "Rodríguez Sáenz, Ana", subtitle: "TC Abdomen c/c", meta: "08/06/2026", badge: { label: "URGENTE", variant: "danger" as const } },
  { estado: "other", title: "Fernández Díaz, Carlos", subtitle: "ECO Tiroides", meta: "05/06/2026", badge: { label: "ENVIADO", variant: "info" as const } },
  { estado: "signed", title: "Martínez Ruiz, Lucía", subtitle: "RMN Columna Lumbar", meta: "03/06/2026", badge: { label: "FIRMADO", variant: "success" as const } },
];

export const Default: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [search, setSearch] = useState("");
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [filter, setFilter] = useState("all");
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [selected, setSelected] = useState<string>(STUDIES[0].title);

    // ListPane es CONTROLADO: no filtra solo. El consumidor deriva la lista
    // visible desde su propio estado (filtro de estado + búsqueda) y pasa los
    // items ya filtrados como children. Acá se ve el filtrado real.
    const visible = STUDIES.filter((s) => {
      const byFilter = filter === "all" || s.estado === filter;
      // matchesSearch normaliza mayúsculas + acentos en ambos lados →
      // "maria" matchea "García Pérez, María".
      const bySearch =
        matchesSearch(s.title, search) || matchesSearch(s.subtitle, search);
      return byFilter && bySearch;
    });

    // Counts derivados del dataset (no hardcodeados) para que matcheen el filtro.
    const filters = [
      { key: "all", label: "Todos", count: STUDIES.length },
      { key: "pending", label: "Pendientes", count: STUDIES.filter((s) => s.estado === "pending").length },
      { key: "signed", label: "Firmados", count: STUDIES.filter((s) => s.estado === "signed").length },
    ];

    return (
      <div className="h-[600px] w-[380px] border border-border rounded-xl overflow-hidden">
        <ListPane
          filters={filters}
          activeFilter={filter}
          onFilterChange={setFilter}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Buscar paciente o estudio…"
          isEmpty={visible.length === 0}
          emptyTitle="Sin estudios para este filtro"
          emptyDescription="Probá con otro filtro o término de búsqueda."
        >
          {visible.map(({ estado, ...item }) => (
            <ListItem
              key={item.title}
              {...item}
              selected={selected === item.title}
              onSelect={() => setSelected(item.title)}
              showChevron
              leading={
                <div className="grid h-[42px] w-[42px] place-items-center rounded-[11px] bg-secondary">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
              }
            />
          ))}
        </ListPane>
      </div>
    );
  },
};

export const Loading: Story = {
  render: () => (
    <div className="h-[600px] w-[380px] border border-border rounded-xl overflow-hidden">
      <ListPane loading searchValue="" />
    </div>
  ),
};

export const Error: Story = {
  render: () => (
    <div className="h-[600px] w-[380px] border border-border rounded-xl overflow-hidden">
      <ListPane
        error="Error al conectar con el servidor de estudios"
        onRetry={() => alert("Reintentando…")}
        searchValue=""
      />
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <div className="h-[600px] w-[380px] border border-border rounded-xl overflow-hidden">
      <ListPane
        isEmpty
        emptyTitle="Sin estudios para este filtro"
        emptyDescription="Probá con otro término de búsqueda o cambiá el filtro activo."
        searchValue="rmn rodilla"
      />
    </div>
  ),
};
