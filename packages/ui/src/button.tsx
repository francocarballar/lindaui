"use client";
import { Button as HeroButton, type ButtonProps as HeroButtonProps } from "@heroui/react";

/**
 * Public, stable button variants for @ts/ui. These map onto HeroUI v3's
 * native button variants; `link` has no direct v3 equivalent and maps to
 * `tertiary` (the lowest-emphasis text-like style).
 */
export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "link";

export interface ButtonProps extends Omit<HeroButtonProps, "variant"> {
  variant?: ButtonVariant;
}

const variantMap: Record<ButtonVariant, NonNullable<HeroButtonProps["variant"]>> = {
  primary: "primary",
  secondary: "secondary",
  ghost: "ghost",
  danger: "danger",
  link: "tertiary",
};

export function Button({ variant = "primary", ...props }: ButtonProps) {
  return <HeroButton variant={variantMap[variant]} {...props} />;
}
