"use client";
import { useState } from "react";
import { Dialog } from "@lindaui/ui/dialog";
import { Button } from "@lindaui/ui/button";

export interface ConfirmationDialogProps { open: boolean; onClose: () => void; onConfirm: () => void | Promise<void>; }
export function ConfirmationDialog({ open, onClose, onConfirm }: ConfirmationDialogProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  function close() {
    if (pending) return;
    setError(null); onClose();
  }
  async function confirm() {
    if (pending) return;
    setPending(true); setError(null);
    try { await onConfirm(); setError(null); onClose(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not confirm"); } finally { setPending(false); }
  }
  return <Dialog open={open} onClose={close} title="Confirm action" isDismissable={!pending} footer={<><Button variant="ghost" isDisabled={pending} onPress={close}>Cancel</Button><Button variant="primary" isDisabled={pending} onPress={confirm}>{pending ? "Confirming…" : "Confirm"}</Button></>}><p>Review the action before continuing.</p>{error && <p role="alert">{error}</p>}</Dialog>;
}
