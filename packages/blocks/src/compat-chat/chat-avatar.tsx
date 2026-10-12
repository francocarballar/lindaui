"use client";

import { Avatar } from "@lindaui/ui/compound";

export interface ChatAvatarClassNames { base?: string; fallback?: string; img?: string; }
export interface ChatAvatarProps {
  className?: string;
  classNames?: ChatAvatarClassNames;
  name: string;
  onError?: () => void;
  size?: "lg" | "md" | "sm";
  src?: string | null;
}
function getInitials(name: string): string {
  return name.split(" ").map((part) => part[0]).filter(Boolean).join("").toUpperCase().slice(0, 2);
}
/** Image refresh stays in the consumer's onError callback. */
export function ChatAvatar({ name, src, size, className, classNames, onError }: ChatAvatarProps) {
  return <Avatar className={[className, classNames?.base].filter(Boolean).join(" ")} size={size}>
    {src ? <Avatar.Image alt={name} className={classNames?.img} onError={onError} src={src} /> : null}
    <Avatar.Fallback className={classNames?.fallback}>{getInitials(name)}</Avatar.Fallback>
  </Avatar>;
}
