import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { createRef } from 'react';
import { NavigationButtons } from './navigation-buttons';
import { ScrollIndicators } from './scroll-indicators';

function scroller() {
  const element = document.createElement('div');
  Object.defineProperties(element, {
    scrollWidth: { value: 900, configurable: true },
    clientWidth: { value: 300, configurable: true },
  });
  element.scrollLeft = 100;
  element.scrollTo = vi.fn();
  return element;
}

test('buttons scroll one column in both directions and observe edges', async () => {
  const user = userEvent.setup();
  const element = scroller();
  const scrollRef = { current: element as HTMLElement | null };
  const remove = vi.spyOn(element, 'removeEventListener');
  const { unmount } = render(<NavigationButtons scrollRef={scrollRef} columnWidth={250} />);
  const left = screen.getByRole('button', { name: 'Scroll left' });
  const right = screen.getByRole('button', { name: 'Scroll right' });
  expect(left).toHaveClass('opacity-100');
  expect(right).toHaveClass('opacity-100');
  await user.click(left);
  expect(element.scrollTo).toHaveBeenLastCalledWith({ behavior: 'smooth', left: -150 });
  await user.click(right);
  expect(element.scrollTo).toHaveBeenLastCalledWith({ behavior: 'smooth', left: 350 });
  scrollRef.current = null;
  await user.click(right);
  expect(element.scrollTo).toHaveBeenCalledTimes(2);
  scrollRef.current = element;
  element.scrollLeft = 600;
  fireEvent.scroll(element);
  expect(right).toHaveClass('opacity-0');
  element.scrollLeft = 0;
  fireEvent.resize(window);
  expect(left).toHaveClass('opacity-0');
  unmount();
  expect(remove).toHaveBeenCalledWith('scroll', expect.any(Function));
});

test('gradient indicators update at edges and clean up their listener', () => {
  const element = scroller();
  const remove = vi.spyOn(element, 'removeEventListener');
  const { container, unmount } = render(<ScrollIndicators scrollRef={{ current: element }} />);
  const [left, right] = container.children;
  expect(left).toHaveClass('opacity-100');
  expect(right).toHaveClass('opacity-100');
  element.scrollLeft = 600;
  fireEvent.scroll(element);
  expect(right).toHaveClass('opacity-0');
  element.scrollLeft = 0;
  fireEvent.resize(window);
  expect(left).toHaveClass('opacity-0');
  unmount();
  expect(remove).toHaveBeenCalledWith('scroll', expect.any(Function));
});

test('controls tolerate a scroll container that is not mounted', () => {
  const scrollRef = { current: null };
  const { container } = render(<><NavigationButtons scrollRef={scrollRef} /><ScrollIndicators scrollRef={scrollRef} /></>);
  expect(screen.getByRole('button', { name: 'Scroll right' })).toHaveClass('opacity-0');
  expect(container.querySelectorAll('.opacity-100')).toHaveLength(0);
});

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
