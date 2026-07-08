import { render, screen } from "@testing-library/react";
import { ChatLayout } from "./chat-layout";
import { describe, test, expect } from "vitest";

describe("ChatLayout", () => {
  test("renders sidebar, main and detail content", () => {
    render(
      <ChatLayout
        sidebar={<div>Sidebar</div>}
        main={<div>Main</div>}
        detail={<div>Detail</div>}
      />,
    );
    expect(screen.getByText("Sidebar")).toBeInTheDocument();
    expect(screen.getByText("Main")).toBeInTheDocument();
    expect(screen.getByText("Detail")).toBeInTheDocument();
  });

  test("renders without an optional detail panel", () => {
    render(<ChatLayout sidebar={<div>Sidebar</div>} main={<div>Main</div>} />);
    expect(screen.getByText("Sidebar")).toBeInTheDocument();
    expect(screen.getByText("Main")).toBeInTheDocument();
  });
});
