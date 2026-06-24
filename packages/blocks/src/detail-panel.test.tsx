import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi } from "vitest";
import { DetailPanel } from "./detail-panel";

describe("DetailPanel", () => {
  test("shows empty state when selected=false", () => {
    render(<DetailPanel selected={false} emptyTitle="Seleccioná un elemento" />);
    expect(screen.getByText("Seleccioná un elemento")).toBeInTheDocument();
  });

  test("shows empty state when title is undefined even if selected=true", () => {
    render(<DetailPanel selected emptyTitle="Nada seleccionado" />);
    expect(screen.getByText("Nada seleccionado")).toBeInTheDocument();
  });

  test("shows detail content when selected=true and title provided", () => {
    render(
      <DetailPanel
        selected
        title="John Doe"
        subtitle="Engineer"
        meta={[{ label: "Estado", value: "Activo" }]}
        action={{ label: "Abrir", onPress: vi.fn() }}
      />
    );
    expect(screen.getByRole("heading", { name: "John Doe" })).toBeInTheDocument();
    expect(screen.getByText("Activo")).toBeInTheDocument();
  });

  test("CTA button fires action.onPress", async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    render(
      <DetailPanel
        selected
        title="Test Item"
        action={{ label: "Confirmar", onPress }}
      />
    );
    await user.click(screen.getByRole("button", { name: /Confirmar/ }));
    expect(onPress).toHaveBeenCalledOnce();
  });

  test("does not show action button when action is not provided", () => {
    render(<DetailPanel selected title="Test Item" />);
    expect(screen.queryByRole("button")).toBeNull();
  });
});
