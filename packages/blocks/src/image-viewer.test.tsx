import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect } from "vitest";
import { ImageViewer } from "./image-viewer";

describe("ImageViewer", () => {
  test("changing the image source returns to the loading placeholder", () => {
    const { rerender } = render(<ImageViewer src="https://example.test/first.png" alt="Scan" placeholderLabel="Loading scan" />);
    fireEvent.load(screen.getByRole("img", { hidden: true }));
    expect(screen.getByRole("img", { name: "Scan" })).toBeVisible();
    rerender(<ImageViewer src="https://example.test/second.png" alt="Scan" placeholderLabel="Loading scan" />);
    expect(screen.getByText("Loading scan")).toBeInTheDocument();
    expect(screen.getByRole("img", { hidden: true })).not.toBeVisible();
  });
  test("image loading and errors switch between the image and placeholder", () => {
    render(<ImageViewer src="https://example.test/image.png" alt="Scan" placeholderLabel="Loading scan" annotations={<span>Annotation</span>} caption="Caption" dim={0.5} />);
    const image = screen.getByRole("img", { hidden: true });
    expect(image).not.toBeVisible();
    expect(screen.getByText("Loading scan")).toBeInTheDocument();
    fireEvent.load(image);
    expect(screen.getByRole("img", { name: "Scan" })).toBeVisible();
    expect(screen.queryByText("Loading scan")).toBeNull();
    fireEvent.error(image);
    expect(image).not.toBeVisible();
    expect(screen.getByText("Loading scan")).toBeInTheDocument();
    expect(screen.getByText("Annotation")).toBeInTheDocument();
    expect(screen.getByText("Caption")).toBeInTheDocument();
  });
  test("zoom obeys both bounds and resets to the original framing", async () => {
    const user = userEvent.setup();
    render(<ImageViewer showControls minZoom={1} maxZoom={1.2} />);
    await user.click(screen.getByRole("button", { name: "Reducir zoom" }));
    expect(screen.getByText("100%")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Ampliar zoom" }));
    await user.click(screen.getByRole("button", { name: "Ampliar zoom" }));
    expect(screen.getByText("120%")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Reducir zoom" }));
    expect(screen.getByText("100%")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Ampliar zoom" }));
    await user.click(screen.getByRole("button", { name: "Encuadrar" }));
    expect(screen.getByText("100%")).toBeInTheDocument();
  });
  test("renders img with given alt when src is provided", () => {
    render(<ImageViewer src="http://example.com/img.png" alt="Test image" />);
    // jsdom never fires onLoad so img stays hidden; query by alt text (semantic)
    expect(screen.getByAltText("Test image")).toBeInTheDocument();
  });

  test("shows placeholderLabel when no src", () => {
    render(<ImageViewer placeholderLabel="ECOGRAFIA" />);
    expect(screen.getByText("ECOGRAFIA")).toBeInTheDocument();
  });

  test("renders three zoom control buttons when showControls=true", () => {
    render(<ImageViewer showControls />);
    expect(screen.getByRole("button", { name: "Reducir zoom" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ampliar zoom" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Encuadrar" })).toBeInTheDocument();
  });

  test("clicking Ampliar zoom increases the percent readout", async () => {
    const user = userEvent.setup();
    render(<ImageViewer showControls />);
    // initial zoom is 100%
    expect(screen.getByText("100%")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Ampliar zoom" }));
    // zoom should now be 120%
    expect(screen.getByText("120%")).toBeInTheDocument();
  });

  test("does not render control buttons when showControls is omitted", () => {
    render(<ImageViewer />);
    expect(screen.queryByRole("button", { name: "Ampliar zoom" })).toBeNull();
  });
});
