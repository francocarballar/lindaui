import type { Dispatch, SetStateAction, HTMLAttributeAnchorTarget } from 'react';

export type ColorScheme = 'light' | 'dark';
export type MenuMode = 'static';

export interface MenuModel {
  label: string;
  icon?: string;
  items?: MenuModel[];
  to?: string;
  url?: string;
  target?: HTMLAttributeAnchorTarget;
  class?: string;
  visible?: boolean;
  disabled?: boolean;
  seperator?: boolean;
}

export interface Breadcrumb {
  labels?: string[];
  to?: string;
}

export interface LayoutConfig {
  colorScheme: ColorScheme;
  menuMode: MenuMode;
}

export interface LayoutState {
  staticMenuDesktopInactive: boolean;
  staticMenuMobileActive: boolean;
  configSidebarVisible: boolean;
}

export interface Tab {
  label: string;
  to: string;
}

export interface LayoutContextProps {
  layoutConfig: LayoutConfig;
  setLayoutConfig: Dispatch<SetStateAction<LayoutConfig>>;
  layoutState: LayoutState;
  setLayoutState: Dispatch<SetStateAction<LayoutState>>;
  onMenuToggle: () => void;
  isDesktop: () => boolean;
  isSidebarActive: () => boolean;
  isSlim: () => boolean;
  isSlimPlus: () => boolean;
  isHorizontal: () => boolean;
  breadcrumbs: Breadcrumb[];
  setBreadcrumbs: Dispatch<SetStateAction<Breadcrumb[]>>;
  tabs: Tab[];
  openTab: (tab: Tab) => void;
  closeTab: (index: number) => void;
}

export interface MenuContextProps {
  activeMenu: string;
  setActiveMenu: (key: string) => void;
}
