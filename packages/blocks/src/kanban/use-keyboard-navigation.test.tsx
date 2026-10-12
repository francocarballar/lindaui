import { fireEvent, render } from "@testing-library/react";
import { useRef } from "react";
import { describe, expect, test, vi } from "vitest";
import { useKeyboardNavigation } from "./use-keyboard-navigation";

function Harness() {
  const ref = useRef<HTMLDivElement>(null);
  useKeyboardNavigation(ref);
  return <div ref={ref}><input aria-label="Search" /><textarea aria-label="Notes" /></div>;
}

describe("horizontal keyboard navigation", () => {
  test("preserves arrows and Home/End smooth scrolling and removes its listener", () => {
    const { container, unmount } = render(<Harness />);
    const element = container.firstElementChild as HTMLElement;
    element.scrollBy = vi.fn();
    element.scrollTo = vi.fn();
    Object.defineProperty(element, "scrollWidth", { value: 1400 });
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    fireEvent.keyDown(window, { key: "ArrowRight" });
    fireEvent.keyDown(window, { key: "Home" });
    fireEvent.keyDown(window, { key: "End" });
    expect(element.scrollBy).toHaveBeenNthCalledWith(1, { behavior: "smooth", left: -320 });
    expect(element.scrollBy).toHaveBeenNthCalledWith(2, { behavior: "smooth", left: 320 });
    expect(element.scrollTo).toHaveBeenNthCalledWith(1, { behavior: "smooth", left: 0 });
    expect(element.scrollTo).toHaveBeenNthCalledWith(2, { behavior: "smooth", left: 1400 });
    unmount();
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(element.scrollBy).toHaveBeenCalledTimes(2);
  });

  test("does not intercept input, textarea or contenteditable keys", () => {
    const { container, getByRole } = render(<Harness />);
    const element = container.firstElementChild as HTMLElement;
    element.scrollBy = vi.fn();
    fireEvent.keyDown(getByRole("textbox", { name: "Search" }), { key: "ArrowRight" });
    fireEvent.keyDown(getByRole("textbox", { name: "Notes" }), { key: "ArrowRight" });
    Object.defineProperty(element, "isContentEditable", { value: true });
    fireEvent.keyDown(element, { key: "ArrowRight" });
    expect(element.scrollBy).not.toHaveBeenCalled();
  });

  test("leaves unrelated shortcuts untouched", () => {
    const { container } = render(<Harness />);
    const element = container.firstElementChild as HTMLElement;
    element.scrollBy = vi.fn();
    fireEvent.keyDown(window, { key: "Enter" });
    fireEvent.keyDown(window, { key: "Escape" });
    expect(element.scrollBy).not.toHaveBeenCalled();
  });
});
