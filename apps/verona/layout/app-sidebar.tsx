'use client';
import AppMenu from './app-menu';
import { MenuProvider } from './context/menu-context';

export default function AppSidebar() {
  return (
    <div className="layout-menu-container">
      <MenuProvider>
        <AppMenu />
      </MenuProvider>
    </div>
  );
}
