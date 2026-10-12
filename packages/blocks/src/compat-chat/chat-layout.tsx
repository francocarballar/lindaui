"use client";

import type { ReactNode } from "react";
import { cn } from "@lindaui/ui/cn";

export interface ChatLayoutProps { detail?: ReactNode; main: ReactNode; selectedChatId?: string; sidebar: ReactNode; }
/** Mobile selection switching, 350px tablet sidebar, 320px desktop detail. */
export function ChatLayout({ sidebar, main, detail, selectedChatId }: ChatLayoutProps) {
  return <div className="flex h-full w-full overflow-hidden bg-background">
    <div className={cn("border-border border-r", "md:flex md:w-[350px] md:flex-col", selectedChatId ? "hidden" : "flex w-full flex-col")}>{sidebar}</div>
    <div className={cn("flex-1 flex-col overflow-hidden", "md:flex", selectedChatId ? "flex" : "hidden")}>{main}</div>
    {detail && <div className="hidden w-[320px] flex-col border-border border-l lg:flex">{detail}</div>}
  </div>;
}
