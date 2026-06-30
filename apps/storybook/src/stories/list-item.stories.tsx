import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { FileText, User, Stethoscope } from "lucide-react";
import { ListItem } from "@lindaui/blocks/list-item";

const meta: Meta<typeof ListItem> = {
  title: "Blocks/ListItem",
  component: ListItem,
  args: {
    title: "García Pérez, María",
    subtitle: "RMN Rodilla Derecha",
    meta: "12/06/2026 — Dr. Martínez",
    showChevron: true,
  },
};
export default meta;
type Story = StoryObj<typeof ListItem>;

export const Playground: Story = {};

export const Selected: Story = {
  args: { selected: true },
};

export const WithBadge: Story = {
  args: {
    badge: { label: "FIRMADO", variant: "success" },
  },
};

export const WithLeading: Story = {
  render: () => (
    <div className="w-[360px]">
      <ListItem
        title="López Torres, Juan"
        subtitle="RX Tórax AP"
        meta="10/06/2026 — Dra. Romero"
        leading={
          <div className="grid h-[42px] w-[42px] place-items-center rounded-[11px] bg-secondary">
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>
        }
        badge={{ label: "PENDIENTE", variant: "warning" }}
        showChevron
      />
    </div>
  ),
};

export const States: Story = {
  render: () => {
    const items = [
      { title: "García Pérez, María", subtitle: "RMN Rodilla Derecha", meta: "12/06/2026", badge: { label: "FIRMADO", variant: "success" as const } },
      { title: "López Torres, Juan", subtitle: "RX Tórax AP", meta: "10/06/2026", badge: { label: "PENDIENTE", variant: "warning" as const } },
      { title: "Rodríguez Sáenz, Ana", subtitle: "TC Abdomen c/c", meta: "08/06/2026", badge: { label: "URGENTE", variant: "danger" as const } },
      { title: "Fernández Díaz, Carlos", subtitle: "ECO Tiroides", meta: "05/06/2026", badge: { label: "INFO", variant: "info" as const } },
    ];
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [selected, setSelected] = useState(0);
    return (
      <div className="w-[360px] border border-border rounded-xl overflow-hidden">
        {items.map((item, i) => (
          <ListItem
            key={i}
            {...item}
            selected={selected === i}
            onSelect={() => setSelected(i)}
            showChevron
            leading={
              <div className="grid h-[42px] w-[42px] place-items-center rounded-[11px] bg-secondary">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
            }
          />
        ))}
      </div>
    );
  },
};

export const NoChevron: Story = {
  args: {
    title: "Sánchez Mora, Roberto",
    subtitle: "Densitometría Ósea",
    showChevron: false,
    badge: { label: "ENVIADO", variant: "info" },
    leading: (
      <div className="grid h-[42px] w-[42px] place-items-center rounded-[11px] bg-secondary">
        <Stethoscope className="h-5 w-5 text-muted-foreground" />
      </div>
    ),
  },
};
