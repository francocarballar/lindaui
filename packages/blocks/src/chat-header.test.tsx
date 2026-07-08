import { render, screen } from "@testing-library/react";
import { ChatHeader } from "./chat-header";
import { describe, test, expect } from "vitest";

describe("ChatHeader", () => {
  test("renders title, subtitle, avatar and actions", () => {
    render(
      <ChatHeader
        avatar={<span>AV</span>}
        title="Juan Pérez"
        subtitle="En línea"
        actions={<button type="button">Menú</button>}
      />,
    );
    expect(screen.getByText("AV")).toBeInTheDocument();
    expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
    expect(screen.getByText("En línea")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Menú" })).toBeInTheDocument();
  });

  test("renders without optional slots", () => {
    render(<ChatHeader title="Solo título" />);
    expect(screen.getByText("Solo título")).toBeInTheDocument();
  });
});
