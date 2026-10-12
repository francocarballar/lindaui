import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { SaveBar } from "./save-bar";

const labels = { pending: "Unsaved changes", upToDate: "Up to date", submit: "Save" };

describe("SaveBar", () => {
  test.each([{ dirty: false, saving: false }, { dirty: true, saving: true }])("disables save for dirty=$dirty and saving=$saving", ({ dirty, saving }) => {
    render(<SaveBar dirty={dirty} form="preferences" labels={labels} saving={saving} />);
    expect(screen.getByRole("button", { name: /Save/ })).toBeDisabled();
    expect(screen.getByText(dirty ? labels.pending : labels.upToDate)).toHaveAttribute("aria-live", "polite");
  });

  test("submits the associated external form when dirty", async () => {
    const onSubmit = vi.fn((event) => event.preventDefault());
    render(<><form id="preferences" onSubmit={onSubmit} /><SaveBar dirty form="preferences" labels={labels} saving={false} /></>);
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(screen.getByRole("button")).toHaveAttribute("form", "preferences");
  });

  test("embedded presentation uses the sticky footer rather than a fixed overlay", () => {
    const { container } = render(<SaveBar dirty embedded form="preferences" labels={labels} saving={false} />);
    expect(container.firstChild).toHaveClass("sticky", "bottom-0");
    expect(container.firstChild).not.toHaveClass("fixed");
  });
});
