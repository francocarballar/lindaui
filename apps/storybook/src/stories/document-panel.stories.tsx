import type { Meta, StoryObj } from "@storybook/react-vite";
import { FileText } from "lucide-react";
import { DocumentPanel } from "@lindaui/blocks/document-panel";
import { Badge } from "@lindaui/ui/badge";
import { Button } from "@lindaui/ui/button";
import { Alert } from "@lindaui/ui/alert";

const meta: Meta<typeof DocumentPanel> = {
  title: "Blocks/DocumentPanel",
  component: DocumentPanel,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof DocumentPanel>;

const SAMPLE_REPORT = `HALLAZGOS
Se observa lesión hipointensa en T1 e hiperintensa en T2 de 8mm en el lóbulo temporal izquierdo, de bordes bien definidos.

IMPRESIÓN DIAGNÓSTICA
Hallazgo compatible con área de gliosis post-inflamatoria. Se recomienda seguimiento con resonancia magnética en 6 meses.

TÉCNICA
Secuencias T1, T2, FLAIR y difusión con y sin administración de contraste endovenoso (Gadolinio 0.1 mmol/kg).`;

export const Ready: Story = {
  render: () => (
    <div className="h-[600px] w-[520px] border border-border rounded-xl overflow-hidden">
      <DocumentPanel
        title="RMN Cerebro con contraste"
        subtitle="García Pérez, María — DNI 27.834.561"
        meta="Fecha: 12/06/2026 · Dr. Martínez, Ricardo · ID: #2026-04821"
        statusBadge={<Badge variant="success">FIRMADO</Badge>}
        state="ready"
        footer={
          <div className="flex gap-2">
            <Button variant="primary">Descargar PDF</Button>
            <Button variant="secondary">Imprimir</Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          {SAMPLE_REPORT.trim().split(/\n\s*\n/).map((block, i) => {
            const [heading, ...rest] = block.split("\n");
            return (
              <div key={i}>
                <div className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">{heading}</div>
                {rest.length > 0 && <p className="mt-1.5 text-sm leading-relaxed">{rest.join(" ")}</p>}
              </div>
            );
          })}
        </div>
      </DocumentPanel>
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <div className="h-[600px] w-[520px] border border-border rounded-xl overflow-hidden">
      <DocumentPanel
        title="TC Abdomen con contraste"
        subtitle="López Torres, Juan"
        meta="Fecha: 10/06/2026"
        statusBadge={<Badge variant="warning">PENDIENTE</Badge>}
        state="loading"
        loadingLabel="Cargando informe radiológico…"
      />
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <div className="h-[600px] w-[520px] border border-border rounded-xl overflow-hidden">
      <DocumentPanel
        title="RX Tórax AP"
        subtitle="Rodríguez Sáenz, Ana"
        meta="Fecha: 08/06/2026"
        state="empty"
        emptyContent={
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-secondary">
              <FileText className="h-7 w-7 text-muted-foreground" strokeWidth={1.6} />
            </div>
            <p className="text-sm font-semibold">Sin informe disponible</p>
            <p className="text-xs text-muted-foreground max-w-[240px]">
              El estudio aún no tiene un informe redactado. Comenzá uno nuevo.
            </p>
            <Button variant="primary" className="mt-2">Crear informe</Button>
          </div>
        }
      />
    </div>
  ),
};

export const WithNotices: Story = {
  render: () => (
    <div className="h-[600px] w-[520px] border border-border rounded-xl overflow-hidden">
      <DocumentPanel
        title="ECO Tiroides"
        subtitle="Fernández Díaz, Carlos"
        state="ready"
        statusBadge={<Badge variant="info">ENVIADO</Badge>}
        notices={
          <Alert variant="warning" title="Revisión pendiente">
            Este informe fue modificado y requiere nueva firma del radiólogo.
          </Alert>
        }
      >
        <div className="flex flex-col gap-4 mt-4">
          <div>
            <div className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">HALLAZGOS</div>
            <p className="mt-1.5 text-sm leading-relaxed">Tiroides de tamaño normal con nódulo hipoecoico de 5mm en lóbulo derecho, sin vascularización interna.</p>
          </div>
        </div>
      </DocumentPanel>
    </div>
  ),
};
