"use client";
import {
  ModalBackdrop,
  ModalContainer,
  ModalDialog,
  ModalHeader,
  ModalHeading,
  ModalBody,
  ModalFooter,
  type ModalContainerProps,
} from "@heroui/react";
import type { ReactNode } from "react";

/**
 * Controlled dialog with a flat `open`/`onClose` API. HeroUI v3 has no
 * `ModalContent`; a controlled modal is composed from `ModalBackdrop`
 * (RAC ModalOverlay, the controlled open state) > `ModalContainer` >
 * `ModalDialog` (role=dialog) > header/body/footer.
 */
export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  size?: ModalContainerProps["size"];
  isDismissable?: boolean;
}

export function Dialog({
  open,
  onClose,
  title,
  footer,
  children,
  size = "md",
  isDismissable = true,
}: DialogProps) {
  return (
    <ModalBackdrop
      isOpen={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      isDismissable={isDismissable}
    >
      <ModalContainer size={size}>
        <ModalDialog>
          {title && (
            <ModalHeader>
              <ModalHeading>{title}</ModalHeading>
            </ModalHeader>
          )}
          <ModalBody>{children}</ModalBody>
          {footer && <ModalFooter>{footer}</ModalFooter>}
        </ModalDialog>
      </ModalContainer>
    </ModalBackdrop>
  );
}
