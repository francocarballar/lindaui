import type { Meta, StoryObj } from "@storybook/react-vite";
import { AreaChart } from "@ts/blocks/area-chart";
import type { ChartConfig } from "@ts/ui/chart";

const meta: Meta<typeof AreaChart> = { title: "Charts/AreaChart", component: AreaChart };
export default meta;
type Story = StoryObj<typeof AreaChart>;

const data = [
  { mes: "Ene", rmn: 120, tc: 80, eco: 50 },
  { mes: "Feb", rmn: 132, tc: 90, eco: 62 },
  { mes: "Mar", rmn: 101, tc: 70, eco: 48 },
  { mes: "Abr", rmn: 148, tc: 96, eco: 70 },
  { mes: "May", rmn: 160, tc: 110, eco: 80 },
  { mes: "Jun", rmn: 175, tc: 120, eco: 88 },
];
const config: ChartConfig = {
  rmn: { label: "RMN", color: "var(--chart-1)" },
  tc: { label: "TC", color: "var(--chart-2)" },
  eco: { label: "ECO", color: "var(--chart-3)" },
};
const Wrap = (p: { children: React.ReactNode }) => (
  <div className="w-[600px] max-w-full">{p.children}</div>
);

export const Default: Story = {
  render: () => (
    <Wrap><AreaChart data={data} config={config} categoryKey="mes" series={["rmn"]} /></Wrap>
  ),
};
export const Stacked: Story = {
  render: () => (
    <Wrap>
      <AreaChart data={data} config={config} categoryKey="mes" series={["rmn", "tc", "eco"]} variant="stacked" />
    </Wrap>
  ),
};
export const Gradient: Story = {
  render: () => (
    <Wrap>
      <AreaChart data={data} config={config} categoryKey="mes" series={["rmn", "tc"]} variant="gradient" />
    </Wrap>
  ),
};
