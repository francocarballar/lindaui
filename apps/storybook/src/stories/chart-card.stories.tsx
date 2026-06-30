import type { Meta, StoryObj } from "@storybook/react-vite";
import { TrendingUp } from "lucide-react";
import { ChartCard } from "@lindaui/blocks/chart-card";
import { AreaChart } from "@lindaui/blocks/area-chart";
import { Button } from "@lindaui/ui/button";
import type { ChartConfig } from "@lindaui/ui/chart";

const meta: Meta<typeof ChartCard> = { title: "Charts/ChartCard", component: ChartCard };
export default meta;
type Story = StoryObj<typeof ChartCard>;

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
    <div className="w-[560px] max-w-full">
      <ChartCard
        title="Estudios por mes"
        description="Últimos 5 meses · RMN vs TC"
        footer={
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4 text-chart-1" /> +18% en el período
          </span>
        }
      >
        <AreaChart data={data} config={config} categoryKey="mes" series={["rmn", "tc"]} variant="stacked" />
      </ChartCard>
    </div>
  ),
};

export const WithAction: Story = {
  render: () => (
    <div className="w-[560px] max-w-full">
      <ChartCard
        title="Estudios por mes"
        description="Comparativa por modalidad"
        action={<Button variant="ghost" size="sm">Exportar</Button>}
      >
        <AreaChart data={data} config={config} categoryKey="mes" series={["rmn", "tc"]} />
      </ChartCard>
    </div>
  ),
};
