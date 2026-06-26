import { render, screen } from "@testing-library/react";
import { Chip } from "./chip";
import { describe, test, expect } from "vitest";

describe("Chip", () => {
  test("renders children", () => {
    render(<Chip>Activo</Chip>);
    expect(screen.getByText("Activo")).toBeInTheDocument();
  });

  // Acceptance-only: Chip has no interactive props (no onClose/onPress); this
  // asserts the variant/color/size props are accepted and children still render.
  // It deliberately does NOT assert visual appearance (forbidden: brittle, would
  // couple to HeroUI's internal classes). Values verified against chip.styles.js
  // (color/variant/size unions).
  test("accepts variant/color/size props and still renders children", () => {
    render(
      <Chip color="success" variant="soft" size="lg">
        Aprobado
      </Chip>,
    );
    expect(screen.getByText("Aprobado")).toBeInTheDocument();
  });
});
