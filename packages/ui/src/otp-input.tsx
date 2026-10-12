"use client";
import { InputOTP, type InputOTPProps } from "@heroui/react";
import type { ReactNode } from "react";
export type OtpInputProps = Omit<InputOTPProps, "children"> & { children?: ReactNode };

/** One-time-password input with visible slots by default and optional custom composition. */
export function OtpInput({ children, maxLength, ...props }: OtpInputProps) {
  return <InputOTP {...props} maxLength={maxLength}>
    {children === undefined ? <InputOTP.Group>
      {Array.from({ length: maxLength }, (_, index) => <InputOTP.Slot key={index} index={index} />)}
    </InputOTP.Group> : children}
  </InputOTP>;
}
