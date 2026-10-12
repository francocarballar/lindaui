import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, test, vi } from 'vitest';
import { LayoutProvider, useLayout } from './context/layout-context';
import MainLayout from '../app/(main)/layout';
import FullPageLayout from '../app/(full-page)/layout';
import Dashboard from '../app/(main)/page';

vi.mock('next/navigation', () => ({ usePathname: () => '/' }));
afterEach(() => {
  vi.unstubAllGlobals();
  document.documentElement.classList.remove('dark');
});

function ThemeAction() {
  const { setLayoutConfig } = useLayout();
  return <button onClick={() => setLayoutConfig({ colorScheme: 'dark', menuMode: 'static' })}>Use dark theme</button>;
}

test('main shell renders the dashboard, navigation, search and footer', async () => {
  const user = userEvent.setup();
  const { container } = render(<LayoutProvider><MainLayout><Dashboard /><ThemeAction /></MainLayout></LayoutProvider>);
  expect(screen.getByRole('heading', { name: 'SaaS Dashboard' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
  expect(screen.getByRole('searchbox', { name: 'Search' })).toBeInTheDocument();
  expect(screen.getByText('© Your Organization')).toBeInTheDocument();
  vi.stubGlobal('innerWidth', 1280);
  await user.click(screen.getByRole('button', { name: 'Toggle menu' }));
  expect(container.querySelector('.layout-container')).toHaveClass('layout-static-inactive');
  vi.stubGlobal('innerWidth', 390);
  await user.click(screen.getByRole('button', { name: 'Toggle menu' }));
  expect(container.querySelector('.layout-container')).toHaveClass('layout-mobile-active');
  await user.click(screen.getByRole('button', { name: 'Use dark theme' }));
  expect(container.querySelector('.layout-container')).toHaveClass('layout-dark');
});

test('full-page layout preserves its content without adding shell navigation', () => {
  render(<FullPageLayout><h1>Sign in</h1></FullPageLayout>);
  expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
  expect(screen.queryByRole('navigation')).toBeNull();
});
