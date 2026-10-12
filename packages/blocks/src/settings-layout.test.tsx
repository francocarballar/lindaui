import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, test } from "vitest";
import { SettingsLayout } from "./settings-layout";

describe("SettingsLayout", () => {
  test("controlled navigation preserves mounted forms, accessible panel ids and the footer", async () => {
    function Layout() {
      const [selected, setSelected] = useState<"profile" | "notices">("profile");
      return <SettingsLayout
        footer={<p>Save changes</p>}
        idPrefix="preferences"
        navigationLabel="Preference sections"
        onSelect={setSelected}
        panels={{ profile: <input aria-label="Name" defaultValue="Alex" />, notices: <input aria-label="Email" /> }}
        sections={[{ id: "profile", label: "Profile" }, { id: "notices", label: "Notifications" }]}
        selected={selected}
        title="Preferences"
      />;
    }
    render(<Layout />);
    const user = userEvent.setup();
    const input = screen.getByRole("textbox", { name: "Name" });
    await user.clear(input);
    await user.type(input, "Sam");
    expect(screen.getByRole("button", { name: "Profile" })).toHaveAttribute("aria-controls", "preferences-profile");
    await user.click(screen.getByRole("button", { name: "Notifications" }));
    expect(screen.getByRole("button", { name: "Notifications" })).toHaveAttribute("aria-pressed", "true");
    expect(input.closest("section")).toHaveAttribute("hidden");
    await user.click(screen.getByRole("button", { name: "Profile" }));
    expect(input).toHaveValue("Sam");
    expect(screen.getByText("Save changes")).toBeInTheDocument();
  });

  test("compact layout omits the optional title and preserves compact spacing", () => {
    const { container } = render(<SettingsLayout compact navigationLabel="Sections" onSelect={() => undefined} panels={{ profile: "Profile form" }} sections={[{ id: "profile", label: "Profile" }]} selected="profile" />);
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    expect(container.firstChild).toHaveClass("h-full", "p-0");
  });
});
