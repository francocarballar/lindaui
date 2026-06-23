import { render, screen } from '@testing-library/react';
import AppMenuitem from './app-menuitem';
import { LayoutProvider } from './context/layout-context';
import { MenuProvider } from './context/menu-context';

vi.mock('next/navigation', () => ({
  usePathname: () => '/uikit/input',
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: vi.fn() })
}));

function wrap(ui: React.ReactNode) {
  return render(
    <LayoutProvider>
      <MenuProvider>
        <ul>{ui}</ul>
      </MenuProvider>
    </LayoutProvider>
  );
}

test('item con to renderiza un link con su label', () => {
  wrap(<AppMenuitem item={{ label: 'Input', icon: 'pi pi-fw pi-check-square', to: '/uikit/input' }} index={0} />);
  const link = screen.getByRole('link', { name: /Input/ });
  expect(link).toHaveAttribute('href', '/uikit/input');
});

test('marca active-route cuando el pathname coincide', () => {
  wrap(<AppMenuitem item={{ label: 'Input', to: '/uikit/input' }} index={0} />);
  expect(screen.getByRole('link', { name: /Input/ })).toHaveClass('active-route');
});

test('item sin to con hijos renderiza un toggler (no link)', () => {
  wrap(
    <AppMenuitem
      item={{ label: 'Mail', items: [{ label: 'Inbox', to: '/apps/mail/inbox' }] }}
      index={0}
      root
    />
  );
  expect(screen.getByText('Mail')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Inbox/ })).toHaveAttribute('href', '/apps/mail/inbox');
});
