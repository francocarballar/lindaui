"use client";
import type { ReactNode } from "react";
import { MessageCircle } from "lucide-react";

export interface EmptyChatViewProps {
  title?: string;
  description?: ReactNode;
  icon?: ReactNode;
}

export function EmptyChatView({
  title = "Elegí una conversación",
  description,
  icon,
}: EmptyChatViewProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center text-muted-foreground">
      <div className="grid size-14 place-items-center rounded-full bg-secondary">
        {icon ?? <MessageCircle className="size-6" aria-hidden="true" />}
      </div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description != null && <p className="max-w-xs text-xs">{description}</p>}
    </div>
  );
}
