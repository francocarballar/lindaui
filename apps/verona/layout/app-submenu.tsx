'use client';
import { useEffect } from 'react';
import AppMenuitem from './app-menuitem';
import { MenuProvider } from './context/menu-context';
import { useLayout } from './context/layout-context';
import type { MenuModel, Breadcrumb } from '@/types/layout';

function generateBreadcrumbs(model: MenuModel[]): Breadcrumb[] {
  const crumbs: Breadcrumb[] = [];
  const walk = (item: MenuModel, labels: string[] = []) => {
    const next = item.label ? [...labels, item.label] : labels;
    item.items?.forEach((child) => walk(child, next));
    if (item.to) crumbs.push({ labels: next, to: item.to });
  };
  model.forEach((item) => walk(item));
  return crumbs;
}

export default function AppSubMenu({ model }: { model: MenuModel[] }) {
  const { setBreadcrumbs } = useLayout();

  useEffect(() => {
    setBreadcrumbs(generateBreadcrumbs(model));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MenuProvider>
      <ul className="layout-menu">
        {model.map((item, i) =>
          !item.seperator ? (
            <AppMenuitem item={item} root index={i} key={item.label} />
          ) : (
            <li className="menu-separator" key={`sep-${i}`} />
          )
        )}
      </ul>
    </MenuProvider>
  );
}
