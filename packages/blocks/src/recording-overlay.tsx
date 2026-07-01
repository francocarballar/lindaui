"use client";
import { Mic, AlertCircle } from "lucide-react";
import type { CSSProperties } from "react";

export interface RecordingOverlayProps {
  label: string;
  description?: string;
  elapsed: number;
  error?: string | null;
  onStop: () => void;
  onCancel: () => void;
  stopLabel?: string;
  errorTitle?: string;
  backLabel?: string;
  /**
   * `overlay` (default) covers its container on a fixed dark surface (`viewer-*`
   * tokens) — for use over media. `inline` drops the absolute positioning and the
   * forced dark background, filling its container and inheriting the panel's
   * surface; its text is token-driven so it stays legible on a light or dark
   * panel. Content is otherwise identical.
   */
  variant?: "overlay" | "inline";
}

/** Per-variant surface/text tokens so both read on their respective background. */
function variantTokens(variant: "overlay" | "inline") {
  if (variant === "inline") {
    return {
      root: "flex h-full flex-col items-center justify-center gap-5 p-6 sm:gap-7",
      text: "text-foreground",
      muted: "text-muted-foreground",
      // solid action button on an adaptive panel
      solid: "bg-foreground text-background",
    };
  }
  return {
    root: "absolute inset-0 z-[60] flex flex-col items-center justify-center gap-5 bg-viewer-bg p-8 text-viewer-foreground sm:gap-7",
    text: "text-viewer-foreground",
    muted: "text-viewer-foreground/70",
    solid: "bg-white text-[oklch(0.16_0.02_240)]",
  };
}

function fmtTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function Waveform() {
  return (
    <div
      className="flex items-end justify-center gap-[3px]"
      style={{ height: 48, width: "min(80%, 280px)" }}
    >
      {Array.from({ length: 40 }).map((_, i) => {
        const seed = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
        const max = Math.max(6, (0.18 + seed * 0.82) * 48);
        return (
          <span
            key={i}
            className="rounded-full bg-destructive"
            style={
              {
                width: 3,
                animation: `ti-wf 0.9s ease-in-out ${(i % 11) * 0.07}s infinite`,
                "--wfmax": `${max}px`,
              } as CSSProperties
            }
          />
        );
      })}
    </div>
  );
}

export function RecordingOverlay({
  label,
  description,
  elapsed,
  error,
  onStop,
  onCancel,
  stopLabel = "Detener",
  errorTitle = "No se pudo acceder al micrófono",
  backLabel = "Volver",
  variant = "overlay",
}: RecordingOverlayProps) {
  const t = variantTokens(variant);

  if (error) {
    return (
      <div className={`${t.root} text-center`}>
        <div className="grid h-16 w-16 place-items-center rounded-full bg-destructive/15 text-destructive">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div className="max-w-[280px]">
          <p className={`text-base font-semibold ${t.text}`}>{errorTitle}</p>
          <p className={`mt-2 text-sm ${t.muted}`}>{error}</p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className={`h-12 rounded-2xl px-6 text-[15px] font-semibold ${t.solid}`}
        >
          {backLabel}
        </button>
      </div>
    );
  }

  return (
    <div className={t.root}>
      <div className="relative grid h-[132px] w-[132px] place-items-center sm:h-[168px] sm:w-[168px]">
        <span className="ti-rec-pulse absolute h-[132px] w-[132px] rounded-full bg-destructive/15 sm:h-[168px] sm:w-[168px]" />
        <span
          className="ti-rec-pulse absolute h-[132px] w-[132px] rounded-full bg-destructive/15 sm:h-[168px] sm:w-[168px]"
          style={{ animationDelay: "0.9s" }}
        />
        <div className="grid h-[84px] w-[84px] place-items-center rounded-full bg-destructive text-white shadow-[0_10px_30px_-6px_var(--destructive)] sm:h-[108px] sm:w-[108px]">
          <Mic className="h-8 w-8 sm:h-[42px] sm:w-[42px]" />
        </div>
      </div>

      <div className="text-center">
        <div className="inline-flex items-center gap-2">
          <span className="ti-rec-blink h-2.5 w-2.5 rounded-full bg-destructive" />
          <span className="text-sm font-semibold tracking-wide text-destructive">
            {label}
          </span>
        </div>
        <div
          className={`mt-2 font-mono text-4xl font-medium tabular-nums ${t.text} sm:text-[46px]`}
        >
          {fmtTime(elapsed)}
        </div>
      </div>

      <Waveform />

      {description && (
        <p
          className={`max-w-[270px] text-center text-sm leading-relaxed ${t.muted}`}
        >
          {description}
        </p>
      )}

      <button
        type="button"
        onClick={onStop}
        className={`mt-1.5 grid h-16 w-16 place-items-center rounded-full ${t.solid} shadow-[0_6px_20px_-4px_rgba(0,0,0,0.5)]`}
        aria-label={stopLabel}
      >
        <span className="h-6 w-6 rounded-md bg-destructive" />
      </button>
    </div>
  );
}
