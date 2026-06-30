import type { Meta, StoryObj } from "@storybook/react-vite";
import { Calendar, User, Stethoscope, FileText, Play } from "lucide-react";
import { DetailPanel } from "@lindaui/blocks/detail-panel";
import { Badge } from "@lindaui/ui/badge";

const meta: Meta<typeof DetailPanel> = {
  title: "Blocks/DetailPanel",
  component: DetailPanel,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof DetailPanel>;

export const Empty: Story = {
  render: () => (
    <div className="h-[600px] w-full border border-border rounded-xl overflow-hidden">
      <DetailPanel />
    </div>
  ),
};

export const WithContent: Story = {
  render: () => (
    <div className="h-[600px] w-full border border-border rounded-xl overflow-hidden">
      <DetailPanel
        selected
        title="RMN Rodilla Derecha"
        subtitle="García Pérez, María — 42 años"
        badges={
          <>
            <Badge variant="success">FIRMADO</Badge>
            <Badge variant="info">URGENTE</Badge>
          </>
        }
        meta={[
          { icon: <Calendar className="h-4 w-4" />, label: "Fecha de estudio", value: "12/06/2026" },
          { icon: <User className="h-4 w-4" />, label: "Médico solicitante", value: "Dr. Martínez, Ricardo" },
          { icon: <Stethoscope className="h-4 w-4" />, label: "Especialidad", value: "Traumatología" },
          { icon: <FileText className="h-4 w-4" />, label: "Modalidad", value: "Resonancia Magnética" },
        ]}
        action={{
          label: "Ver informe",
          onPress: () => alert("Abriendo informe…"),
          icon: <Play className="h-4 w-4" />,
        }}
      />
    </div>
  ),
};

export const WithMedia: Story = {
  render: () => (
    <div className="h-[600px] w-full border border-border rounded-xl overflow-hidden">
      <DetailPanel
        selected
        title="TC Abdomen con contraste"
        subtitle="Fernández Díaz, Carlos — 58 años"
        badges={<Badge variant="warning">PENDIENTE</Badge>}
        media={
          <div className="aspect-square w-full rounded-xl bg-secondary flex items-center justify-center">
            <FileText className="h-10 w-10 text-muted-foreground" strokeWidth={1.4} />
          </div>
        }
        meta={[
          { icon: <Calendar className="h-4 w-4" />, label: "Fecha de estudio", value: "08/06/2026" },
          { icon: <User className="h-4 w-4" />, label: "Médico solicitante", value: "Dra. Romero, Patricia" },
          { icon: <Stethoscope className="h-4 w-4" />, label: "Especialidad", value: "Gastroenterología" },
        ]}
        action={{
          label: "Firmar informe",
          onPress: () => alert("Firmando…"),
        }}
      />
    </div>
  ),
};

export const CustomEmpty: Story = {
  render: () => (
    <div className="h-[400px] w-full border border-border rounded-xl overflow-hidden">
      <DetailPanel
        emptyTitle="Elegí un estudio de la lista"
        emptyDescription="Hacé clic en un ítem para ver el detalle completo y el informe."
        emptyIcon={<Stethoscope className="h-7 w-7 text-muted-foreground" strokeWidth={1.6} />}
      />
    </div>
  ),
};
