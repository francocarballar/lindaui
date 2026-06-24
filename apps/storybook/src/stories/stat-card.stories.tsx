import type { Meta, StoryObj } from "@storybook/react-vite";
import { Activity, UserCheck, Users, Award, MessageSquare, TrendingUp, Phone } from "lucide-react";
import { StatCard } from "@ts/blocks/stat-card";
import { StatsGrid } from "@ts/blocks/stats-grid";

const meta: Meta<typeof StatCard> = { title: "Charts/StatCard", component: StatCard };
export default meta;
type Story = StoryObj<typeof StatCard>;

const spark = [4, 6, 5, 8, 7, 10, 9, 12].map((v, i) => ({ i, v }));

export const Default: Story = {
  render: () => (
    <div className="w-[260px]">
      <StatCard label="Estudios del mes" value="1.284" description="vs. mes anterior" />
    </div>
  ),
};
export const WithDeltaUp: Story = {
  render: () => (
    <div className="w-[260px]">
      <StatCard label="Informes firmados" value="982" delta={{ value: "+12,4%", trend: "up" }} icon={<Activity className="h-4 w-4 text-muted-foreground" />} />
    </div>
  ),
};
export const WithDeltaDown: Story = {
  render: () => (
    <div className="w-[260px]">
      <StatCard label="Tiempo medio a informe" value="26 min" delta={{ value: "-8,1%", trend: "down" }} />
    </div>
  ),
};
export const WithSparkline: Story = {
  render: () => (
    <div className="w-[260px]">
      <StatCard
        label="Dictados por día"
        value="148"
        delta={{ value: "+5,2%", trend: "up" }}
        sparkline={{ data: spark, dataKey: "v", color: "var(--chart-1)" }}
      />
    </div>
  ),
};
export const Grid: Story = {
  render: () => (
    <StatsGrid columns={4}>
      <StatCard label="Estudios" value="1.284" delta={{ value: "+12%", trend: "up" }} />
      <StatCard label="Firmados" value="982" delta={{ value: "+8%", trend: "up" }} />
      <StatCard label="Pendientes" value="124" delta={{ value: "-3%", trend: "down" }} />
      <StatCard label="Tiempo medio" value="26 min" delta={{ value: "0%", trend: "neutral" }} />
    </StatsGrid>
  ),
};

// Variante featured: icono prominente arriba-izquierda + delta arriba-derecha +
// valor grande coloreado por tono + label abajo.
export const Featured: Story = {
  render: () => (
    <div className="w-[280px]">
      <StatCard
        variant="featured"
        tone="primary"
        icon={<UserCheck className="h-5 w-5" />}
        label="Seekers activos"
        value="5"
        delta={{ value: "+71%", trend: "up" }}
      />
    </div>
  ),
};

export const FeaturedGrid: Story = {
  render: () => (
    <StatsGrid columns={4}>
      <StatCard variant="featured" tone="primary" icon={<UserCheck className="h-5 w-5" />} label="Seekers activos" value="5" delta={{ value: "+71%", trend: "up" }} />
      <StatCard variant="featured" tone="neutral" icon={<Users className="h-5 w-5" />} label="Total de seekers" value="7" />
      <StatCard variant="featured" tone="neutral" icon={<Activity className="h-5 w-5" />} label="Postulaciones" value="2" />
      <StatCard variant="featured" tone="success" icon={<Award className="h-5 w-5" />} label="Tasa de ofertas" value="0%" delta={{ value: "-0%", trend: "down" }} />
      <StatCard variant="featured" tone="primary" icon={<MessageSquare className="h-5 w-5" />} label="Mensajes en el período" value="61" />
      <StatCard variant="featured" tone="warning" icon={<TrendingUp className="h-5 w-5" />} label="Tasa de respuesta" value="0%" delta={{ value: "-0%", trend: "down" }} />
      <StatCard variant="featured" tone="success" icon={<Phone className="h-5 w-5" />} label="WhatsApp vinculado" value="100%" delta={{ value: "+100%", trend: "up" }} />
    </StatsGrid>
  ),
};
