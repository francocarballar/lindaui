import type { Meta, StoryObj } from "@storybook/react-vite";
import { StatsGrid } from "@ts/blocks/stats-grid";
import { StatCard } from "@ts/blocks/stat-card";

const meta: Meta<typeof StatsGrid> = { title: "Charts/StatsGrid", component: StatsGrid };
export default meta;
type Story = StoryObj<typeof StatsGrid>;

const cards = [
  <StatCard key="1" label="Estudios" value="1.284" delta={{ value: "+12%", trend: "up" }} />,
  <StatCard key="2" label="Firmados" value="982" delta={{ value: "+8%", trend: "up" }} />,
  <StatCard key="3" label="Pendientes" value="124" delta={{ value: "-3%", trend: "down" }} />,
  <StatCard key="4" label="Tiempo medio" value="26 min" delta={{ value: "0%", trend: "neutral" }} />,
];

export const FourColumns: Story = {
  render: () => <StatsGrid columns={4}>{cards}</StatsGrid>,
};
export const ThreeColumns: Story = {
  render: () => <StatsGrid columns={3}>{cards.slice(0, 3)}</StatsGrid>,
};
