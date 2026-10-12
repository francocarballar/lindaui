"use client";

import { ProgressBar } from "@lindaui/ui/compound";
import type { ReactNode } from "react";

export interface StepperProps {
  /** Presentation only: the app supplies its own step/completion calculation. */
  value: number;
  label: string;
  stepLabel?: ReactNode;
  description?: ReactNode;
  complete?: boolean;
  variant?: "steps" | "compact";
  className?: string;
  formatValue?: (value: number) => ReactNode;
}

/** The progress presentation shared by onboarding steps and compact connection wizards. */
export function Stepper({
  value,
  label,
  stepLabel,
  description,
  complete = false,
  variant = "steps",
  className,
  formatValue = (progress) => `${Math.round(progress)}%`,
}: StepperProps) {
  const progress = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
  const compact = variant === "compact";
  return (
    <div className={className ?? (compact ? "mx-auto max-w-xs space-y-2" : "mb-6")}>
      {!compact && (
        <div className="mb-2 flex items-center justify-between font-bold text-muted text-xs uppercase tracking-widest">
          <span>{stepLabel}</span>
          <span>{formatValue(progress)}</span>
        </div>
      )}
      <ProgressBar aria-label={label} color={complete ? "success" : "accent"} size="sm" value={progress}>
        <ProgressBar.Track className={compact ? undefined : "rounded-full"}>
          <ProgressBar.Fill className={compact ? undefined : "rounded-full"} />
        </ProgressBar.Track>
      </ProgressBar>
      {description && <p className="text-muted text-xs">{description}</p>}
    </div>
  );
}
