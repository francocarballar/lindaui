import type { Meta, StoryObj } from "@storybook/react-vite";
import { PieChart } from "@ts/blocks/pie-chart";
import type { ChartConfig } from "@ts/ui/chart";

const meta: Meta<typeof PieChart> = { title: "Charts/PieChart", component: PieChart };
export default meta;
type Story = StoryObj<typeof PieChart>;

const data = [
  { modalidad: "RMN", total: 340 },
  { modalidad: "TC", total: 210 },
  { modalidad: "ECO", total: 160 },
  { modalidad: "RX", total: 95 },
];
const config: ChartConfig = {
  RMN: { label: "RMN", color: "var(--chart-1)" },
  TC: { label: "TC", color: "var(--chart-2)" },
  ECO: { label: "ECO", color: "var(--chart-3)" },
  RX: { label: "RX", color: "var(--chart-4)" },
};
const Wrap = (p: { children: React.ReactNode }) => (
  <div className="w-[420px] max-w-full">{p.children}</div>
);

export const Pie: Story = {
  render: () => <Wrap><PieChart data={data} config={config} categoryKey="modalidad" valueKey="total" /></Wrap>,
};
export const Donut: Story = {
  render: () => <Wrap><PieChart data={data} config={config} categoryKey="modalidad" valueKey="total" variant="donut" /></Wrap>,
};
export const WithLabel: Story = {
  render: () => <Wrap><PieChart data={data} config={config} categoryKey="modalidad" valueKey="total" variant="label" /></Wrap>,
};
