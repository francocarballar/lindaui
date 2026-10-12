import { test } from "@e2e-dev/web";
import { expect } from "e2e";

test("OTP renders all characters and reports completion", async ({ app, screen }) => {
  await app.open("/iframe.html?id=forms-otpinput--default&viewMode=story");
  await screen.getByRole("textbox", "Verification code").fill("123456");
  for (const digit of "123456") await expect(screen.getByText(digit)).toBeVisible();
  await expect(screen.getByRole("status")).toHaveText("Code entered: 123456");
});

test("dialog opens, closes and restores focus", async ({ app, screen }) => {
  await app.open("/iframe.html?id=overlays-dialog--default&viewMode=story");
  const trigger = screen.getByRole("button", "Abrir diálogo");
  await trigger.tap();
  await expect(screen.getByRole("dialog", "Título del diálogo")).toBeVisible();
  await screen.getByRole("button", "Cancelar").tap();
  await expect(screen.getByRole("dialog")).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.tap();
  await screen.getByRole("button", "Confirmar").tap();
  await expect(screen.getByRole("dialog")).toBeHidden();
});

test("select changes the visible value", async ({ app, screen }) => {
  await app.open("/iframe.html?id=forms-select--default&viewMode=story");
  await screen.getByRole("button", /Tipo de estudio/).tap();
  await screen.getByRole("option", "TAC Cerebro").tap();
  await expect(screen.getByRole("button", /Tipo de estudio/)).toContainText("TAC Cerebro");
});

test("disabled controls cannot be activated", async ({ app, screen }) => {
  await app.open("/iframe.html?id=buttons-button--states&viewMode=story");
  await expect(screen.getByRole("button", "Normal")).toBeEnabled();
  await expect(screen.getByRole("button", "Disabled")).toBeDisabled();
});

test("table renders accessible rows and its empty state", async ({ app, screen }) => {
  await app.open("/iframe.html?id=data-table--default&viewMode=story");
  await expect(screen.getByRole("grid", "Estudios")).toBeVisible();
  await expect(screen.getByRole("row")).toHaveCount(4);
  await expect(screen.getByRole("rowheader", "María Gómez")).toBeVisible();
  await app.open("/iframe.html?id=data-table--vacia&viewMode=story");
  await expect(screen.getByText("Sin estudios cargados")).toBeVisible();
});

test("login supports editable credentials, errors and loading", async ({ app, screen }) => {
  await app.open("/iframe.html?id=blocks-loginform--default&viewMode=story");
  await screen.getByRole("textbox", "Email").fill("ada@example.test");
  await screen.getByLabel("Contraseña").fill("test-password");
  await expect(screen.getByRole("textbox", "Email")).toHaveValue("ada@example.test");
  await screen.getByRole("button", "Ingresar").tap();
  await app.open("/iframe.html?id=blocks-loginform--with-error&viewMode=story");
  await expect(screen.getByRole("alert")).toContainText("Credenciales inválidas");
  await app.open("/iframe.html?id=blocks-loginform--loading&viewMode=story");
  await expect(screen.getByRole("button", "Ingresar")).toBeDisabled();
});

test("field arrays expose category names and submit complete values", async ({ app, screen }) => {
  await app.open("/iframe.html?id=blocks-fieldarrayform--default&viewMode=story");
  await screen.getByRole("button", /Modalidad/).tap();
  await screen.getByRole("option", "Tomografía Computada (TC)").tap();
  await screen.getByRole("textbox", "Nombre del estudio").fill("TC Abdomen");
  await screen.getByRole("button", "Agregar parámetro").tap();
  await screen.getByRole("textbox", "Campo 1").fill("Cortes");
  await screen.getByRole("textbox", "Valor 1").fill("5mm");
  await screen.getByRole("button", "Crear plantilla").tap();
  await expect(screen.getByRole("status", "Submitted values")).toHaveText('{"category":"tc","name":"TC Abdomen","entries":[{"key":"Cortes","value":"5mm"}]}');
  await screen.getByRole("button", "Eliminar entrada").tap();
  await expect(screen.getByRole("textbox", "Campo 1")).toBeHidden();
});
