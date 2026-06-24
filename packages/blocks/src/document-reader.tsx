import type { ReactNode } from "react";

export interface DocumentReaderProps {
  content: string;
}

export function DocumentReader({ content }: DocumentReaderProps) {
  const blocks = content.trim().split(/\n\s*\n/);

  return (
    <div className="flex flex-col gap-4">
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        const heading = lines[0];
        const body = lines.slice(1).join(" ");
        return (
          <div key={i}>
            <div className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
              {heading}
            </div>
            {body && (
              <p className="mt-1.5 text-[13px] leading-relaxed text-pretty sm:text-sm">{body}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
