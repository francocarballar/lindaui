import type { ReactNode } from "react";

export function ConnectionInstructions({ items }: { items: readonly ReactNode[] }) {
  return (
    <ol className="mx-auto w-fit list-inside list-decimal space-y-2 text-left text-muted text-sm">
      {items.map((item, index) => <li key={index}>{item}</li>)}
    </ol>
  );
}
