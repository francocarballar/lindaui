import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { ImageLightbox } from "./image-lightbox";

test("image lightbox opens, dismisses and restores focus", async () => {
  const user = userEvent.setup();
  render(<ImageLightbox src="https://example.test/image.png" />);
  const trigger = screen.getByRole("button", { name: "Ver imagen: Media" });
  expect(screen.queryByRole("dialog")).toBeNull();
  await user.click(trigger);
  expect(screen.getByRole("dialog", { name: "Media" })).toBeInTheDocument();
  expect(screen.getByRole("img", { name: "Media" })).toBeVisible();
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("dialog")).toBeNull();
  await waitFor(() => expect(trigger).toHaveFocus());
});

test("custom alt and class name propagate to the thumbnail", () => {
  render(<ImageLightbox src="https://example.test/scan.png" alt="Scan" className="custom-image" />);
  expect(screen.getByRole("button", { name: "Ver imagen: Scan" })).toHaveClass("custom-image");
  expect(screen.getByRole("img", { name: "Scan" })).toHaveAttribute("src", "https://example.test/scan.png");
});
