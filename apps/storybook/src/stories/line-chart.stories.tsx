import type { Meta, StoryObj } from "@storybook/react-vite";
import { LineChart } from "@ts/blocks/line-chart";
import type { ChartConfig } from "@ts/ui/chart";

const meta: Meta<typeof LineChart> = { title: "Charts/LineChart", component: LineChart };
export default meta;
type Story = StoryObj<typeof LineChart>;

const data = [
  { mes: "Ene", tiempo: 42, objetivo: 30 },
  { mes: "Feb", tiempo: 38, objetivo: 30 },
  { mes: "Mar", tiempo: 35, objetivo: 30 },
  { mes: "Abr", tiempo: 31, objetivo: 30 },
  { mes: "May", tiempo: 28, objetivo: 30 },
  { mes: "Jun", tiempo: 26, objetivo: 30 },
];
const config: ChartConfig = {
  tiempo: { label: "Tiempo a informe (min)", color: "var(--chart-1)" },
  objetivo: { label: "Objetivo", color: "var(--chart-4)" },
};
const Wrap = (p: { children: React.ReactNode }) => (
  <div className="w-[600px] max-w-full">{p.children}</div>
);

export const Default: Story = {
  render: () => <Wrap><LineChart data={data} config={config} categoryKey="mes" series={["tiempo"]} /></Wrap>,
};
export const Dots: Story = {
  render: () => <Wrap><LineChart data={data} config={config} categoryKey="mes" series={["tiempo"]} variant="dots" /></Wrap>,
};
export const MultiSeries: Story = {
  render: () => <Wrap><LineChart data={data} config={config} categoryKey="mes" series={["tiempo", "objetivo"]} /></Wrap>,
};
