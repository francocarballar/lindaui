import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Stepper } from "./stepper";

describe("Stepper", () => {
  test("presents the supplied step and accessible progress without navigation or domain logic", () => {
    render(<Stepper label="Setup progress" stepLabel="Preferences" value={37.5} />);
    expect(screen.getByText("Preferences")).toBeInTheDocument();
    expect(screen.getByText("38%")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Setup progress" })).toHaveAttribute("aria-valuenow", "37.5");
  });

  test("compact completion uses the success treatment and supplied description", () => {
    render(<Stepper complete description="All devices linked" label="Device progress" value={100} variant="compact" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
    expect(screen.getByRole("progressbar")).toHaveClass("progress-bar--success");
    expect(screen.getByText("All devices linked")).toBeInTheDocument();
    expect(screen.queryByText("100%")).not.toBeInTheDocument();
  });

  test.each([[120, "100"], [-1, "0"], [Number.NaN, "0"]])("bounds invalid/out-of-range progress %s", (value, expected) => {
    render(<Stepper label="Progress" value={value} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", expected);
  });
});
