import type { Meta, StoryObj } from "@storybook/react-vite";
import { DocumentReader } from "@lindaui/blocks/document-reader";

const meta: Meta<typeof DocumentReader> = {
  title: "Blocks/DocumentReader",
  component: DocumentReader,
  parameters: { layout: "centered" },
};
export default meta;
type Story = StoryObj<typeof DocumentReader>;

const FULL_REPORT = `HALLAZGOS
Se observa lesión hipointensa en T1 e hiperintensa en T2 de 8mm en el lóbulo temporal izquierdo, de bordes bien definidos. No se evidencia efecto de masa ni captación de contraste.

IMPRESIÓN DIAGNÓSTICA
Hallazgo compatible con área de gliosis post-inflamatoria. Se recomienda seguimiento con resonancia magnética en 6 meses para evaluar evolución.

TÉCNICA
Secuencias T1, T2, FLAIR y difusión con y sin administración de contraste endovenoso (Gadolinio 0.1 mmol/kg). Campo magnético de 1.5 Tesla.

CONCLUSIÓN
Sin evidencia de lesiones activas o captantes. Control en 6 meses.`;

const SHORT_REPORT = `HALLAZGOS
Sin alteraciones estructurales en el parénquima pulmonar. Silueta cardíaca de tamaño normal. Senos costofrénicos libres.

IMPRESIÓN DIAGNÓSTICA
Radiografía de tórax dentro de parámetros normales.`;

const MINIMAL = `HALLAZGOS
Normal.`;

export const FullReport: Story = {
  render: () => (
    <div className="w-[480px] p-6 border border-border rounded-xl bg-card">
      <DocumentReader content={FULL_REPORT} />
    </div>
  ),
};

export const ShortReport: Story = {
  render: () => (
    <div className="w-[480px] p-6 border border-border rounded-xl bg-card">
      <DocumentReader content={SHORT_REPORT} />
    </div>
  ),
};

export const Minimal: Story = {
  render: () => (
    <div className="w-[480px] p-6 border border-border rounded-xl bg-card">
      <DocumentReader content={MINIMAL} />
    </div>
  ),
};
