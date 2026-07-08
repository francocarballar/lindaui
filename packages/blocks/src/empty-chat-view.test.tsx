import { render, screen } from "@testing-library/react";
import { EmptyChatView } from "./empty-chat-view";
import { describe, test, expect } from "vitest";

describe("EmptyChatView", () => {
  test("renders the default title", () => {
    render(<EmptyChatView />);
    expect(screen.getByText("Elegí una conversación")).toBeInTheDocument();
  });

  test("renders a custom title and description", () => {
    render(<EmptyChatView title="Nada por acá" description="Probá otro filtro" />);
    expect(screen.getByText("Nada por acá")).toBeInTheDocument();
    expect(screen.getByText("Probá otro filtro")).toBeInTheDocument();
  });
});
