import type { AnchorHTMLAttributes, ComponentType, ReactNode } from "react";

export interface AppShellNavItem {
  key: string;
  label: string;
  href: string;
  icon: ComponentType<{ className?: string; size?: number }>;
  isActive?: boolean;
  hideOnMobile?: boolean;
  isCenterButton?: boolean;
  /** Intercept sidebar/drawer navigation, for example to open a settings dialog. */
  onAction?: () => void;
}

export interface AppShellBrand {
  label: string;
  href: string;
  logoSrc?: string;
}

export type AppShellLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
};

export interface AppShellImageProps {
  alt: string;
  className: string;
  height: number;
  src: string;
  width: number;
}

export interface AppShellLabels {
  collapseSidebar: string;
  expandSidebar: string;
  openMenu: string;
  closeMenu: string;
  mainNavigation: string;
  bottomNavigation: string;
}

export interface AppShellProps {
  brand: AppShellBrand;
  children: ReactNode;
  navItems: AppShellNavItem[];
  contentTopSlot?: ReactNode;
  headerRightSlot?: ReactNode;
  sidebarTopSlot?: ReactNode | ((isCollapsed: boolean) => ReactNode);
  sidebarFooterSlot?: ReactNode | ((isCollapsed: boolean) => ReactNode);
  isVisiting?: boolean;
  defaultCollapsed?: boolean;
  labels?: Partial<AppShellLabels>;
  /** Inject a router link without coupling the block to any framework. */
  renderLink?: (props: AppShellLinkProps) => ReactNode;
  renderImage?: (props: AppShellImageProps) => ReactNode;
}
