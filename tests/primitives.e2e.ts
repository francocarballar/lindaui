import { test } from "@e2e-dev/web";
import { expect } from "e2e";

test("radio options support keyboard selection", async ({ app, screen }) => {
  await app.open("/iframe.html?id=components-radio--default&viewMode=story");
  await expect(screen.getByRole("radio", "Normal")).toBeChecked();
  await screen.getByRole("radio", "Normal").press("ArrowDown");
  await expect(screen.getByRole("radio", "Express")).toBeChecked();
  await expect(screen.getByRole("radio", "Normal")).not.toBeChecked();
});

test("switch groups keep independent values", async ({ app, screen }) => {
  await app.open("/iframe.html?id=components-switchgroup--default&viewMode=story");
  await expect(screen.getByRole("switch", "Correo electrónico")).toBeChecked();
  await expect(screen.getByRole("switch", "Mensajes de texto")).not.toBeChecked();
  await screen.getByText("Mensajes de texto").tap();
  await expect(screen.getByRole("switch", "Correo electrónico")).toBeChecked();
  await expect(screen.getByRole("switch", "Mensajes de texto")).toBeChecked();
  await screen.getByRole("switch", "Mensajes de texto").press("Space");
  await expect(screen.getByRole("switch", "Mensajes de texto")).not.toBeChecked();
});

test("color sliders update their value with the keyboard", async ({ app, screen, browser }) => {
  await app.open("/iframe.html?id=components-colorslider--default&viewMode=story");
  const slider = screen.getByRole("slider", "Tono");
  await expect(slider).toBeVisible();
  const before = await browser.evaluate(() => document.querySelector('[data-slot="color-slider-output"]')?.textContent ?? null);
  expect(before).toBeTruthy();
  await slider.press("ArrowRight");
  const after = await browser.evaluate(() => document.querySelector('[data-slot="color-slider-output"]')?.textContent ?? null);
  expect(after).toBeTruthy();
  expect(after).not.toBe(before);
});

test("input groups preserve editable inputs beside addons", async ({ app, screen }) => {
  await app.open("/iframe.html?id=components-inputgroup--default&viewMode=story");
  await screen.getByRole("textbox", "Importe").fill("125.50");
  await expect(screen.getByRole("textbox", "Importe")).toHaveValue("125.50");
  await expect(screen.getByText("USD")).toBeVisible();
});

test("pagination changes pages and enforces both boundaries", async ({ app, screen }) => {
  await app.open("/iframe.html?id=components-pagination--default&viewMode=story");
  await expect(screen.getByRole("button", "Anterior")).toBeDisabled();
  await screen.getByRole("button", "Siguiente").tap();
  await expect(screen.getByRole("status")).toHaveText("Página 2 de 3");
  await screen.getByRole("button", "3", { exact: true }).tap();
  await expect(screen.getByRole("status")).toHaveText("Página 3 de 3");
  await expect(screen.getByRole("button", "Siguiente")).toBeDisabled();
  await screen.getByRole("button", "Anterior").tap();
  await expect(screen.getByRole("status")).toHaveText("Página 2 de 3");
});
