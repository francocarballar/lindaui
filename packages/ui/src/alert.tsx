"use client";
import {
  Alert as HeroAlert,
  AlertContent,
  AlertTitle,
  AlertDescription,
  type AlertProps as HeroAlertProps,
} from "@heroui/react";
import type { ReactNode } from "react";

/**
 * Ergonomic alert with flat `title`/`description`. HeroUI v3 Alert is composed
 * from AlertContent + AlertTitle + AlertDescription; this wrapper assembles it.
 */
export interface AlertProps extends Omit<HeroAlertProps, "children" | "title"> {
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}

export function Alert({ title, description, children, ...props }: AlertProps) {
  return (
    <HeroAlert {...props}>
      <AlertContent>
        {title && <AlertTitle>{title}</AlertTitle>}
        {description && <AlertDescription>{description}</AlertDescription>}
        {children}
      </AlertContent>
    </HeroAlert>
  );
}
