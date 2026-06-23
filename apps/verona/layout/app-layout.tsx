'use client';
import type { ReactNode } from 'react';
import { useLayout } from './context/layout-context';
import AppTopbar from './app-topbar';
import AppSidebar from './app-sidebar';
import AppBreadcrumb from './app-breadcrumb';
import AppFooter from './app-footer';
import AppConfig from './app-config';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { layoutState, layoutConfig } = useLayout();

  const containerClass = [
    'layout-container',
    'layout-static',
    layoutState.staticMenuDesktopInactive ? 'layout-static-inactive' : '',
    layoutState.staticMenuMobileActive ? 'layout-mobile-active' : '',
    layoutConfig.colorScheme === 'dark' ? 'layout-dark' : 'layout-light'
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClass}>
      <AppTopbar />
      <div className="layout-sidebar">
        <AppSidebar />
      </div>
      <div className="layout-content-wrapper">
        <div className="layout-content">
          <div className="layout-content-inner">
            <AppBreadcrumb />
            {children}
            <AppFooter />
          </div>
        </div>
      </div>
      <AppConfig />
    </div>
  );
}
