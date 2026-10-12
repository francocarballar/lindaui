"use client";

import { Button, Modal, Spinner } from "@lindaui/ui/compound";
import { useRef, useState, type ReactNode } from "react";

export interface ConnectionDetail {
  id: string;
  label: ReactNode;
  value: ReactNode;
  valueClassName?: string;
  dateTime?: string;
}

export interface ConnectedPanelLabels {
  disconnectHint: ReactNode;
  disconnect: ReactNode;
  disconnecting: ReactNode;
  disconnectError: ReactNode;
  confirmTitle: ReactNode;
  confirmDescription: ReactNode;
  cancel: ReactNode;
}

export interface ConnectedPanelProps {
  details: readonly ConnectionDetail[];
  labels: ConnectedPanelLabels;
  error?: ReactNode;
  onDisconnect: () => Promise<void>;
}

/** Connection metadata and an async, non-dismissable-while-pending confirmation. */
export function ConnectedPanel({ details, labels, error: connectionError, onDisconnect }: ConnectedPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<ReactNode>(null);
  const pending = useRef(false);

  async function disconnect() {
    if (pending.current) return;
    pending.current = true;
    setIsPending(true);
    setError(null);
    try {
      await onDisconnect();
      setIsOpen(false);
    } catch {
      setError(labels.disconnectError);
    } finally {
      pending.current = false;
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <dl className="divide-y divide-border/60 text-sm">
        {details.map(({ id, label, value, valueClassName, dateTime }) => (
          <div className="flex flex-col gap-1 py-4 sm:flex-row sm:justify-between sm:gap-6" key={id}>
            <dt className="text-muted">{label}</dt>
            <dd className={valueClassName}>
              {dateTime ? <time dateTime={dateTime}>{value}</time> : value}
            </dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-col items-start gap-3 border-border/60 border-t pt-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <p className="max-w-sm text-muted text-xs leading-relaxed">{labels.disconnectHint}</p>
        <Button
          className="min-h-11 shrink-0"
          onPress={() => { setError(null); setIsOpen(true); }}
          variant="danger-soft"
        >
          {labels.disconnect}
        </Button>
      </div>
      {connectionError && !isOpen && <p className="text-danger text-sm" role="alert">{connectionError}</p>}
      <Modal.Backdrop
        isDismissable={!isPending}
        isKeyboardDismissDisabled={isPending}
        isOpen={isOpen}
        onOpenChange={(open) => { if (!pending.current) setIsOpen(open); }}
      >
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-md" role="alertdialog">
            <Modal.Header>
              <Modal.Heading>{labels.confirmTitle}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <p className="text-muted text-sm leading-relaxed">{labels.confirmDescription}</p>
              {error && <p className="mt-3 text-danger text-sm" role="alert">{error}</p>}
            </Modal.Body>
            <Modal.Footer>
              <Button autoFocus isDisabled={isPending} onPress={() => setIsOpen(false)} variant="tertiary">
                {labels.cancel}
              </Button>
              <Button isPending={isPending} onPress={disconnect} variant="danger">
                {isPending && <Spinner color="current" size="sm" />}
                {isPending ? labels.disconnecting : labels.disconnect}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </div>
  );
}
