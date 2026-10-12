"use client";

import { Chip, Separator, Spinner as HeroSpinner } from "./compound";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "./cn";

export type BadgeVariant = "solid" | "flat" | "bordered" | "light" | "faded" | "shadow" | "dot";
export type BadgeColor = "default" | "primary" | "secondary" | "success" | "warning" | "danger";
export type BadgeSize = "sm" | "md" | "lg";
export interface BadgeProps { children: ReactNode; className?: string; color?: BadgeColor; size?: BadgeSize; variant?: BadgeVariant; }
const VARIANT_MAP: Record<BadgeVariant, ComponentProps<typeof Chip>["variant"]> = { bordered: "secondary", dot: "soft", faded: "secondary", flat: "soft", light: "soft", shadow: "primary", solid: "primary" };
const COLOR_MAP: Record<BadgeColor, ComponentProps<typeof Chip>["color"]> = { danger: "danger", default: "default", primary: "accent", secondary: "default", success: "success", warning: "warning" };
const FLAT_CLASS_MAP: Record<BadgeColor, string> = {
  danger: "rounded-full bg-danger-soft px-3 text-danger-soft-foreground",
  default: "rounded-full bg-default-soft px-3 text-default-soft-foreground",
  primary: "rounded-full bg-accent-soft px-3 text-accent-soft-foreground",
  secondary: "rounded-full bg-default-soft px-3 text-default-soft-foreground",
  success: "rounded-full bg-success-soft px-3 text-success-soft-foreground",
  warning: "rounded-full bg-warning-soft px-3 text-warning-soft-foreground",
};
export function Badge({ children, variant = "flat", color = "default", size = "sm", className }: BadgeProps) {
  return <Chip className={cn(variant === "flat" ? FLAT_CLASS_MAP[color] : undefined, className)} color={COLOR_MAP[color]} size={size} variant={VARIANT_MAP[variant]}><Chip.Label className="font-medium">{children}</Chip.Label></Chip>;
}

export interface DividerProps { className?: string; orientation?: "horizontal" | "vertical"; }
export function Divider({ orientation = "horizontal", className }: DividerProps) { return <Separator className={className} orientation={orientation} />; }

export type SpinnerSize = "sm" | "md" | "lg" | "xl";
export type SpinnerColor = BadgeColor;
export interface SpinnerProps { className?: string; color?: SpinnerColor; label?: string; size?: SpinnerSize; }
function resolveColor(color: SpinnerColor): "current" | "accent" | "success" | "warning" | "danger" {
  switch (color) {
    case "primary":
    case "secondary": return "accent";
    case "default": return "current";
    default: return color;
  }
}
export function Spinner({ size = "md", color = "primary", label = "Cargando...", className }: SpinnerProps) {
  const spinner = <HeroSpinner color={resolveColor(color)} size={size} />;
  if (!label) return <span className={className}>{spinner}</span>;
  return <span className={`inline-flex flex-col items-center gap-2 ${className ?? ""}`}>{spinner}<span>{label}</span></span>;
}
