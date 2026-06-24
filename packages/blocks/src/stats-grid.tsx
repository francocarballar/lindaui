import type { ReactNode } from "react";

export interface StatsGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

const lgColsClass: Record<2 | 3 | 4, string> = {
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
};

export function StatsGrid({ children, columns = 4, className = "" }: StatsGridProps) {
  return (
    <div
      className={`grid gap-4 grid-cols-1 sm:grid-cols-2 ${lgColsClass[columns]} ${className}`}
    >
      {children}
    </div>
  );
}
