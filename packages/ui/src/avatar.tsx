"use client";
import { Avatar as HeroAvatar, type AvatarProps } from "@heroui/react";
export type { AvatarProps };
export function Avatar(props: AvatarProps) {
  return <HeroAvatar {...props} />;
}
