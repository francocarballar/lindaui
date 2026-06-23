'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useLayout } from './context/layout-context';
import { useMenu } from './context/menu-context';
import { Icon } from '@/lib/icon';
import type { MenuModel } from '@/types/layout';

interface Props {
  item: MenuModel;
  index: number;
  parentKey?: string;
  root?: boolean;
}

export default function AppMenuitem({ item, index, parentKey, root }: Props) {
  const { activeMenu, setActiveMenu } = useMenu();
  const { setLayoutState, isDesktop } = useLayout();
  const pathname = usePathname();

  const key = parentKey ? `${parentKey}-${index}` : String(index);
  const isActiveRoute = !!item.to && pathname === item.to;
  const active = activeMenu === key || (!!activeMenu && activeMenu.startsWith(key + '-'));

  useEffect(() => {
    if (isActiveRoute) setActiveMenu(key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const itemClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (item.disabled) {
      event.preventDefault();
      return;
    }
    if (item.items) {
      setActiveMenu(active ? (parentKey ?? '') : key);
    } else {
      if (!isDesktop()) setLayoutState((prev) => ({ ...prev, staticMenuMobileActive: false }));
      setActiveMenu(key);
    }
  };

  const subMenu =
    item.items && item.visible !== false ? (
      <ul>
        {item.items.map((child, i) => (
          <AppMenuitem item={child} index={i} parentKey={key} key={child.label} />
        ))}
      </ul>
    ) : null;

  return (
    <li className={[root ? 'layout-root-menuitem' : '', active ? 'active-menuitem' : ''].filter(Boolean).join(' ')}>
      {root && item.visible !== false && (
        <div className="layout-menuitem-root-text">
          <span>{item.label}</span>
        </div>
      )}

      {(!item.to || item.items) && item.visible !== false && !root ? (
        <a
          href={item.url}
          onClick={itemClick}
          className={item.class}
          target={item.target}
          tabIndex={0}
        >
          <Icon name={item.icon} className="layout-menuitem-icon" />
          <span className="layout-menuitem-text">{item.label}</span>
          {item.items && <Icon name="pi pi-angle-down" className="layout-submenu-toggler" />}
        </a>
      ) : null}

      {item.to && !item.items && item.visible !== false ? (
        <Link
          href={item.to}
          onClick={itemClick}
          className={[item.class, isActiveRoute ? 'active-route' : ''].filter(Boolean).join(' ')}
          tabIndex={0}
        >
          <Icon name={item.icon} className="layout-menuitem-icon" />
          <span className="layout-menuitem-text">{item.label}</span>
        </Link>
      ) : null}

      {subMenu}
    </li>
  );
}
