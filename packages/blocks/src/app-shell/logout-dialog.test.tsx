import { act, renderHook } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { useLogoutDialog } from "./logout-dialog";
import type { AppShellFooterLabels } from "./footer";

test("logout guards repeated callbacks and dismissal while the operation is pending", async () => {
  let finish!: () => void;
  const operation = new Promise<void>(resolve => { finish = resolve; });
  const signOut = vi.fn(() => operation);
  const labels = {
    logoutTitle: "Salir", logoutDescription: "Confirmar salida", logoutCancel: "Cancelar",
    logoutPending: "Saliendo", logoutConfirm: "Confirmar", logoutError: "Error",
  } as AppShellFooterLabels;
  const { result } = renderHook(() => useLogoutDialog(signOut, labels));
  act(() => result.current.open());
  const backdrop = result.current.dialog;
  const dialog = backdrop.props.children.props.children;
  const confirm = dialog.props.children[2].props.children[1].props.onPress;
  let pending!: Promise<void>;
  act(() => {
    pending = confirm();
    confirm();
    backdrop.props.onOpenChange(false);
    result.current.open();
  });
  expect(signOut).toHaveBeenCalledTimes(1);
  expect(result.current.dialog.props.isOpen).toBe(true);
  expect(result.current.dialog.props.isDismissable).toBe(false);
  expect(result.current.dialog.props.isKeyboardDismissDisabled).toBe(true);
  await act(async () => { finish(); await pending; });
  expect(result.current.dialog.props.isOpen).toBe(false);
  expect(result.current.dialog.props.isDismissable).toBe(true);
});
