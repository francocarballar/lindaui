"use client";
import { Skeleton as HeroSkeleton, type SkeletonProps } from "@heroui/react";
export type { SkeletonProps };
export function Skeleton(props: SkeletonProps) {
  return <HeroSkeleton {...props} />;
}
