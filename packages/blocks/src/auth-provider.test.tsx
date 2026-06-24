import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import { AuthProvider, useAuth } from "./auth-provider";

function Consumer() {
  const { user } = useAuth();
  return <span>{user?.name ?? ""}</span>;
}

describe("AuthProvider", () => {
  test("provides user name to consumer", () => {
    render(
      <AuthProvider user={{ name: "Ana" }}>
        <Consumer />
      </AuthProvider>,
    );
    expect(screen.getByText("Ana")).toBeInTheDocument();
  });

  test("defaults to null user when no provider", () => {
    render(<Consumer />);
    // no throw; renders empty span
    expect(screen.queryByText("Ana")).not.toBeInTheDocument();
  });

  test("passes null user correctly", () => {
    render(
      <AuthProvider user={null}>
        <Consumer />
      </AuthProvider>,
    );
    expect(screen.queryByText("Ana")).not.toBeInTheDocument();
  });
});
