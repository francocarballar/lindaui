"use client";
import { Chip as HeroChip, type ChipProps } from "@heroui/react";
export type { ChipProps };
export function Chip(props: ChipProps) {
  return <HeroChip {...props} />;
}
