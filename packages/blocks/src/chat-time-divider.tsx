"use client";

export interface ChatTimeDividerProps {
  label: string;
}

/** Header sticky de grupo horario (variante más chica que {@link ChatDateDivider}). */
export function ChatTimeDivider({ label }: ChatTimeDividerProps) {
  return (
    <div
      className="sticky top-0 z-10 flex justify-center bg-card/80 py-1.5 backdrop-blur"
      role="separator"
      aria-label={label}
    >
      <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-medium text-secondary-foreground">
        {label}
      </span>
    </div>
  );
}
