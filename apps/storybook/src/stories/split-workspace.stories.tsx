import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ArrowLeft, Mic } from "lucide-react";
import { SplitWorkspace } from "@ts/blocks/split-workspace";
import { ImageViewer } from "@ts/blocks/image-viewer";
import { DocumentPanel } from "@ts/blocks/document-panel";
import { RecordingOverlay } from "@ts/blocks/recording-overlay";
import { Button } from "@ts/ui/button";
import { Badge } from "@ts/ui/badge";

const meta: Meta<typeof SplitWorkspace> = {
  title: "Blocks/SplitWorkspace",
  component: SplitWorkspace,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof SplitWorkspace>;

const REPORT_TEXT = `HALLAZGOS
Desgarro parcial del ligamento cruzado anterior. Derrame articular moderado.

IMPRESIÓN DIAGNÓSTICA
Compatible con lesión ligamentaria grado II. Se sugiere evaluación por traumatología.`;

export const Default: Story = {
  render: () => (
    <div className="h-screen w-full">
      <SplitWorkspace
        back={
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        }
        media={
          <ImageViewer
            placeholderLabel="RMN RODILLA DERECHA"
            caption="RMN Rodilla · Sagital · Serie 1 · Slice 8/32"
            showControls
          />
        }
        panel={
          <DocumentPanel
            title="RMN Rodilla Derecha"
            subtitle="García Pérez, María — 42 años"
            meta="12/06/2026 · Dr. Martínez"
            statusBadge={<Badge variant="warning">PENDIENTE</Badge>}
            state="ready"
            footer={
              <div className="flex gap-2">
                <Button variant="primary">Firmar informe</Button>
                <Button variant="secondary">Guardar borrador</Button>
              </div>
            }
          >
            <div className="flex flex-col gap-4">
              {REPORT_TEXT.trim().split(/\n\s*\n/).map((block, i) => {
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
        }
      />
    </div>
  ),
};

export const WithRecordingOverlay: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [recording, setRecording] = useState(false);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [elapsed, setElapsed] = useState(0);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useState(() => {
      if (!recording) return;
      const id = setInterval(() => setElapsed((e) => e + 1), 1000);
      return () => clearInterval(id);
    });

    return (
      <div className="h-screen w-full">
        <SplitWorkspace
          back={
            <Button variant="secondary" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
          }
          media={
            <ImageViewer
              placeholderLabel="TC ABDOMEN CON CONTRASTE"
              caption="TC Abdomen · Axial · Serie 2 · Slice 14/60"
              dim={recording ? 0.6 : 0}
            />
          }
          panel={
            <DocumentPanel
              title="TC Abdomen con contraste"
              subtitle="Fernández Díaz, Carlos — 58 años"
              state="empty"
              emptyContent={
                <div className="flex flex-col items-center gap-4 py-12">
                  <p className="text-sm text-muted-foreground">Sin informe. Dictá para comenzar.</p>
                  <Button variant="primary" onPress={() => { setRecording(true); setElapsed(0); }}>
                    <Mic className="h-4 w-4" />
                    Dictar informe
                  </Button>
                </div>
              }
            />
          }
          overlay={
            recording ? (
              <RecordingOverlay
                label="GRABANDO"
                description="TC Abdomen con contraste — Fernández Díaz, Carlos"
                elapsed={elapsed}
                onStop={() => setRecording(false)}
                onCancel={() => { setRecording(false); setElapsed(0); }}
              />
            ) : undefined
          }
        />
      </div>
    );
  },
};

export const PanelLoading: Story = {
  render: () => (
    <div className="h-screen w-full">
      <SplitWorkspace
        media={
          <ImageViewer
            placeholderLabel="ECO TIROIDES"
            showControls
          />
        }
        panel={
          <DocumentPanel
            title="ECO Tiroides"
            subtitle="Martínez Ruiz, Lucía"
            state="loading"
            loadingLabel="Procesando dictado de voz…"
          />
        }
      />
    </div>
  ),
};
