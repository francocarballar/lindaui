import { Button, Spinner } from "@lindaui/ui/compound";
import { RefreshCw } from "lucide-react";
import type { ReactNode } from "react";
import type { ConnectionPanelLabels } from "../connection-panel";
import { ConnectionInstructions } from "./instructions";

interface QRPanelProps {
  qrCode: ReactNode;
  qrFormat?: "ascii" | "image";
  labels: ConnectionPanelLabels;
  timeRemaining: number;
  isRefreshing: boolean;
  error?: ReactNode;
  onRefresh: () => Promise<void>;
}

function formatTime(seconds: number) {
  return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`;
}

export function QRPanel({ qrCode, qrFormat, labels, timeRemaining, isRefreshing, error, onRefresh }: QRPanelProps) {
  return (
    <>
      <div className="flex justify-center">
        <div
          className={qrFormat === "ascii"
            ? "relative overflow-hidden rounded-xl bg-white p-2 shadow-md ring-1 ring-black/5"
            : "relative flex aspect-square w-48 items-center justify-center rounded-xl bg-white p-3 shadow-md ring-1 ring-black/5"}
        >
          {qrCode}
          {timeRemaining <= 10 && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/60 backdrop-blur-sm">
              <div className="text-center">
                <p className="font-bold text-2xl text-white">{formatTime(timeRemaining)}</p>
                <p className="text-white/80 text-xs">{labels.expiresSoon}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="space-y-2 text-center">
        <div className="flex items-center justify-center gap-2 text-muted" role="status">
          <Spinner color="current" size="sm" />
          <span className="font-medium text-sm">{labels.waiting}</span>
        </div>
        <p className="text-muted text-xs">{labels.expiresIn(formatTime(timeRemaining))}</p>
      </div>
      <div className="border-border/60 border-t pt-5">
        <ConnectionInstructions items={labels.instructions} />
      </div>
      {error && <p className="text-danger text-sm" role="alert">{error}</p>}
      <Button className="min-h-11 w-full sm:w-auto" isPending={isRefreshing} onPress={onRefresh} variant="tertiary">
        {({ isPending }) => (
          <>
            {isPending ? <Spinner color="current" size="sm" /> : <RefreshCw className="h-4 w-4" />}
            {labels.refresh}
          </>
        )}
      </Button>
    </>
  );
}
