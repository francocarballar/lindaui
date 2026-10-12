import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, test, vi } from "vitest";
import { NavigationButtons } from "./navigation-buttons";
import { ScrollIndicators } from "./scroll-indicators";

describe("scroll controls", () => {
  test("preserves the distinct button/fade thresholds and column-sized navigation", async () => {
    const element = document.createElement("section");
    Object.defineProperties(element, {
      scrollWidth: { value: 1000 },
      clientWidth: { value: 320 },
    });
    element.scrollTo = vi.fn();
    const ref = createRef<HTMLElement>();
    ref.current = element;
    const { container, unmount } = render(<>
      <ScrollIndicators scrollRef={ref} />
      <NavigationButtons scrollRef={ref} leftLabel="Previous" rightLabel="Next" />
    </>);
    const [leftFade, rightFade] = container.querySelectorAll("div");
    expect(leftFade).toHaveClass("opacity-0");
    expect(rightFade).toHaveClass("opacity-100");
    expect(screen.getByRole("button", { name: "Previous" })).toHaveClass("opacity-0");
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(element.scrollTo).toHaveBeenCalledWith({ behavior: "smooth", left: 320 });

    element.scrollLeft = 5;
    fireEvent.scroll(element);
    expect(leftFade).toHaveClass("opacity-0");
    expect(screen.getByRole("button", { name: "Previous" })).toHaveClass("opacity-100");
    element.scrollLeft = 675;
    fireEvent.scroll(element);
    expect(leftFade).toHaveClass("opacity-100");
    expect(rightFade).toHaveClass("opacity-0");
    expect(screen.getByRole("button", { name: "Next" })).toHaveClass("opacity-100");
    element.scrollLeft = 680;
    fireEvent.resize(window);
    expect(screen.getByRole("button", { name: "Next" })).toHaveClass("opacity-0");
    unmount();
  });
});
