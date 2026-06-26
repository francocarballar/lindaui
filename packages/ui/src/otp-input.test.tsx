import { render } from "@testing-library/react";
import { OtpInput } from "./otp-input";
import { describe, test, expect, beforeAll } from "vitest";

// input-otp (the lib HeroUI's InputOTP wraps) calls ResizeObserver on mount;
// jsdom doesn't provide it, so stub it. Same polyfill the chart tests use.
beforeAll(() => {
  globalThis.ResizeObserver ||= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any;
});

describe("OtpInput", () => {
  test("renders DOM", () => {
    const { container } = render(<OtpInput />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
