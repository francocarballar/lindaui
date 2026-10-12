import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";
import {
  ConnectionPanel,
  ConnectedPanel,
  type ConnectionPanelLabels,
  type ConnectionPanelState,
} from "@lindaui/blocks/connection-panel";
import { QRCode } from "@lindaui/ui/qr-code";

const labels: ConnectionPanelLabels = {
  checking: "Comprobando conexión…",
  generating: "Generando código…",
  waiting: "Esperando el escaneo",
  disconnectedDescription: "Vinculá tu dispositivo escaneando un código QR.",
  connect: "Generar código",
  connectError: "No se pudo conectar. Volvé a intentarlo.",
  refresh: "Actualizar código",
  expiresSoon: "El código vence pronto",
  expiresIn: (time) => `El código vence en ${time}`,
  instructions: ["Abrí la aplicación", "Seleccioná Vincular dispositivo", "Escaneá este código"],
  disconnectedInstructions: ["Abrí la aplicación", "Seleccioná Vincular dispositivo", "Generá el código para escanear"],
};

const qrState: ConnectionPanelState = {
  status: "awaiting_scan",
  qrCode: <QRCode alt="Código para vincular dispositivo" value="lindaui-storybook-device-pairing" />,
};

const connectedLabels = {
  disconnectHint: "Para volver a usar este dispositivo tendrás que vincularlo nuevamente.",
  disconnect: "Desconectar",
  disconnecting: "Desconectando…",
  disconnectError: "No se pudo desconectar. Volvé a intentarlo.",
  confirmTitle: "¿Desconectar el dispositivo?",
  confirmDescription: "La conexión se cerrará y tendrás que escanear un nuevo código.",
  cancel: "Cancelar",
};

const details = [
  { id: "number", label: "Número", value: "+54 11 5555 0100", valueClassName: "break-all font-medium tabular-nums" },
  { id: "since", label: "Conectado desde", value: "11 oct 2026, 12:00", dateTime: "2026-10-11T12:00:00Z" },
];

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const meta: Meta<typeof ConnectionPanel> = {
  title: "Blocks/ConnectionPanel",
  component: ConnectionPanel,
  args: {
    labels,
    state: { status: "disconnected" },
    onConnect: async () => undefined,
    onRefreshQR: async () => undefined,
  },
  decorators: [(Story) => <div className="mx-auto w-full max-w-lg p-4"><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof ConnectionPanel>;

function InteractiveConnection() {
  const [state, setState] = useState<ConnectionPanelState>({ status: "disconnected" });
  const [generation, setGeneration] = useState(0);
  return (
    <>
      <ConnectionPanel
        labels={labels}
        onConnect={async () => { setState({ status: "generating" }); await wait(800); setState(qrState); }}
        onRefreshQR={async () => { await wait(600); setGeneration((value) => value + 1); }}
        qrExpirySeconds={60}
        state={state}
      />
      {state.status === "awaiting_scan" && (
        <div className="mt-4 space-y-2 text-center">
          <p className="text-muted text-xs">Códigos actualizados: {generation}</p>
          <button className="rounded-lg border border-border px-3 py-2 text-sm" onClick={() => setState({
            status: "connected",
            content: <ConnectedPanel details={details} labels={connectedLabels} onDisconnect={async () => { await wait(800); setState({ status: "disconnected" }); }} />,
          })} type="button">Simular escaneo</button>
        </div>
      )}
    </>
  );
}

export const Interactive: Story = { render: () => <InteractiveConnection /> };
export const Checking: Story = { args: { state: { status: "checking" } } };
export const Disconnected: Story = {};
export const Generating: Story = { args: { state: { status: "generating" } } };
export const AwaitingScan: Story = { args: { state: qrState } };
export const ExpiringChallenge: Story = { args: { state: qrState, qrExpirySeconds: 10 } };
export const RefreshFailure: Story = {
  args: { state: qrState, onRefreshQR: async () => { throw new Error("Demonstration failure"); } },
};
export const ActionError: Story = { args: { onConnect: async () => { throw new Error("Demonstration failure"); } } };
export const Connected: Story = {
  args: { state: { status: "connected", content: <ConnectedPanel details={details} labels={connectedLabels} onDisconnect={async () => wait(1_000)} /> } },
};

function DisconnectRetry() {
  const attempts = useRef(0);
  const [disconnected, setDisconnected] = useState(false);
  if (disconnected) return <p role="status">Dispositivo desconectado</p>;
  return <ConnectedPanel details={details} labels={connectedLabels} onDisconnect={async () => {
    await wait(900);
    attempts.current += 1;
    if (attempts.current === 1) throw new Error("Demonstration failure");
    setDisconnected(true);
  }} />;
}

export const DisconnectFailureAndRetry: Story = { render: () => <DisconnectRetry /> };
