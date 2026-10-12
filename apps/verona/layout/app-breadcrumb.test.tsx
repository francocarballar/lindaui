import { useEffect } from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';
import AppBreadcrumb from './app-breadcrumb';
import { LayoutProvider, useLayout } from './context/layout-context';
import type { Breadcrumb } from '../types/layout';

const navigation = vi.hoisted(() => ({ pathname: '/' }));
vi.mock('next/navigation', () => ({ usePathname: () => navigation.pathname }));
beforeEach(() => { navigation.pathname = '/'; });

function Crumbs({ entries }: { entries: Breadcrumb[] }) {
  const { setBreadcrumbs } = useLayout();
  useEffect(() => { setBreadcrumbs(entries); }, [entries, setBreadcrumbs]);
  return <AppBreadcrumb className="custom-breadcrumb" />;
}

test('normalizes trailing slashes and renders every breadcrumb label', () => {
  navigation.pathname = '/record/';
  render(<LayoutProvider><Crumbs entries={[{}, { to: '/record', labels: ['Workspace', 'Record'] }]} /></LayoutProvider>);
  expect(screen.getByText('Workspace')).toBeInTheDocument();
  expect(screen.getByText('Record')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
});

test('an unknown path or unlabeled breadcrumb shows only the home link', () => {
  navigation.pathname = '/unknown';
  const { rerender } = render(<LayoutProvider><Crumbs entries={[{ to: '/record', labels: ['Record'] }]} /></LayoutProvider>);
  expect(screen.queryByText('Record')).toBeNull();
  rerender(<LayoutProvider><Crumbs entries={[{ to: '/unknown' }]} /></LayoutProvider>);
  expect(screen.getAllByRole('link')).toHaveLength(1);
});

test('home shows the dashboard label instead of a registered trail', () => {
  render(<LayoutProvider><Crumbs entries={[{ to: '/', labels: ['Ignored trail'] }]} /></LayoutProvider>);
  expect(screen.getByText('SaaS Dashboard')).toBeInTheDocument();
  expect(screen.queryByText('Ignored trail')).toBeNull();
});
