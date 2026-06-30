'use client';
import Link from 'next/link';
import { useLayout } from './context/layout-context';
import { Icon } from '@/lib/icon';
import { SearchField } from '@lindaui/ui/search-field';
import { Avatar } from '@lindaui/ui/avatar';
import { Menu } from '@lindaui/ui/menu';

export default function AppTopbar() {
  const { onMenuToggle } = useLayout();

  return (
    <div className="layout-topbar">
      <Link href="/" className="app-logo">
        <span className="app-name">Verona</span>
      </Link>

      <button
        className="topbar-menubutton p-link"
        type="button"
        onClick={onMenuToggle}
        aria-label="Toggle menu"
      >
        <span />
      </button>

      <div className="topbar-search">
        <SearchField aria-label="Search" placeholder="Search" />
      </div>

      <div className="topbar-profile">
        <Menu
          trigger={
            <span className="topbar-profile-button">
              <Avatar>
                <span aria-hidden>GR</span>
              </Avatar>
              <span className="profile-details">
                <span className="profile-name">Gene Russell</span>
                <span className="profile-job">Developer</span>
              </span>
              <Icon name="pi pi-angle-down" />
            </span>
          }
          items={[
            { key: 'profile', label: 'Profile' },
            { key: 'settings', label: 'Settings' },
            { key: 'signout', label: 'Sign Out', isDanger: true },
          ]}
        />
      </div>
    </div>
  );
}
