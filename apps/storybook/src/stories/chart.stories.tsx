import type { Meta, StoryObj } from "@storybook/react-vite";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@ts/ui/chart";

// Primitivo de charts (réplica shadcn sobre recharts). El consumidor compone
// los tipos recharts adentro; el color sale del config via var(--color-<key>).
const meta: Meta = { title: "Charts/Chart (primitive)" };
export default meta;
type Story = StoryObj;

const data = [
  { mes: "Ene", rmn: 120, tc: 80 },
  { mes: "Feb", rmn: 132, tc: 90 },
  { mes: "Mar", rmn: 101, tc: 70 },
  { mes: "Abr", rmn: 148, tc: 96 },
  { mes: "May", rmn: 160, tc: 110 },
];

const config: ChartConfig = {
  rmn: { label: "RMN", color: "var(--chart-1)" },
  tc: { label: "TC", color: "var(--chart-2)" },
};

export const Default: Story = {
  render: () => (
    <div className="w-[600px] max-w-full">
      <ChartContainer config={config}>
        <BarChart data={data}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="mes" tickLine={false} axisLine={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="rmn" fill="var(--color-rmn)" radius={4} />
          <Bar dataKey="tc" fill="var(--color-tc)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
  ),
};
