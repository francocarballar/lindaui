import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { ConnectedPanel } from './connected-panel';

const labels = { disconnectHint: 'Disconnect this session', disconnect: 'Disconnect', disconnecting: 'Disconnecting', disconnectError: 'Disconnect failed', confirmTitle: 'Confirm disconnect', confirmDescription: 'You can connect again later', cancel: 'Keep session' };

test('cancel and Escape preserve the session, with external errors outside the modal', async () => {
  const user = userEvent.setup();
  const onDisconnect = vi.fn(async () => {});
  render(<ConnectedPanel details={[]} labels={labels} error="Connection interrupted" onDisconnect={onDisconnect} />);
  expect(screen.getByRole('alert')).toHaveTextContent('Connection interrupted');
  await user.click(screen.getByRole('button', { name: 'Disconnect' }));
  const dialog = screen.getByRole('alertdialog', { name: 'Confirm disconnect' });
  expect(screen.queryByRole('alert')).toBeNull();
  await user.click(within(dialog).getByRole('button', { name: 'Keep session' }));
  await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
  expect(screen.getByRole('alert')).toHaveTextContent('Connection interrupted');
  await user.click(screen.getByRole('button', { name: 'Disconnect' }));
  await user.keyboard('{Escape}');
  await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
  expect(onDisconnect).not.toHaveBeenCalled();
});
