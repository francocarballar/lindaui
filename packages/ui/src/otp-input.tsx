"use client";
import { InputOTP, type InputOTPProps } from "@heroui/react";
export type OtpInputProps = InputOTPProps;

/** One-time-password input. HeroUI v3 `InputOTP` renders its own slots. */
export function OtpInput(props: OtpInputProps) {
  return <InputOTP {...props} />;
}
