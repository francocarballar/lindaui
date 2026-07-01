"use client";
import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";

/**
 * Legible back pill for media overlays. `SplitWorkspace` renders it by default
 * from `backHref`/`backLabel` so a consumer never has to hand-build a readable
 * control over dark/bright media. Token-driven surface (`bg-secondary` +
 * `border-border`) so it reads on any background.
 */
export interface WorkspaceBackButtonProps {
  href: string;
  label: ReactNode;
  /** Leading icon; defaults to a chevron. Rendered `aria-hidden` — the label names the link. */
  icon?: ReactNode;
}

export function WorkspaceBackButton({
  href,
  label,
  icon = <ChevronLeft size={18} aria-hidden />,
}: WorkspaceBackButtonProps) {
  return (
    <a
      href={href}
      className="inline-flex h-9 items-center gap-1 rounded-full border border-border bg-secondary pl-2 pr-3 text-sm font-medium text-secondary-foreground shadow-sm transition-colors hover:bg-border"
    >
      {icon}
      {label}
    </a>
  );
}
