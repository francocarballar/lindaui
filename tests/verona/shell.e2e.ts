import { test } from "@e2e-dev/web";
import { expect } from "e2e";

test("dashboard shell renders navigation, search and footer", async ({ app, screen }) => {
  await app.open("/");
  await expect(screen.getByRole("heading", "SaaS Dashboard")).toBeVisible();
  await expect(screen.getByRole("link", "Home")).toBeVisible();
  await screen.getByRole("searchbox", "Search").fill("invoice");
  await expect(screen.getByRole("searchbox", "Search")).toHaveValue("invoice");
  await expect(screen.getByText("© Your Organization")).toBeVisible();
});

test("menu groups support Enter, Space and expanded state", async ({ app, screen }) => {
  await app.open("/");
  // Make the drawer visible on narrow displays, and restore desktop visibility
  // if the same toggle hid the sidebar there.
  await screen.getByRole("button", "Toggle menu").tap();
  const group = screen.getByRole("button", "Blog");
  if (!(await group.isVisible())) await screen.getByRole("button", "Toggle menu").tap();
  await expect(group).toHaveAttribute("aria-expanded", "false");
  await group.press("Enter");
  await expect(group).toHaveAttribute("aria-expanded", "true");
  await expect(screen.getByRole("link", "Edit", { exact: true })).toBeVisible();
  await group.press("Space");
  await expect(group).toHaveAttribute("aria-expanded", "false");
  await expect(screen.getByRole("link", "Edit", { exact: true })).toBeHidden();
});
