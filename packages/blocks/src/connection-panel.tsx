"use client";

import { Spinner } from "@lindaui/ui/compound";
import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState, type ReactNode } from "react";
import { DisconnectedPanel } from "./connection-panel/disconnected-panel";
import { QRPanel } from "./connection-panel/qr-panel";
import { useQRRefresh } from "./connection-panel/use-qr-refresh";

export { ConnectedPanel } from "./connection-panel/connected-panel";
export type { ConnectedPanelProps, ConnectedPanelLabels, ConnectionDetail } from "./connection-panel/connected-panel";

export type ConnectionPanelState =
  | { status: "checking" | "disconnected" | "generating" }
  | { status: "awaiting_scan"; qrCode: ReactNode; qrFormat?: "ascii" | "image" }
  | { status: "connected"; content: ReactNode };

export interface ConnectionPanelLabels {
  checking: ReactNode;
  generating: ReactNode;
  waiting: ReactNode;
  disconnectedDescription: ReactNode;
  connect: ReactNode;
  connectError: ReactNode;
  refresh: ReactNode;
  expiresSoon: ReactNode;
  expiresIn: (time: string) => ReactNode;
  instructions: readonly ReactNode[];
  disconnectedInstructions: readonly ReactNode[];
}

export interface ConnectionPanelProps {
  state: ConnectionPanelState;
  labels: ConnectionPanelLabels;
  error?: ReactNode;
  isActive?: boolean;
  className?: string;
  qrExpirySeconds?: number;
  onConnect: () => Promise<void>;
  onRefreshQR: () => Promise<void>;
}

/** Controlled connection presentation. Authentication and automatic connection policy stay in the app. */
export function ConnectionPanel({
  state,
  labels,
  error,
  isActive = true,
  className = "",
  qrExpirySeconds = 60,
  onConnect,
  onRefreshQR,
}: ConnectionPanelProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const pending = useRef(false);
  const hasQR = state.status === "awaiting_scan";
  const qr = useQRRefresh({
    enabled: hasQR && isActive,
    expirySeconds: Number.isFinite(qrExpirySeconds) ? Math.max(1, Math.floor(qrExpirySeconds)) : 60,
    error,
    errorLabel: labels.connectError,
    onRefresh: onRefreshQR,
  });
  const actionError = error || qr.actionError;

  async function connect() {
    if (pending.current) return;
    pending.current = true;
    setIsConnecting(true);
    qr.setActionError(null);
    try {
      await onConnect();
    } catch {
      qr.setActionError(labels.connectError);
    } finally {
      pending.current = false;
      setIsConnecting(false);
    }
  }

  if (state.status === "checking") {
    return (
      <div className={`flex items-center justify-center gap-3 py-10 text-muted text-sm ${className}`} role="status">
        <Spinner size="sm" />
        {labels.checking}
      </div>
    );
  }

  return (
    <div className={`${state.status === "connected" ? "space-y-4" : "mx-auto w-full max-w-sm space-y-6 py-6 text-center"} ${className}`}>
      <AnimatePresence mode="wait">
        {state.status === "connected" ? (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
            exit={{ opacity: 0, y: -10 }}
            initial={{ opacity: 0, y: 10 }}
            key="connected"
          >
            {state.content}
          </motion.div>
        ) : state.status === "awaiting_scan" ? (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
            exit={{ opacity: 0, y: -10 }}
            initial={{ opacity: 0, y: 10 }}
            key="qr"
          >
            <QRPanel
              error={actionError}
              isRefreshing={qr.isRefreshing}
              labels={labels}
              onRefresh={qr.refresh}
              qrCode={state.qrCode}
              qrFormat={state.qrFormat}
              timeRemaining={qr.timeRemaining}
            />
          </motion.div>
        ) : (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
            exit={{ opacity: 0, y: -10 }}
            initial={{ opacity: 0, y: 10 }}
            key="initial"
          >
            <DisconnectedPanel
              error={actionError}
              generating={state.status === "generating"}
              labels={labels}
              onConnect={connect}
              pending={isConnecting}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
