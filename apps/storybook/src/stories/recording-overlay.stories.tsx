import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, useEffect } from "react";
import { RecordingOverlay } from "@ts/blocks/recording-overlay";

const meta: Meta<typeof RecordingOverlay> = {
  title: "Blocks/RecordingOverlay",
  component: RecordingOverlay,
};
export default meta;
type Story = StoryObj<typeof RecordingOverlay>;

export const Recording: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [elapsed, setElapsed] = useState(0);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [active, setActive] = useState(true);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (!active) return;
      const id = setInterval(() => setElapsed((e) => e + 1), 1000);
      return () => clearInterval(id);
    }, [active]);

    if (!active) {
      return (
        <div className="relative h-[600px] w-[360px] rounded-xl overflow-hidden bg-secondary flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Grabación detenida. Elapsed: {elapsed}s</p>
        </div>
      );
    }

    return (
      <div className="relative h-[600px] w-[360px] rounded-xl overflow-hidden">
        <RecordingOverlay
          label="GRABANDO"
          description="Dictá el informe del estudio. Podés pausar y continuar en cualquier momento."
          elapsed={elapsed}
          onStop={() => setActive(false)}
          onCancel={() => { setActive(false); setElapsed(0); }}
          stopLabel="Detener grabación"
        />
      </div>
    );
  },
};

export const WithError: Story = {
  render: () => (
    <div className="relative h-[600px] w-[360px] rounded-xl overflow-hidden">
      <RecordingOverlay
        label="GRABANDO"
        elapsed={0}
        error="No se pudo acceder al micrófono. Verificá los permisos en la configuración del navegador."
        onStop={() => {}}
        onCancel={() => alert("Volviendo…")}
        errorTitle="Micrófono no disponible"
        backLabel="Volver al estudio"
      />
    </div>
  ),
};

export const LongSession: Story = {
  render: () => (
    <div className="relative h-[600px] w-[360px] rounded-xl overflow-hidden">
      <RecordingOverlay
        label="GRABANDO"
        description="RMN Rodilla Derecha — García Pérez, María"
        elapsed={187}
        onStop={() => {}}
        onCancel={() => {}}
        stopLabel="Detener y procesar"
      />
    </div>
  ),
};
