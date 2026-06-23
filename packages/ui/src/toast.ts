"use client";
// HeroUI v3 ships a queue-based toast API (`toast`/`toastQueue` + a
// <ToastProvider/> mounted at the app root) rather than the v2 `addToast`
// function the plan assumed. Re-exported directly so the real, correct API
// is available without a lossy shim.
export { toast, toastQueue, ToastProvider } from "@heroui/react";
