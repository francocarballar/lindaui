import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { AnalyticsSkeleton, FetchingIndicator } from "./analytics-skeleton";

test("analytics loading layout renders without exposing actionable controls", () => {
  const { container, rerender } = render(<AnalyticsSkeleton />);
  expect(container).not.toBeEmptyDOMElement();
  expect(screen.queryByRole("button")).toBeNull();
  rerender(<FetchingIndicator label="Actualizando estadísticas" />);
  expect(screen.getByText("Actualizando estadísticas")).toBeVisible();
});
