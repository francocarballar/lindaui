import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CalendarDays, LayoutDashboard, MessageCircle, Settings, Users } from "lucide-react";
import { describe, expect, test, vi } from "vitest";
import { AppShell } from "./app-shell";
import type { AppShellNavItem, AppShellProps } from "./app-shell";

const navItems: AppShellNavItem[] = [
  { key: "home", label: "Overview", href: "/overview", icon: LayoutDashboard },
  { key: "people", label: "People", href: "/people", icon: Users },
  { key: "messages", label: "Messages", href: "/messages", icon: MessageCircle, isCenterButton: true, isActive: true },
  { key: "calendar", label: "Calendar", href: "/calendar", icon: CalendarDays },
  { key: "settings", label: "Settings", href: "/settings", icon: Settings },
  { key: "reports", label: "Reports", href: "/reports", icon: LayoutDashboard, hideOnMobile: true },
];

function renderShell(props: Partial<AppShellProps> = {}) {
  return render(
    <AppShell brand={{ label: "Workspace", href: "/overview", logoSrc: "/logo.svg" }} navItems={navItems} {...props}>
      <h1>Inbox</h1>
    </AppShell>
  );
}

describe("AppShell", () => {
  test("collapses and expands desktop navigation, reserving the original content width", async () => {
    const user = userEvent.setup();
    const topSlot = vi.fn((collapsed: boolean) => <div>{collapsed ? "Compact selector" : "Full selector"}</div>);
    const footerSlot = vi.fn((collapsed: boolean) => <div>{collapsed ? "Compact footer" : "Full footer"}</div>);
    const { container } = renderShell({ sidebarTopSlot: topSlot, sidebarFooterSlot: footerSlot });
    const desktop = container.querySelector("aside")!;
    expect(desktop).toHaveClass("w-48");
    expect(screen.getByRole("main")).toHaveClass("lg:ml-48");
    await user.click(within(desktop).getByRole("button", { name: "Collapse sidebar" }));
    expect(desktop).toHaveClass("w-16");
    expect(screen.getByRole("main")).toHaveClass("lg:ml-16");
    expect(within(desktop).getByText("Compact footer")).toBeInTheDocument();
    expect(topSlot).toHaveBeenCalledWith(true);
    const link = within(desktop).getByRole("link", { name: "Messages" });
    expect(link).toHaveAttribute("aria-current", "page");
    expect(link.querySelector("span")).toBeNull();
    await user.click(within(desktop).getByRole("button", { name: "Expand sidebar" }));
    expect(desktop).toHaveClass("w-48");
    expect(within(desktop).getByText("Full footer")).toBeInTheDocument();
  });

  test("opens the drawer, invokes intercepted navigation and closes without navigating", async () => {
    const action = vi.fn();
    const user = userEvent.setup();
    const { container } = renderShell({ navItems: navItems.map((item) => item.key === "settings" ? { ...item, onAction: action } : item) });
    const drawer = container.querySelectorAll("aside")[1]!;
    expect(drawer).toHaveAttribute("inert");
    const toggle = screen.getByRole("button", { name: "Open menu" });
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(drawer).not.toHaveAttribute("inert");
    expect(drawer).toHaveClass("translate-x-0");
    const link = within(drawer).getByRole("link", { name: "Settings" });
    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    fireEvent(link, event);
    expect(event.defaultPrevented).toBe(true);
    expect(action).toHaveBeenCalledOnce();
    expect(drawer).toHaveAttribute("inert");
  });

  test("supports Escape and keyboard dismissal of the mobile overlay", async () => {
    const user = userEvent.setup();
    const { container } = renderShell();
    const drawer = container.querySelectorAll("aside")[1]!;
    const toggle = screen.getByRole("button", { name: "Open menu" });
    await user.click(toggle);
    expect(within(drawer).getByRole("button", { name: "Close menu" })).toHaveFocus();
    fireEvent.keyDown(drawer, { key: "Escape" });
    expect(drawer).toHaveAttribute("inert");
    expect(toggle).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    const overlay = container.querySelector('[role="button"]')!;
    fireEvent.keyDown(overlay, { key: " " });
    expect(drawer).toHaveAttribute("inert");
  });

  test("cycles Tab focus inside the open mobile drawer", async () => {
    const user = userEvent.setup();
    const { container } = renderShell();
    const drawer = container.querySelectorAll("aside")[1]!;
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    const links = within(drawer).getAllByRole("link");
    links.at(-1)!.focus();
    await user.keyboard("{Tab}");
    expect(links[0]).toHaveFocus();
    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(links.at(-1)).toHaveFocus();
  });

  test("preserves the floating center button, mobile filtering and native keyboard navigation", async () => {
    const action = vi.fn();
    const navigate = vi.fn();
    const user = userEvent.setup();
    renderShell({
      navItems: navItems.map((item) => item.key === "messages" ? { ...item, onAction: action } : item),
      renderLink: (props) => <a {...props} onClick={(event) => {
        props.onClick?.(event);
        if (!event.defaultPrevented) {
          event.preventDefault();
          navigate(props.href);
        }
      }} />,
    });
    const bottom = screen.getByRole("navigation", { name: "Bottom navigation" });
    expect(within(bottom).queryByRole("link", { name: "Reports" })).not.toBeInTheDocument();
    expect(within(bottom).getAllByRole("link")).toHaveLength(5);
    const center = within(bottom).getByRole("link", { name: "Messages" });
    expect(center).toHaveClass("absolute", "-top-5", "left-1/2");
    expect(center.firstElementChild).toHaveClass("h-14", "w-14", "ring-4", "bg-accent");
    center.focus();
    await user.keyboard("{Enter}");
    expect(navigate).toHaveBeenCalledWith("/messages");
    // As in the original app, bottom links navigate; only sidebar/drawer items intercept actions.
    expect(action).not.toHaveBeenCalled();
  });

  test("renders simple bottom navigation, visiting styles, banners and injectable router/image elements", () => {
    const { container } = renderShell({
      navItems: navItems.filter((item) => !item.isCenterButton),
      isVisiting: true,
      contentTopSlot: <p>Connection notice</p>,
      headerRightSlot: <button type="button">Account</button>,
      renderLink: (props) => <a data-router="custom" {...props} />,
      renderImage: (props) => <img data-image="custom" {...props} />,
    });
    expect(container.querySelector("aside")).toHaveClass("bg-warning-soft");
    const bottom = screen.getByRole("navigation", { name: "Bottom navigation" });
    expect(bottom).toHaveClass("bg-background");
    expect(bottom.querySelector(".absolute")).toBeNull();
    expect(within(bottom).getByRole("link", { name: "Settings" })).toHaveAttribute("data-router", "custom");
    expect(screen.getAllByAltText("Workspace")[0]).toHaveAttribute("data-image", "custom");
    expect(within(screen.getByRole("main")).getByText("Connection notice")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Account" })).toBeInTheDocument();
  });
});
