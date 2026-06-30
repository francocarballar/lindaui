import type { Meta, StoryObj } from "@storybook/react";
import { Table } from "@lindaui/ui/table";

const columns = [
  { key: "paciente", label: "Paciente" },
  { key: "estudio", label: "Estudio" },
  { key: "estado", label: "Estado" },
];

const rows = [
  { id: "1", paciente: "Juan Pérez", estudio: "RMN Rodilla", estado: "Pendiente" },
  { id: "2", paciente: "María Gómez", estudio: "TAC Cerebro", estado: "Firmado" },
  { id: "3", paciente: "Carlos Ruiz", estudio: "ECO Abdominal", estado: "Pendiente" },
];

const meta: Meta<typeof Table> = {
  title: "Data/Table",
  component: Table,
  args: { columns, rows, "aria-label": "Estudios" },
};
export default meta;
type Story = StoryObj<typeof Table>;

export const Default: Story = {};

export const Vacia: Story = {
  args: { columns, rows: [], emptyContent: "Sin estudios cargados" },
};
