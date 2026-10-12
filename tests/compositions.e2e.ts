import { test } from "@e2e-dev/web";
import { expect } from "e2e";

test("destructive alerts preserve cancellation and record confirmation", async ({ app, screen }) => {
  await app.open("/iframe.html?id=components-alertdialog--default&viewMode=story");
  await screen.getByRole("button", "Eliminar registro").tap();
  await screen.getByRole("button", "Cancelar").tap();
  await expect(screen.getByRole("status")).toHaveText("Registro conservado");
  await screen.getByRole("button", "Eliminar registro").tap();
  await screen.getByRole("button", "Eliminar", { exact: true }).tap();
  await expect(screen.getByRole("status")).toHaveText("Registro eliminado");
  await expect(screen.getByRole("dialog")).toBeHidden();
});

test("drawers open, close and restore their trigger focus", async ({ app, screen }) => {
  await app.open("/iframe.html?id=components-drawer--default&viewMode=story");
  const trigger = screen.getByRole("button", "Abrir panel");
  await trigger.tap();
  await expect(screen.getByRole("dialog", "Detalle del turno")).toBeVisible();
  await screen.getByRole("button", "Cerrar panel").tap();
  await expect(screen.getByRole("dialog")).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("popovers reveal their content and close with Escape", async ({ app, screen }) => {
  await app.open("/iframe.html?id=components-popover--default&viewMode=story");
  const trigger = screen.getByRole("button", "Ver detalles");
  await trigger.tap();
  await expect(screen.getByText("Traé tu documento de identidad.")).toBeVisible();
  await screen.getByRole("dialog").press("Escape");
  await expect(screen.getByRole("dialog")).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("toasts display queue notifications after the action", async ({ app, screen }) => {
  await app.open("/iframe.html?id=components-toast--default&viewMode=story");
  await screen.getByRole("button", "Guardar cambios").tap();
  await expect(screen.getByText("Cambios guardados")).toBeVisible();
  await expect(screen.getByText("Tu información está actualizada.")).toBeVisible();
});

test("date pickers write a calendar selection into the field", async ({ app, screen }) => {
  await app.open("/iframe.html?id=components-datepicker--default&viewMode=story");
  await screen.getByRole("button", /Elegir fecha/).tap();
  await screen.getByRole("button", /Tuesday, October 13, 2026/).tap();
  await expect(screen.getByRole("spinbutton", /day/)).toHaveText("13");
});

test("date ranges can open their calendar and dismiss without changing dates", async ({ app, screen }) => {
  await app.open("/iframe.html?id=components-daterangepicker--default&viewMode=story");
  await screen.getByRole("button", /Elegir período/).tap();
  await expect(screen.getByRole("button", /Monday, October 12, 2026/)).toBeVisible();
  await screen.getByRole("button", /Monday, October 12, 2026/).press("Escape");
  await expect(screen.getByRole("button", /Elegir período/)).toBeFocused();
});

test("message composers send once and clear their controlled value", async ({ app, screen }) => {
  await app.open("/iframe.html?id=components-messagecomposer--default&viewMode=story");
  await expect(screen.getByRole("button", "Enviar")).toBeDisabled();
  const input = screen.getByRole("textbox", "Escribí un mensaje…");
  await input.fill("Confirmo mi turno");
  await input.press("Enter");
  await expect(screen.getByRole("status")).toHaveText("Enviado: Confirmo mi turno");
  await expect(input).toHaveValue("");
  await expect(screen.getByRole("button", "Enviar")).toBeDisabled();
});

test("conversation searches filter actual contacts and expose the empty state", async ({ app, screen }) => {
  await app.open("/iframe.html?id=components-conversationlist--default&viewMode=story");
  const input = screen.getByRole("searchbox", "Buscar");
  await input.fill("Grace");
  await expect(screen.getByRole("button", /Grace Hopper/)).toBeVisible();
  await expect(screen.getByRole("button", /Ada Lovelace/)).toBeHidden();
  await input.fill("missing");
  await expect(screen.getByText("Sin conversaciones")).toBeVisible();
});

test("table searches update rows and their visible count", async ({ app, screen }) => {
  await app.open("/iframe.html?id=components-tablepane--default&viewMode=story");
  await screen.getByRole("searchbox", "Buscar").fill("Ada");
  await expect(screen.getByRole("rowheader", "Ada Lovelace")).toBeVisible();
  await expect(screen.getByRole("rowheader", "Grace Hopper")).toBeHidden();
  await expect(screen.getByText(/Mostrando 1 de 2/)).toBeVisible();
});

test("custom time ranges preserve both controlled dates", async ({ app, screen }) => {
  await app.open("/iframe.html?id=components-timerangepicker--default&viewMode=story");
  await screen.getByRole("button", "Personalizado").tap();
  await screen.getByLabel("Desde").fill("2026-10-10");
  await expect(screen.getByLabel("Hasta")).toHaveValue("2026-10-15");
  await expect(screen.getByRole("status")).toHaveText("2026-10-10 → 2026-10-15");
});

test("audio players play and pause a local media fixture", async ({ app, screen }) => {
  await app.open("/iframe.html?id=components-audioplayer--default&viewMode=story");
  await screen.getByRole("button", "Reproducir").tap();
  await expect(screen.getByRole("button", "Pausar")).toBeVisible();
  await screen.getByRole("button", "Pausar").tap();
  await expect(screen.getByRole("button", "Reproducir")).toBeVisible();
});

test("color pickers open an interactive color area", async ({ app, screen }) => {
  await app.open("/iframe.html?id=components-colorpicker--default&viewMode=story");
  await screen.getByRole("button", "Elegir color").tap();
  const slider = screen.getByRole("slider", "Tono");
  await slider.press("ArrowRight");
  await expect(screen.getByRole("status")).not.toHaveText("#7c3aed");
  await slider.press("Escape");
  await expect(screen.getByRole("button", "Elegir color")).toBeFocused();
});
