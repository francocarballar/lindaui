import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { AppShellFooter } from "./app-shell";

describe("AppShellFooter", () => {
  test("uses injected identity, connection, theme and installation actions", async () => {
    const onInstall = vi.fn();
    const onToggleTheme = vi.fn();
    render(<AppShellFooter
      isConnected isInstallable mounted theme="dark" onInstall={onInstall}
      onToggleTheme={onToggleTheme} onSignOut={vi.fn()} user={{ displayName: "Avery", initials: "AV" }}
    />);
    expect(screen.getByText("Avery")).toBeInTheDocument();
    expect(screen.getByText("Connected")).toHaveClass("text-success");
    await userEvent.click(screen.getByRole("button", { name: "Install app" }));
    await userEvent.click(screen.getByRole("button", { name: "Light mode" }));
    expect(onInstall).toHaveBeenCalledOnce();
    expect(onToggleTheme).toHaveBeenCalledOnce();
  });

  test("collapsed actions remain named and keyboard-operable, without expanded-only content", async () => {
    const onToggleTheme = vi.fn();
    render(<AppShellFooter isCollapsed isInstallable mounted theme="light" onToggleTheme={onToggleTheme} onSignOut={vi.fn()} />);
    expect(screen.queryByRole("button", { name: "Install app" })).not.toBeInTheDocument();
    const themeButton = screen.getByRole("button", { name: "Dark mode" });
    themeButton.focus();
    await userEvent.keyboard("{Enter}");
    expect(onToggleTheme).toHaveBeenCalledOnce();
    await userEvent.click(screen.getByRole("button", { name: "Sign out" }));
    const dialog = await screen.findByRole("alertdialog");
    expect(within(dialog).getByText("Sign out?")).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
  });

  test("confirms logout once, blocks dismissal while pending and closes only on success", async () => {
    let complete!: () => void;
    const onSignOut = vi.fn(() => new Promise<void>((resolve) => { complete = resolve; }));
    render(<AppShellFooter onSignOut={onSignOut} />);
    await userEvent.click(screen.getByRole("button", { name: "Sign out" }));
    const dialog = await screen.findByRole("alertdialog");
    await userEvent.click(within(dialog).getByRole("button", { name: "Sign out" }));
    expect(onSignOut).toHaveBeenCalledOnce();
    expect(within(dialog).getByRole("button", { name: "Cancel" })).toBeDisabled();
    await userEvent.keyboard("{Escape}");
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("button", { name: /Signing out/ }));
    expect(onSignOut).toHaveBeenCalledOnce();
    await act(async () => complete());
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
  });

  test("shows the supplied error and allows retry after rejected logout", async () => {
    const onSignOut = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce(undefined);
    render(<AppShellFooter onSignOut={onSignOut} labels={{ logoutError: "No se pudo cerrar la sesión" }} showConnectionStatus={false} />);
    expect(screen.queryByText("Disconnected")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Sign out" }));
    const dialog = await screen.findByRole("alertdialog");
    await userEvent.click(within(dialog).getByRole("button", { name: "Sign out" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("No se pudo cerrar la sesión");
    await userEvent.click(within(dialog).getByRole("button", { name: "Sign out" }));
    expect(onSignOut).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
  });
});
