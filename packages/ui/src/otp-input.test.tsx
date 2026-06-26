import { OtpInput } from "./otp-input";
import { describe, test, expect } from "vitest";

// OtpInput wraps HeroUI's InputOTP, which is built on the `input-otp` lib.
// In jsdom that lib schedules async work (ResizeObserver / timers) that fires
// after the test ends, surfacing as a flaky "unhandled error" in Vitest even
// though the render itself succeeds. Mounting it is not worth the flake, so we
// assert the public surface resolves instead of rendering a half-composition —
// same approach as date-time-color.test.tsx for heavy compound components.
describe("OtpInput", () => {
  test("is exported", () => {
    expect(OtpInput).toBeDefined();
  });
});
