"use client";
import { Spinner as HeroSpinner, type SpinnerProps } from "@heroui/react";
export type { SpinnerProps };
export function Spinner(props: SpinnerProps) {
  return <HeroSpinner {...props} />;
}
