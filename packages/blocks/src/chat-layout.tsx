"use client";
import type { ReactNode } from "react";

export type ChatLayoutPanel = "sidebar" | "main" | "detail";

export interface ChatLayoutProps {
  sidebar: ReactNode;
  main: ReactNode;
  detail?: ReactNode;
  /** Panel visible en mobile (un solo panel a la vez). Default "sidebar". */
  activePanel?: ChatLayoutPanel;
}

/** Shell responsive de 3 columnas (sidebar/main/detail); mobile-first, un panel a la vez. */
export function ChatLayout({ sidebar, main, detail, activePanel = "sidebar" }: ChatLayoutProps) {
  return (
    <div className="flex h-full min-h-0 w-full overflow-hidden">
      <div
        className={`w-full shrink-0 border-r border-border sm:block sm:w-80 ${
          activePanel === "sidebar" ? "block" : "hidden sm:block"
        }`}
      >
        {sidebar}
      </div>
      <div
        className={`min-w-0 flex-1 sm:block ${activePanel === "main" ? "block" : "hidden sm:block"}`}
      >
        {main}
      </div>
      {detail != null && (
        <div
          className={`w-full shrink-0 border-l border-border lg:block lg:w-96 ${
            activePanel === "detail" ? "block" : "hidden lg:block"
          }`}
        >
          {detail}
        </div>
      )}
    </div>
  );
}
