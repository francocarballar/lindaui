import { act, renderHook } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { useQRRefresh } from './use-qr-refresh';

test('overlapping refresh requests share the pending guard and recover on completion', async () => {
  let resolve!: () => void;
  const onRefresh = vi.fn(() => new Promise<void>((done) => { resolve = done; }));
  const { result } = renderHook(() => useQRRefresh({ enabled: false, expirySeconds: 60, errorLabel: 'Refresh failed', onRefresh }));
  let first!: Promise<void>;
  let second!: Promise<void>;
  act(() => { first = result.current.refresh(); second = result.current.refresh(); });
  expect(onRefresh).toHaveBeenCalledOnce();
  expect(result.current.isRefreshing).toBe(true);
  await act(async () => { resolve(); await Promise.all([first, second]); });
  expect(result.current.isRefreshing).toBe(false);
  expect(result.current.timeRemaining).toBe(60);
  expect(result.current.actionError).toBeNull();
  act(() => { first = result.current.refresh(); });
  expect(onRefresh).toHaveBeenCalledTimes(2);
  await act(async () => { resolve(); await first; });
});
