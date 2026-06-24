import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect } from "vitest";
import { ImageViewer } from "./image-viewer";

describe("ImageViewer", () => {
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
