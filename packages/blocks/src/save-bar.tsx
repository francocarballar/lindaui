"use client";

import { Button, Spinner } from "@lindaui/ui/compound";
import type { ReactNode } from "react";

export interface SaveBarProps {
  dirty: boolean;
  saving: boolean;
  form: string;
  embedded?: boolean;
  labels: { pending: ReactNode; upToDate: ReactNode; submit: ReactNode };
}

/** Submit an existing form by id without owning its data or persistence. */
export function SaveBar({ dirty, saving, form, embedded = false, labels }: SaveBarProps) {
  return (
    <div className={embedded
      ? "sticky bottom-0 z-10 border-border border-t bg-surface px-4 py-3 lg:px-6"
      : "fixed inset-x-0 bottom-24 z-40 border-border border-y bg-surface px-4 py-3 lg:static lg:border-b-0 lg:px-8"}>
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
        <p aria-live="polite" className="text-muted text-sm">{dirty ? labels.pending : labels.upToDate}</p>
        <Button
          className="shrink-0 whitespace-nowrap"
          form={form}
          isDisabled={!dirty || saving}
          isPending={saving}
          type="submit"
          variant="primary"
        >
          {({ isPending }) => <>{isPending && <Spinner color="current" size="sm" />}{labels.submit}</>}
        </Button>
      </div>
    </div>
  );
}
