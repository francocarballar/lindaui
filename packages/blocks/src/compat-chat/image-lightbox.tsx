"use client";

import { Modal } from "@lindaui/ui/compound";
import { useCallback } from "react";
import { useDisclosure } from "@lindaui/ui/use-disclosure";

export interface ImageLightboxProps { alt?: string; className?: string; src: string; }
export function ImageLightbox({ src, alt = "Media", className }: ImageLightboxProps) {
  const { isOpen, open: onOpen, close: onClose } = useDisclosure();
  const handleOpenChange = useCallback((open: boolean) => { if (!open) onClose(); }, [onClose]);
  return <>
    <button aria-label={`Ver imagen: ${alt}`} className={`cursor-pointer rounded-lg p-0 transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent ${className ?? ""}`} onClick={onOpen} type="button">
      <img alt={alt} className="h-44 w-full max-w-[220px] rounded-lg object-cover" height={600} loading="lazy" src={src} width={800} />
    </button>
    <Modal.Backdrop className="bg-black/80" isOpen={isOpen} onOpenChange={handleOpenChange} variant="blur">
      <Modal.Container className="overflow-hidden" size="full"><Modal.Dialog aria-label={alt} className="m-0 rounded-none shadow-none">
        <Modal.CloseTrigger className="top-4 right-4 z-10 rounded-full bg-black/50 text-white hover:bg-black/70" />
        <Modal.Body className="flex h-full items-center justify-center overflow-hidden p-4"><img alt={alt} className="max-h-full max-w-full rounded-lg object-contain" height={1080} src={src} width={1920} /></Modal.Body>
      </Modal.Dialog></Modal.Container>
    </Modal.Backdrop>
  </>;
}
