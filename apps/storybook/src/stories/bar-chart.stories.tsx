import type { Meta, StoryObj } from "@storybook/react-vite";
import { BarChart } from "@ts/blocks/bar-chart";
import type { ChartConfig } from "@ts/ui/chart";

const meta: Meta<typeof BarChart> = { title: "Charts/BarChart", component: BarChart };
export default meta;
type Story = StoryObj<typeof BarChart>;

const data = [
  { mes: "Ene", informados: 90, pendientes: 30 },
  { mes: "Feb", informados: 110, pendientes: 22 },
  { mes: "Mar", informados: 85, pendientes: 40 },
  { mes: "Abr", informados: 130, pendientes: 18 },
  { mes: "May", informados: 145, pendientes: 25 },
];
const config: ChartConfig = {
  informados: { label: "Informados", color: "var(--chart-1)" },
  pendientes: { label: "Pendientes", color: "var(--chart-4)" },
};
const Wrap = (p: { children: React.ReactNode }) => (
  <div className="w-[600px] max-w-full">{p.children}</div>
);

export const Default: Story = {
  render: () => <Wrap><BarChart data={data} config={config} categoryKey="mes" series={["informados"]} /></Wrap>,
};
export const Grouped: Story = {
  render: () => <Wrap><BarChart data={data} config={config} categoryKey="mes" series={["informados", "pendientes"]} variant="grouped" /></Wrap>,
};
export const Stacked: Story = {
  render: () => <Wrap><BarChart data={data} config={config} categoryKey="mes" series={["informados", "pendientes"]} variant="stacked" /></Wrap>,
};
export const Horizontal: Story = {
  render: () => <Wrap><BarChart data={data} config={config} categoryKey="mes" series={["informados"]} variant="horizontal" /></Wrap>,
};
