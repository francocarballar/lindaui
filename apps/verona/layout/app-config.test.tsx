import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AppConfig from './app-config';
import { LayoutProvider } from './context/layout-context';

function setup() {
  return render(
    <LayoutProvider>
      <AppConfig />
    </LayoutProvider>
  );
}

test('elegir Dark agrega la clase dark al html', async () => {
  const user = userEvent.setup();
  setup();
  await user.click(screen.getByRole('button', { name: /config/i }));
  await user.click(screen.getByRole('radio', { name: /dark/i }));
  expect(document.documentElement).toHaveClass('dark');
});

test('volver a Light remueve la clase dark', async () => {
  const user = userEvent.setup();
  setup();
  await user.click(screen.getByRole('button', { name: /config/i }));
  await user.click(screen.getByRole('radio', { name: /dark/i }));
  await user.click(screen.getByRole('radio', { name: /light/i }));
  expect(document.documentElement).not.toHaveClass('dark');
});
