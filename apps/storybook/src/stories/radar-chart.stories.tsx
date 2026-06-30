import type { Meta, StoryObj } from "@storybook/react-vite";
import { RadarChart } from "@lindaui/blocks/radar-chart";
import type { ChartConfig } from "@lindaui/ui/chart";

const meta: Meta<typeof RadarChart> = { title: "Charts/RadarChart", component: RadarChart };
export default meta;
type Story = StoryObj<typeof RadarChart>;

const data = [
  { eje: "Calidad", sede_a: 120, sede_b: 98 },
  { eje: "Velocidad", sede_a: 98, sede_b: 130 },
  { eje: "Volumen", sede_a: 86, sede_b: 80 },
  { eje: "Cobertura", sede_a: 99, sede_b: 110 },
  { eje: "Satisfacción", sede_a: 85, sede_b: 90 },
];
const config: ChartConfig = {
  sede_a: { label: "Sede Centro", color: "var(--chart-1)" },
  sede_b: { label: "Sede Norte", color: "var(--chart-2)" },
};
const Wrap = (p: { children: React.ReactNode }) => (
  <div className="w-[460px] max-w-full">{p.children}</div>
);

export const Default: Story = {
  render: () => <Wrap><RadarChart data={data} config={config} categoryKey="eje" series={["sede_a"]} /></Wrap>,
};
export const MultiSeries: Story = {
  render: () => <Wrap><RadarChart data={data} config={config} categoryKey="eje" series={["sede_a", "sede_b"]} /></Wrap>,
};
