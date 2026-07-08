import { render, screen } from "@testing-library/react";
import { ChatTimeDivider } from "./chat-time-divider";
import { describe, test, expect } from "vitest";

describe("ChatTimeDivider", () => {
  test("renders the given label", () => {
    render(<ChatTimeDivider label="09:00" />);
    expect(screen.getByRole("separator", { name: "09:00" })).toBeInTheDocument();
  });
});
