"use client";

import { Tooltip } from "@lindaui/ui/compound";
import { cn } from "@lindaui/ui/cn";
import type { AppShellLinkProps, AppShellNavItem, AppShellProps } from "./types";

export function ShellLink({ renderLink, ...props }: AppShellLinkProps & Pick<AppShellProps, "renderLink">) {
  return renderLink ? renderLink(props) : <a {...props} />;
}

export function SidebarNavLink({
  item,
  collapsed,
  onClick,
  renderLink,
}: {
  item: AppShellNavItem;
  collapsed?: boolean;
  onClick?: () => void;
  renderLink?: AppShellProps["renderLink"];
}) {
  const Icon = item.icon;
  const link = (
    <ShellLink
      aria-current={item.isActive ? "page" : "false"}
      aria-label={item.label}
      className={cn(
        "relative flex items-center gap-3 rounded-lg px-3 py-2.5",
        "transition-all duration-200 ease-out",
        "text-muted hover:scale-[1.02] hover:bg-surface-secondary hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
        item.isActive ? "bg-accent/10 font-semibold text-accent hover:bg-accent/15" : "",
        collapsed ? "justify-center px-2" : ""
      )}
      href={item.href}
      onClick={(event) => {
        if (item.onAction) {
          event.preventDefault();
          item.onAction();
        }
        onClick?.();
      }}
      renderLink={renderLink}
    >
      {item.isActive ? (
        <div className="absolute top-1/2 left-0 h-5 w-1 -translate-y-1/2 rounded-r-full bg-accent" />
      ) : null}
      <Icon
        className={cn("flex-shrink-0 transition-transform duration-200", "group-hover:scale-110")}
        size={18}
      />
      {collapsed ? null : <span className="text-sm">{item.label}</span>}
    </ShellLink>
  );

  return collapsed ? (
    <Tooltip>
      <Tooltip.Trigger aria-label={item.label}>{link}</Tooltip.Trigger>
      <Tooltip.Content placement="right">{item.label}</Tooltip.Content>
    </Tooltip>
  ) : link;
}

function BottomNavLink({ item, floating, hasCenterButton, renderLink }: {
  item: AppShellNavItem;
  floating?: boolean;
  hasCenterButton: boolean;
  renderLink?: AppShellProps["renderLink"];
}) {
  const Icon = item.icon;
  return (
    <ShellLink
      aria-current={item.isActive ? "page" : undefined}
      aria-label={item.label}
      className={floating ? "absolute -top-5 left-1/2 -translate-x-1/2" : cn(
        hasCenterButton
          ? "flex flex-col items-center justify-center gap-1 px-4 py-2"
          : "flex flex-col items-center justify-center gap-1 px-3 py-2",
        "transition-all duration-200 ease-out",
        hasCenterButton ? "min-w-[60px]" : "min-w-[52px]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        item.isActive ? "text-accent" : "text-muted hover:text-foreground active:scale-95"
      )}
      href={item.href}
      renderLink={renderLink}
    >
      {floating ? (
        <div className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full",
          "bg-accent shadow-accent/40 shadow-lg",
          "ring-4 ring-background",
          "transition-all duration-200 ease-out",
          "hover:shadow-accent/50 hover:shadow-xl active:scale-95",
          item.isActive ? "scale-105" : ""
        )}>
          <Icon className="text-white" size={24} />
        </div>
      ) : (
        <>
          <Icon className="transition-all duration-200" size={item.isActive ? 22 : 20} />
          <span className={cn(
            "text-[10px] transition-all duration-200",
            item.isActive ? "font-semibold" : "font-medium"
          )}>{item.label}</span>
        </>
      )}
    </ShellLink>
  );
}

export function MobileBottomNavigation({ navItems, isVisiting, label, renderLink }: {
  navItems: AppShellNavItem[];
  isVisiting: boolean;
  label: string;
  renderLink?: AppShellProps["renderLink"];
}) {
  const hasCenterButton = navItems.some((item) => item.isCenterButton);
  const mobileItems = navItems.filter((item) => !item.hideOnMobile);
  const centerItem = mobileItems.find((item) => item.isCenterButton);
  const regularItems = mobileItems.filter((item) => !item.isCenterButton);
  const link = (item: AppShellNavItem) => (
    <BottomNavLink hasCenterButton={hasCenterButton} item={item} key={item.key} renderLink={renderLink} />
  );

  return (
    <nav
      aria-label={label}
      className={hasCenterButton ? cn(
        "fixed right-0 bottom-0 left-0 z-50 border-border border-t backdrop-blur backdrop-saturate-200 lg:hidden dark:border-white/10",
        isVisiting ? "bg-warning-soft/80 dark:bg-warning/20" : "!bg-transparent"
      ) : "fixed right-0 bottom-0 left-0 z-50 border-border border-t bg-background backdrop-blur backdrop-saturate-200 lg:hidden dark:border-white/10"}
    >
      <div className={hasCenterButton
        ? "relative flex h-16 items-center justify-around px-2"
        : "flex h-16 items-center justify-around px-2"}>
        {hasCenterButton ? (
          <>
            {regularItems.slice(0, 2).map(link)}
            {centerItem ? <BottomNavLink floating hasCenterButton item={centerItem} renderLink={renderLink} /> : null}
            <div className="min-w-[60px]" />
            {regularItems.slice(2, 4).map(link)}
          </>
        ) : mobileItems.map(link)}
      </div>
    </nav>
  );
}
