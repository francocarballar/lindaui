"use client";
import { useState } from "react";

export type ChatAvatarSize = "sm" | "md" | "lg";

export interface ChatAvatarProps {
  src?: string;
  name: string;
  size?: ChatAvatarSize;
  /** Se dispara cuando `src` falla en cargar (además del fallback automático a iniciales). */
  onError?: () => void;
}

const sizeClasses: Record<ChatAvatarSize, string> = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-12 text-base",
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0] + parts[parts.length - 1]![0]).toUpperCase();
}

/**
 * Avatar de chat con fallback a iniciales. Bespoke (no compone
 * `@lindaui/ui/avatar`): ese wrapper solo expone el Root de HeroUI, sin
 * `Avatar.Image`/`Avatar.Fallback` — no alcanza para un fallback-on-error real.
 */
export function ChatAvatar({ src, name, size = "md", onError }: ChatAvatarProps) {
  const [broken, setBroken] = useState(false);
  const showImage = src != null && !broken;

  return (
    <div
      role="img"
      aria-label={name}
      className={`grid shrink-0 place-items-center overflow-hidden rounded-full bg-secondary font-medium text-secondary-foreground ${sizeClasses[size]}`}
    >
      {showImage ? (
        <img
          src={src}
          alt=""
          className="h-full w-full object-cover"
          onError={() => {
            setBroken(true);
            onError?.();
          }}
        />
      ) : (
        <span aria-hidden="true">{initials(name)}</span>
      )}
    </div>
  );
}
