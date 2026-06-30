import type { Meta, StoryObj } from "@storybook/react-vite";
import { RadialChart } from "@lindaui/blocks/radial-chart";
import type { ChartConfig } from "@lindaui/ui/chart";

const meta: Meta<typeof RadialChart> = { title: "Charts/RadialChart", component: RadialChart };
export default meta;
type Story = StoryObj<typeof RadialChart>;

const multi = [
  { modalidad: "RMN", informados: 80, pendientes: 20 },
];
const single = [
  { modalidad: "RMN", total: 80 },
  { modalidad: "TC", total: 62 },
  { modalidad: "ECO", total: 45 },
];
const config: ChartConfig = {
  informados: { label: "Informados", color: "var(--chart-1)" },
  pendientes: { label: "Pendientes", color: "var(--chart-4)" },
  total: { label: "Total", color: "var(--chart-2)" },
};
const Wrap = (p: { children: React.ReactNode }) => (
  <div className="w-[420px] max-w-full">{p.children}</div>
);

export const Default: Story = {
  render: () => <Wrap><RadialChart data={single} config={config} categoryKey="modalidad" series={["total"]} /></Wrap>,
};
export const Stacked: Story = {
  render: () => <Wrap><RadialChart data={multi} config={config} categoryKey="modalidad" series={["informados", "pendientes"]} variant="stacked" /></Wrap>,
};
export const WithLabel: Story = {
  render: () => <Wrap><RadialChart data={multi} config={config} categoryKey="modalidad" series={["informados", "pendientes"]} variant="label" /></Wrap>,
};
