import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StrictMode } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import {
  ConnectionPanel,
  ConnectedPanel,
  type ConnectionPanelLabels,
  type ConnectionPanelProps,
  type ConnectedPanelProps,
} from "./connection-panel";

const labels: ConnectionPanelLabels = {
  checking: "Checking connection",
  generating: "Generating code",
  waiting: "Waiting for scan",
  disconnectedDescription: "Connect your device",
  connect: "Connect",
  connectError: "Connection failed. Try again.",
  refresh: "Refresh code",
  expiresSoon: "Expires soon",
  expiresIn: (time) => `Expires in ${time}`,
  instructions: ["Open the app", "Link a device", "Scan the code"],
  disconnectedInstructions: ["Open the app", "Link a device", "Generate a code"],
};

function panelProps(overrides: Partial<ConnectionPanelProps> = {}): ConnectionPanelProps {
  return {
    labels,
    state: { status: "disconnected" },
    onConnect: vi.fn().mockResolvedValue(undefined),
    onRefreshQR: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

const connectedProps: ConnectedPanelProps = {
  details: [
    { id: "number", label: "Number", value: "+54 11 5555 0100", valueClassName: "tabular-nums" },
    { id: "since", label: "Connected since", value: "11 Oct 2026", dateTime: "2026-10-11T12:00:00Z" },
  ],
  labels: {
    disconnectHint: "Disconnect this device",
    disconnect: "Disconnect",
    disconnecting: "Disconnecting",
    disconnectError: "Unable to disconnect. Try again.",
    confirmTitle: "Disconnect device?",
    confirmDescription: "You will need to link it again.",
    cancel: "Cancel",
  },
  onDisconnect: async () => undefined,
};

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("ConnectionPanel", () => {
  test("checking has a status and no connection action", () => {
    render(<ConnectionPanel {...panelProps({ state: { status: "checking" } })} />);
    expect(screen.getByRole("status", { name: "" })).toHaveTextContent("Checking connection");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  test("generating preserves instructions but hides the connect action", () => {
    render(<ConnectionPanel {...panelProps({ state: { status: "generating" } })} />);
    expect(screen.getByRole("status", { name: "" })).toHaveTextContent("Generating code");
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.queryByRole("button", { name: "Connect" })).not.toBeInTheDocument();
  });

  test("disconnected shows action failures and clears them on successful retry", async () => {
    const onConnect = vi.fn().mockRejectedValueOnce(new Error("unavailable")).mockResolvedValue(undefined);
    render(<ConnectionPanel {...panelProps({ onConnect })} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Connect" }));
    expect(screen.getByRole("alert")).toHaveTextContent(labels.connectError as string);
    await user.click(screen.getByRole("button", { name: "Connect" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(onConnect).toHaveBeenCalledTimes(2);
  });

  test("a pending connect cannot be submitted twice", async () => {
    let resolve!: () => void;
    const onConnect = vi.fn(() => new Promise<void>((done) => { resolve = done; }));
    render(<ConnectionPanel {...panelProps({ onConnect })} />);
    fireEvent.click(screen.getByRole("button", { name: /Connect/ }));
    fireEvent.click(screen.getByRole("button", { name: /Connect/ }));
    expect(onConnect).toHaveBeenCalledOnce();
    await act(async () => resolve());
  });

  test("shows backend error in preference to an action error", async () => {
    render(<ConnectionPanel {...panelProps({ error: "Device revoked", onConnect: vi.fn().mockRejectedValue(new Error()) })} />);
    await userEvent.click(screen.getByRole("button", { name: "Connect" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Device revoked");
  });

  test("connected renders its content rather than QR or connect actions", () => {
    render(<ConnectionPanel {...panelProps({ state: { status: "connected", content: <ConnectedPanel {...connectedProps} /> } })} />);
    expect(screen.getByText("+54 11 5555 0100")).toBeInTheDocument();
    expect(screen.getByText("11 Oct 2026")).toHaveAttribute("datetime", "2026-10-11T12:00:00Z");
    expect(screen.queryByRole("button", { name: "Connect" })).not.toBeInTheDocument();
  });

  test("counts down, shows expiry overlay, refreshes once and resets", async () => {
    vi.useFakeTimers();
    const onRefreshQR = vi.fn().mockResolvedValue(undefined);
    render(<StrictMode><ConnectionPanel {...panelProps({ onRefreshQR, state: { status: "awaiting_scan", qrCode: <svg aria-label="Code" role="img" /> } })} /></StrictMode>);
    expect(screen.getByRole("status", { name: "" })).toHaveTextContent("Waiting for scan");
    expect(screen.getByText("Expires in 1:00")).toBeInTheDocument();
    await act(async () => { vi.advanceTimersByTime(50_000); });
    expect(screen.getByText("Expires soon")).toBeInTheDocument();
    expect(screen.getByText("Expires in 0:10")).toBeInTheDocument();
    await act(async () => { vi.advanceTimersByTime(10_000); });
    expect(onRefreshQR).toHaveBeenCalledOnce();
    expect(screen.getByText("Expires in 1:00")).toBeInTheDocument();
  });

  test("inactive QR panels do not refresh and resume with the original expiry", async () => {
    vi.useFakeTimers();
    const props = panelProps({ isActive: false, state: { status: "awaiting_scan", qrCode: <pre>QR</pre>, qrFormat: "ascii" } });
    const { rerender } = render(<ConnectionPanel {...props} />);
    await act(async () => { vi.advanceTimersByTime(120_000); });
    expect(props.onRefreshQR).not.toHaveBeenCalled();
    rerender(<ConnectionPanel {...props} isActive />);
    await act(async () => { vi.advanceTimersByTime(1_000); });
    expect(screen.getByText("Expires in 0:59")).toBeInTheDocument();
  });

  test("auto refresh failure waits for an explicit retry and cannot overlap requests", async () => {
    vi.useFakeTimers();
    let reject!: (error: Error) => void;
    const onRefreshQR = vi.fn()
      .mockImplementationOnce(() => new Promise<void>((_, fail) => { reject = fail; }))
      .mockResolvedValue(undefined);
    render(<ConnectionPanel {...panelProps({ onRefreshQR, qrExpirySeconds: 2, state: { status: "awaiting_scan", qrCode: <pre>QR</pre> } })} />);
    await act(async () => { vi.advanceTimersByTime(2_000); });
    fireEvent.click(screen.getByRole("button", { name: /Refresh code/ }));
    await act(async () => { vi.advanceTimersByTime(120_000); });
    expect(onRefreshQR).toHaveBeenCalledOnce();
    await act(async () => reject(new Error("offline")));
    expect(screen.getByRole("alert")).toHaveTextContent("Connection failed");
    await act(async () => { vi.advanceTimersByTime(120_000); });
    expect(onRefreshQR).toHaveBeenCalledOnce();
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Refresh code" })); });
    expect(onRefreshQR).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByText("Expires in 0:02")).toBeInTheDocument();
  });

  test("unmount clears the expiry timer", async () => {
    vi.useFakeTimers();
    const props = panelProps({ state: { status: "awaiting_scan", qrCode: "QR" } });
    const { unmount } = render(<ConnectionPanel {...props} />);
    unmount();
    await act(async () => { vi.advanceTimersByTime(120_000); });
    expect(props.onRefreshQR).not.toHaveBeenCalled();
  });
});

describe("ConnectedPanel", () => {
  test("requires confirmation and allows cancelling without disconnecting", async () => {
    const onDisconnect = vi.fn();
    render(<ConnectedPanel {...connectedProps} onDisconnect={onDisconnect} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Disconnect" }));
    expect(screen.getByRole("alertdialog", { name: "Disconnect device?" })).toBeInTheDocument();
    expect(onDisconnect).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(onDisconnect).not.toHaveBeenCalled();
  });

  test("pending confirmation disables cancel and Escape; a failed disconnect stays open for retry", async () => {
    let reject!: (error: Error) => void;
    const onDisconnect = vi.fn()
      .mockImplementationOnce(() => new Promise<void>((_, fail) => { reject = fail; }))
      .mockResolvedValue(undefined);
    render(<ConnectedPanel {...connectedProps} onDisconnect={onDisconnect} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Disconnect" }));
    await user.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Disconnect" }));
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: /Disconnecting/ }));
    await user.keyboard("{Escape}");
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(onDisconnect).toHaveBeenCalledOnce();
    await act(async () => reject(new Error("unavailable")));
    expect(screen.getByRole("alert")).toHaveTextContent("Unable to disconnect");
    expect(screen.getByRole("button", { name: "Cancel" })).not.toBeDisabled();
    await user.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Disconnect" }));
    expect(onDisconnect).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
  });
});
