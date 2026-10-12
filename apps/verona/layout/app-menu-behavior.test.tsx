import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, test, expect, vi } from 'vitest';
import AppMenuitem from './app-menuitem';
import AppSubMenu from './app-submenu';
import { LayoutProvider, useLayout } from './context/layout-context';
import { MenuProvider, useMenu } from './context/menu-context';
import type { MenuModel } from '@/types/layout';

vi.mock('next/navigation', () => ({ usePathname: () => '/current' }));
afterEach(() => vi.unstubAllGlobals());
function State() {
  const { activeMenu } = useMenu();
  const { layoutState } = useLayout();
  return <output aria-label="Navigation state">{JSON.stringify({ activeMenu, mobile: layoutState.staticMenuMobileActive })}</output>;
}
function MobileOpen() {
  const { onMenuToggle } = useLayout();
  return <button onClick={onMenuToggle}>Open mobile menu</button>;
}
function wrap(item: MenuModel, parentKey?: string) {
  return render(<LayoutProvider><MenuProvider><ul><AppMenuitem item={item} index={2} parentKey={parentKey} /></ul><State /><MobileOpen /></MenuProvider></LayoutProvider>);
}

test('groups support keyboard expansion and collapse to their parent', async () => {
  const user = userEvent.setup();
  wrap({ label: 'Mail', items: [{ label: 'Inbox', to: '/inbox' }] }, '1');
  const group = screen.getByRole('button', { name: 'Mail' });
  expect(group).toHaveAttribute('aria-expanded', 'false');
  expect(screen.queryByRole('link', { name: 'Inbox' })).toBeNull();
  act(() => group.focus());
  await user.keyboard('{Enter}');
  expect(group).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByRole('link', { name: 'Inbox' })).toBeInTheDocument();
  expect(screen.getByLabelText('Navigation state')).toHaveTextContent('"activeMenu":"1-2"');
  await user.keyboard(' ');
  expect(group).toHaveAttribute('aria-expanded', 'false');
  expect(screen.getByLabelText('Navigation state')).toHaveTextContent('"activeMenu":"1"');
});

test('top-level groups collapse to the empty key', async () => {
  const user = userEvent.setup();
  wrap({ label: 'Group', items: [] });
  await user.click(screen.getByRole('button', { name: 'Group' }));
  await user.click(screen.getByRole('button', { name: 'Group' }));
  expect(screen.getByLabelText('Navigation state')).toHaveTextContent('"activeMenu":""');
});

test('disabled links prevent navigation and preserve active state', async () => {
  const user = userEvent.setup();
  wrap({ label: 'Disabled', to: '/target', disabled: true });
  const link = screen.getByRole('link', { name: 'Disabled' });
  await user.click(link);
  expect(screen.getByLabelText('Navigation state')).toHaveTextContent('"activeMenu":""');
  // React's delegated handler runs after native listeners on the target.
  const event = new MouseEvent('click', { bubbles: true, cancelable: true });
  fireEvent(link, event);
  expect(event.defaultPrevented).toBe(true);
});

test.each([390, 1280])('leaf selection closes only mobile navigation at width %s', async (width) => {
  vi.stubGlobal('innerWidth', width);
  const user = userEvent.setup();
  wrap({ label: 'External', url: '#external', target: '_blank' });
  await user.click(screen.getByRole('button', { name: 'Open mobile menu' }));
  await user.click(screen.getByRole('link', { name: 'External' }));
  expect(screen.getByLabelText('Navigation state')).toHaveTextContent('"activeMenu":"2"');
  expect(screen.getByLabelText('Navigation state')).toHaveTextContent('"mobile":false');
});

test('hidden items and groups do not render, while separators and unlabeled routes are supported', () => {
  const { container } = render(<LayoutProvider><AppSubMenu model={[
    { label: 'Hidden', visible: false, items: [{ label: 'Secret', to: '/secret' }] },
    { label: '', to: '/empty' },
    { label: 'Separator', seperator: true },
  ]} /></LayoutProvider>);
  expect(screen.queryByText('Hidden')).toBeNull();
  expect(screen.queryByText('Secret')).toBeNull();
  expect(container.querySelector('.menu-separator')).toBeInTheDocument();
  expect(screen.getByRole('link')).toHaveAttribute('href', '/empty');
});
