'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, Fragment } from 'react';
import { useLayout } from './context/layout-context';
import { Icon } from '@/lib/icon';
import type { Breadcrumb } from '@/types/layout';

export default function AppBreadcrumb({ className }: { className?: string }) {
  const pathname = usePathname();
  const { breadcrumbs } = useLayout();
  const [crumb, setCrumb] = useState<Breadcrumb | null>(null);

  useEffect(() => {
    const found = breadcrumbs.find((c) => c.to?.replace(/\/$/, '') === pathname.replace(/\/$/, ''));
    setCrumb(found ?? null);
  }, [pathname, breadcrumbs]);

  return (
    <div className={className}>
      <nav className="layout-breadcrumb">
        <ol>
          <li>
            <Link href="/" style={{ color: 'inherit' }} aria-label="Home">
              <Icon name="pi pi-home" />
            </Link>
          </li>
          <li className="layout-breadcrumb-chevron"> / </li>
          {crumb && crumb.labels && pathname !== '/' ? (
            crumb.labels.map((label, i) => (
              <Fragment key={i}>
                {i !== 0 && <li className="layout-breadcrumb-chevron"> / </li>}
                <li>{label}</li>
              </Fragment>
            ))
          ) : (
            pathname === '/' && <li>SaaS Dashboard</li>
          )}
        </ol>
      </nav>
    </div>
  );
}
