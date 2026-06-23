'use client';
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { LayoutConfig, LayoutState, LayoutContextProps, Breadcrumb, Tab } from '@/types/layout';

const LayoutContext = createContext<LayoutContextProps>({} as LayoutContextProps);

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>({ colorScheme: 'light', menuMode: 'static' });
  const [layoutState, setLayoutState] = useState<LayoutState>({
    staticMenuDesktopInactive: false,
    staticMenuMobileActive: false,
    configSidebarVisible: false
  });
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);
  const [tabs, setTabs] = useState<Tab[]>([]);

  const isDesktop = useCallback(() => typeof window !== 'undefined' && window.innerWidth > 991, []);

  const onMenuToggle = useCallback(() => {
    setLayoutState((prev) =>
      isDesktop()
        ? { ...prev, staticMenuDesktopInactive: !prev.staticMenuDesktopInactive }
        : { ...prev, staticMenuMobileActive: !prev.staticMenuMobileActive }
    );
  }, [isDesktop]);

  const isSidebarActive = useCallback(() => layoutState.staticMenuMobileActive, [layoutState.staticMenuMobileActive]);
  const openTab = useCallback((tab: Tab) => setTabs((prev) => [...prev, tab]), []);
  const closeTab = useCallback((index: number) => setTabs((prev) => prev.filter((_, i) => i !== index)), []);

  const value: LayoutContextProps = {
    layoutConfig,
    setLayoutConfig,
    layoutState,
    setLayoutState,
    onMenuToggle,
    isDesktop,
    isSidebarActive,
    isSlim: () => false,
    isSlimPlus: () => false,
    isHorizontal: () => false,
    breadcrumbs,
    setBreadcrumbs,
    tabs,
    openTab,
    closeTab
  };

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
}

export const useLayout = () => useContext(LayoutContext);
