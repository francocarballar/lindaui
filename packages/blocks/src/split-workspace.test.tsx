import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import { SplitWorkspace } from "./split-workspace";

describe("SplitWorkspace", () => {
  test("renders media and panel content (desktop layout)", () => {
    render(
      <SplitWorkspace
        media={<div>Media region</div>}
        panel={<div>Panel region</div>}
      />
    );
    expect(screen.getByText("Media region")).toBeInTheDocument();
    expect(screen.getByText("Panel region")).toBeInTheDocument();
  });

  test("renders overlay content when overlay is passed", () => {
    render(
      <SplitWorkspace
        media={<div>Media</div>}
        panel={<div>Panel</div>}
        overlay={<div>Overlay content</div>}
      />
    );
    expect(screen.getByText("Overlay content")).toBeInTheDocument();
  });

  test("renders back slot when back is passed", () => {
    render(
      <SplitWorkspace
        media={<div>Media</div>}
        panel={<div>Panel</div>}
        back={<a href="/">Volver</a>}
      />
    );
    expect(screen.getByRole("link", { name: "Volver" })).toBeInTheDocument();
  });

  test("does not render overlay when not passed", () => {
    render(
      <SplitWorkspace
        media={<div>Media</div>}
        panel={<div>Panel</div>}
      />
    );
    expect(screen.queryByText("Overlay content")).toBeNull();
  });

  test("renders a default legible back button from backHref/backLabel", () => {
    render(
      <SplitWorkspace
        media={<div>Media</div>}
        panel={<div>Panel</div>}
        backHref="/docs"
        backLabel="Volver a docs"
      />
    );
    expect(
      screen.getByRole("link", { name: /Volver a docs/ })
    ).toHaveAttribute("href", "/docs");
  });

  test("custom back wins over backHref", () => {
    render(
      <SplitWorkspace
        media={<div>Media</div>}
        panel={<div>Panel</div>}
        back={<a href="/custom">Custom back</a>}
        backHref="/docs"
      />
    );
    expect(screen.getByRole("link", { name: "Custom back" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Volver/ })).toBeNull();
  });
});
