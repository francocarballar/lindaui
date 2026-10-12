"use client";

import { Button, Modal, Spinner } from "@lindaui/ui/compound";
import { useRef, useState } from "react";
import type { AppShellFooterLabels } from "./footer";

export function useLogoutDialog(onSignOut: () => void | Promise<void>, labels: AppShellFooterLabels) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pending = useRef(false);

  const onOpenChange = (open: boolean) => {
    if (pending.current) return;
    setError(null);
    setIsOpen(open);
  };
  const confirm = async () => {
    if (pending.current) return;
    pending.current = true;
    setIsPending(true);
    setError(null);
    try {
      await onSignOut();
      setIsOpen(false);
    } catch {
      setError(labels.logoutError);
    } finally {
      pending.current = false;
      setIsPending(false);
    }
  };

  return {
    open: () => onOpenChange(true),
    dialog: (
      <Modal.Backdrop
        isDismissable={!isPending}
        isKeyboardDismissDisabled={isPending}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-md" role="alertdialog">
            <Modal.Header><Modal.Heading>{labels.logoutTitle}</Modal.Heading></Modal.Header>
            <Modal.Body>
              <p className="text-muted text-sm leading-relaxed">{labels.logoutDescription}</p>
              {error ? <p className="mt-3 text-danger text-sm" role="alert">{error}</p> : null}
            </Modal.Body>
            <Modal.Footer>
              <Button autoFocus isDisabled={isPending} onPress={() => onOpenChange(false)} variant="tertiary">
                {labels.logoutCancel}
              </Button>
              <Button isPending={isPending} onPress={confirm} variant="danger">
                {({ isPending: buttonPending }) => (
                  <>
                    {buttonPending ? <Spinner color="current" size="sm" /> : null}
                    {buttonPending ? labels.logoutPending : labels.logoutConfirm}
                  </>
                )}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    ),
  };
}
