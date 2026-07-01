import { render, screen } from "@testing-library/react";
import { WorkspaceBackButton } from "./workspace-back-button";
import { describe, test, expect } from "vitest";

describe("WorkspaceBackButton", () => {
  test("renders a link with label and href", () => {
    render(<WorkspaceBackButton href="/docs" label="Volver" />);
    const link = screen.getByRole("link", { name: /Volver/ });
    expect(link).toHaveAttribute("href", "/docs");
  });

  test("accepts a custom icon", () => {
    render(
      <WorkspaceBackButton
        href="/x"
        label="Atrás"
        icon={<svg data-x aria-hidden />}
      />,
    );
    expect(screen.getByRole("link", { name: /Atrás/ })).toBeInTheDocument();
  });
});
