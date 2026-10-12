import { OtpInput } from "./otp-input";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, test, expect, vi } from "vitest";

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("OtpInput", () => {
  test("is exported", () => {
    expect(OtpInput).toBeDefined();
  });
  test("renders visible slots without requiring consumers to compose them", async () => {
    vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
    const user = userEvent.setup();
    const { unmount } = render(<OtpInput aria-label="Verification code" maxLength={6} pushPasswordManagerStrategy="none" />);
    await user.type(screen.getByRole("textbox", { name: "Verification code" }), "123456");
    for (const digit of "123456") expect(screen.getByText(digit)).toBeVisible();
    unmount();
  });
  test("accepts an OTP and forwards completed values", async () => {
    vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onComplete = vi.fn();
    const { unmount } = render(<OtpInput aria-label="Verification code" maxLength={6} pushPasswordManagerStrategy="none" onChange={onChange} onComplete={onComplete}><span>Code</span></OtpInput>);
    await user.type(screen.getByRole("textbox", { name: "Verification code" }), "123456");
    expect(screen.getByRole("textbox", { name: "Verification code" })).toHaveValue("123456");
    expect(onChange).toHaveBeenLastCalledWith("123456");
    await waitFor(() => expect(onComplete).toHaveBeenCalledWith("123456"));
    unmount();
  });
});
