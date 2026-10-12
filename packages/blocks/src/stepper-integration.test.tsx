import { ProgressBar } from "@lindaui/ui/compound";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Stepper } from "./stepper";

function styledMarkup(element: Element) {
  const copy = element.cloneNode(true) as Element;
  for (const node of [copy, ...copy.querySelectorAll("*")]) {
    // Generated ARIA IDs differ per render; naming does not affect visual anatomy.
    node.removeAttribute("id");
    node.removeAttribute("aria-labelledby");
    node.removeAttribute("aria-label");
  }
  return copy.outerHTML;
}

describe("Stepper adoption preserves the original app presentations", () => {
  it.each([0, 50, 100])("preserves compact connection markup at %s%%", (value) => {
    const complete = value === 100;
    const original = render(
      <div className="mx-auto max-w-xs space-y-2">
        <ProgressBar aria-label="Channels" color={complete ? "success" : "accent"} size="sm" value={value}>
          <ProgressBar.Track><ProgressBar.Fill /></ProgressBar.Track>
        </ProgressBar>
        <p className="text-muted text-xs">Connected channels</p>
      </div>,
    );
    const migrated = render(<Stepper complete={complete} description="Connected channels" label="Channels" value={value} variant="compact" />);
    expect(styledMarkup(migrated.container.firstElementChild!)).toBe(styledMarkup(original.container.firstElementChild!));
  });

  it.each([12.5, 87.5])("preserves onboarding step markup at %s%%", (value) => {
    const original = render(
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between font-bold text-muted text-xs uppercase tracking-widest">
          <span>Configure</span><span>{Math.round(value)}%</span>
        </div>
        <ProgressBar color="accent" size="sm" value={value}>
          <ProgressBar.Track className="rounded-full"><ProgressBar.Fill className="rounded-full" /></ProgressBar.Track>
        </ProgressBar>
      </div>,
    );
    const migrated = render(<Stepper label="Configure" stepLabel="Configure" value={value} />);
    expect(styledMarkup(migrated.container.firstElementChild!)).toBe(styledMarkup(original.container.firstElementChild!));
  });
});
