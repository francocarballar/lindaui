import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import { DocumentReader } from "./document-reader";

describe("DocumentReader", () => {
  const content = `SECTION ONE
First line of content. Second sentence here.

SECTION TWO
Another paragraph body text.`;

  test("renders heading of first block", () => {
    render(<DocumentReader content={content} />);
    expect(screen.getByText("SECTION ONE")).toBeInTheDocument();
  });

  test("renders body of first block", () => {
    render(<DocumentReader content={content} />);
    expect(screen.getByText("First line of content. Second sentence here.")).toBeInTheDocument();
  });

  test("renders heading of second block", () => {
    render(<DocumentReader content={content} />);
    expect(screen.getByText("SECTION TWO")).toBeInTheDocument();
  });

  test("renders body of second block", () => {
    render(<DocumentReader content={content} />);
    expect(screen.getByText("Another paragraph body text.")).toBeInTheDocument();
  });

  test("renders blocks from multi-line content", () => {
    const multiLine = `HEADING\nLine one.\nLine two.\n\nSECOND\nOnly line.`;
    render(<DocumentReader content={multiLine} />);
    expect(screen.getByText("HEADING")).toBeInTheDocument();
    expect(screen.getByText("Line one. Line two.")).toBeInTheDocument();
    expect(screen.getByText("SECOND")).toBeInTheDocument();
  });
});
