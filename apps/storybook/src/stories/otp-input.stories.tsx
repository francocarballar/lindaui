import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { OtpInput } from "@lindaui/ui/otp-input";

function VerificationDemo() {
  const [complete, setComplete] = useState("");
  return <>
    <OtpInput aria-label="Verification code" maxLength={6} onComplete={setComplete} />
    <p role="status">{complete ? `Code entered: ${complete}` : "Enter six characters"}</p>
  </>;
}

export default { title: "Forms/OtpInput", component: VerificationDemo } satisfies Meta<typeof VerificationDemo>;
type Story = StoryObj<typeof VerificationDemo>;
export const Default: Story = {};
