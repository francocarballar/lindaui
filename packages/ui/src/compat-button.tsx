"use client";

import { Button as HeroButton, Spinner as HeroSpinner } from "./compound";
import type { ReactNode } from "react";

export type ButtonVariant = "solid" | "light" | "flat" | "faded" | "shadow" | "bordered" | "ghost";
export type ButtonColor = "default" | "primary" | "secondary" | "success" | "warning" | "danger";
export type ButtonSize = "sm" | "md" | "lg";
type HeroButtonVariant = "primary" | "secondary" | "tertiary" | "outline" | "ghost" | "danger" | "danger-soft";

export interface ButtonProps {
  "aria-label"?: string;
  children: ReactNode;
  className?: string;
  color?: ButtonColor;
  endContent?: ReactNode;
  fullWidth?: boolean;
  isDisabled?: boolean;
  isLoading?: boolean;
  onPress?: () => void;
  size?: ButtonSize;
  startContent?: ReactNode;
  type?: "button" | "submit" | "reset";
  variant?: ButtonVariant;
}

function resolveVariant(color: ButtonColor, variant: ButtonVariant): HeroButtonVariant {
  if (color === "danger") return variant === "flat" || variant === "faded" ? "danger-soft" : "danger";
  switch (variant) {
    case "ghost": return "ghost";
    case "bordered": return "outline";
    case "light":
    case "flat":
    case "faded": return "tertiary";
    default: return color === "secondary" ? "secondary" : "primary";
  }
}

/** Preserves the legacy color/variant mapping and pending-content replacement. */
export function Button({ children, variant = "solid", color = "primary", size = "md", isLoading = false, isDisabled = false, startContent, endContent, fullWidth = false, onPress, type = "button", className, "aria-label": ariaLabel }: ButtonProps) {
  return (
    <HeroButton aria-label={ariaLabel} className={className} fullWidth={fullWidth} isDisabled={isDisabled} isPending={isLoading} onPress={onPress} size={size} type={type} variant={resolveVariant(color, variant)}>
      {({ isPending }) => isPending ? <HeroSpinner color="current" size="sm" /> : <>{startContent}{children}{endContent}</>}
    </HeroButton>
  );
}

export interface IconButtonProps {
  "aria-label": string;
  className?: string;
  color?: ButtonColor;
  icon: ReactNode;
  isDisabled?: boolean;
  isLoading?: boolean;
  onPress?: () => void;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

function resolveIconVariant(color: ButtonColor, variant: ButtonVariant): HeroButtonVariant {
  if (color === "danger") return variant === "flat" || variant === "faded" ? "danger-soft" : "danger";
  switch (variant) {
    case "ghost": return "ghost";
    case "bordered": return "outline";
    case "solid":
    case "shadow": return color === "secondary" ? "secondary" : "primary";
    default: return "tertiary";
  }
}

export function IconButton({ icon, "aria-label": ariaLabel, variant = "light", color = "default", size = "md", isDisabled = false, isLoading = false, onPress, className }: IconButtonProps) {
  return <HeroButton aria-label={ariaLabel} className={className} isDisabled={isDisabled} isIconOnly isPending={isLoading} onPress={onPress} size={size} variant={resolveIconVariant(color, variant)}>{icon}</HeroButton>;
}
