'use client';
import { createContext, useContext, useState, type ReactNode } from 'react';
import type { MenuContextProps } from '@/types/layout';

const MenuContext = createContext<MenuContextProps>({} as MenuContextProps);

export function MenuProvider({ children }: { children: ReactNode }) {
  const [activeMenu, setActiveMenu] = useState('');
  return <MenuContext.Provider value={{ activeMenu, setActiveMenu }}>{children}</MenuContext.Provider>;
}

export const useMenu = () => useContext(MenuContext);
