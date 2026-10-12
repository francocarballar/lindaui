"use client";

import { Button } from "@lindaui/ui/compound";
import { cn } from "@lindaui/ui/cn";
import { Menu, PanelLeft, PanelLeftClose, X } from "lucide-react";
import { useId, useState } from "react";
import { useDrawerFocus } from "./app-shell/drawer-focus";
import { MobileBottomNavigation, ShellLink, SidebarNavLink } from "./app-shell/navigation";
import type { AppShellLabels, AppShellProps } from "./app-shell/types";

export type {
  AppShellBrand, AppShellImageProps, AppShellLabels, AppShellLinkProps, AppShellNavItem, AppShellProps,
} from "./app-shell/types";
export { AppShellFooter } from "./app-shell/footer";
export type { AppShellFooterLabels, AppShellFooterProps, AppShellUser } from "./app-shell/footer";

const defaultLabels: AppShellLabels = {
  collapseSidebar: "Collapse sidebar",
  expandSidebar: "Expand sidebar",
  openMenu: "Open menu",
  closeMenu: "Close menu",
  mainNavigation: "Main navigation",
  bottomNavigation: "Bottom navigation",
};

/** The original collapsible desktop sidebar, mobile drawer and floating bottom navigation. */
export function AppShell({
  children, navItems, sidebarTopSlot, sidebarFooterSlot, contentTopSlot, headerRightSlot,
  brand, isVisiting = false, defaultCollapsed = false, labels: labelOverrides,
  renderLink, renderImage,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const drawerFocus = useDrawerFocus(sidebarOpen, () => setSidebarOpen(false));
  const drawerId = useId();
  const labels = { ...defaultLabels, ...labelOverrides };
  // Preserve the existing slot API: the top slot follows desktop collapse state in both sidebars.
  const topSlot = typeof sidebarTopSlot === "function" ? sidebarTopSlot(isCollapsed) : sidebarTopSlot;
  const footer = (collapsed: boolean) => typeof sidebarFooterSlot === "function"
    ? sidebarFooterSlot(collapsed) : sidebarFooterSlot;
  const logo = (size: number, className: string) => {
    if (!brand.logoSrc) return null;
    const props = { alt: brand.label, className, height: size, src: brand.logoSrc, width: size };
    return renderImage ? renderImage(props) : <img {...props} />;
  };
  const mobileBrand = (
    <ShellLink className="flex items-center gap-2" href={brand.href} renderLink={renderLink}>
      {logo(28, "h-7 w-7 rounded-lg")}
      <span className="font-extrabold text-sm uppercase">{brand.label}</span>
    </ShellLink>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className={cn(
        "fixed z-40 hidden h-full flex-col lg:flex",
        "border-border border-r",
        "transition-all duration-300 ease-in-out",
        isVisiting ? "bg-warning-soft dark:bg-warning/20" : "bg-background",
        isCollapsed ? "w-16" : "w-48"
      )}>
        <div className={cn(
          "flex h-14 items-center border-border border-b",
          isCollapsed ? "flex-col justify-center gap-0 px-2" : "justify-between px-4"
        )}>
          <ShellLink
            aria-label={brand.label}
            className={cn("flex items-center gap-2", isCollapsed ? "mb-0" : "")}
            href={brand.href}
            renderLink={renderLink}
          >
            {logo(32, `rounded-lg ${isCollapsed ? "h-7 w-7" : "h-8 w-8"}`)}
            {isCollapsed ? null : <span className="font-extrabold text-sm uppercase">{brand.label}</span>}
          </ShellLink>
          {isCollapsed ? null : (
            <Button
              aria-label={labels.collapseSidebar}
              className="text-muted hover:text-foreground"
              isIconOnly onPress={() => setIsCollapsed(true)} size="sm" variant="ghost"
            ><PanelLeftClose size={18} /></Button>
          )}
        </div>
        {isCollapsed ? (
          <div className="flex justify-center border-border border-b py-2">
            <Button
              aria-label={labels.expandSidebar}
              className="text-muted hover:text-foreground"
              isIconOnly onPress={() => setIsCollapsed(false)} size="sm" variant="ghost"
            ><PanelLeft size={18} /></Button>
          </div>
        ) : null}
        {topSlot ?? null}
        <nav aria-label={labels.mainNavigation} className="flex-1 space-y-1 px-2 py-4">
          {navItems.map((item) => (
            <SidebarNavLink collapsed={isCollapsed} item={item} key={item.key} renderLink={renderLink} />
          ))}
        </nav>
        {footer(isCollapsed)}
      </aside>

      <header className="!bg-transparent fixed top-0 right-0 left-0 z-50 border-border border-b backdrop-blur backdrop-saturate-200 lg:hidden dark:border-white/10">
        <div className="flex h-14 items-center justify-between px-4">
          <Button
            ref={drawerFocus.triggerRef}
            aria-label={sidebarOpen ? labels.closeMenu : labels.openMenu}
            aria-controls={drawerId} aria-expanded={sidebarOpen}
            isIconOnly onPress={() => setSidebarOpen(!sidebarOpen)} size="sm" variant="ghost"
          >{sidebarOpen ? <X size={20} /> : <Menu size={20} />}</Button>
          {mobileBrand}
          {headerRightSlot}
        </div>
      </header>

      {sidebarOpen ? (
        <div
          aria-label={labels.closeMenu}
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(event) => {
            if (["Enter", " ", "Escape"].includes(event.key)) {
              event.preventDefault();
              setSidebarOpen(false);
            }
          }}
          role="button" tabIndex={0}
        />
      ) : null}

      <aside
        ref={drawerFocus.drawerRef}
        id={drawerId}
        inert={!sidebarOpen}
        onKeyDown={drawerFocus.onKeyDown}
        className={cn(
          "fixed inset-y-0 left-0 z-[60] flex w-64 flex-col border-border border-r lg:hidden",
          "transform transition-transform duration-300 ease-in-out",
          isVisiting ? "bg-warning-soft dark:bg-warning/20" : "bg-background",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center justify-between border-border border-b px-4">
          {mobileBrand}
          <Button aria-label={labels.closeMenu} isIconOnly onPress={() => setSidebarOpen(false)} size="sm" variant="ghost">
            <X size={20} />
          </Button>
        </div>
        {topSlot ?? null}
        <nav aria-label={labels.mainNavigation} className="flex-1 space-y-1 p-3">
          {navItems.map((item) => (
            <SidebarNavLink item={item} key={item.key} onClick={() => setSidebarOpen(false)} renderLink={renderLink} />
          ))}
        </nav>
        {footer(false)}
      </aside>

      <main className={cn(
        "flex h-screen min-w-0 flex-1 flex-col overflow-x-hidden pt-14 transition-all duration-300 lg:pt-0",
        isCollapsed ? "lg:ml-16" : "lg:ml-48"
      )}>
        {contentTopSlot}
        <div className="min-h-0 flex-1 overflow-auto pb-20 lg:pb-0">{children}</div>
      </main>
      <MobileBottomNavigation navItems={navItems} isVisiting={isVisiting} label={labels.bottomNavigation} renderLink={renderLink} />
    </div>
  );
}
