import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, test, vi } from 'vitest';
import { useState } from 'react';
import { TimeRangePicker } from './time-range-picker';
import type { Preset } from './types';

afterEach(() => vi.useRealTimers());

test('presets notify consumers and custom opens the segmented date range calendar', async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-10-12T12:00:00Z'));
  const user = userEvent.setup();
  const onPresetChange = vi.fn();
  const onCustomRangeChange = vi.fn();
  function Demo() {
    const [preset, setPreset] = useState<Preset>('24h');
    return <TimeRangePicker preset={preset} customRange={null} onPresetChange={(value) => { onPresetChange(value); setPreset(value); }} onCustomRangeChange={onCustomRangeChange} t={(key) => key} />;
  }
  render(<Demo />);
  await user.click(screen.getByRole('button', { name: 'analytics.timeRange.7d' }));
  expect(onPresetChange).toHaveBeenLastCalledWith('7d');
  await user.click(screen.getByRole('button', { name: 'analytics.timeRange.custom' }));
  expect(onPresetChange).toHaveBeenLastCalledWith('custom');
  const calendar = await screen.findByRole('dialog');
  expect(calendar).toBeVisible();
  await user.click(screen.getByRole('button', { name: /year selector/ }));
  await user.click(screen.getByRole('button', { name: '2025' }));
  await user.click(screen.getByRole('button', { name: 'Monday, December 1, 2025' }));
  await user.click(screen.getByRole('button', { name: 'Tuesday, December 2, 2025' }));
  expect(onCustomRangeChange).toHaveBeenCalled();
  await user.keyboard('{Escape}');
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  expect(screen.getAllByRole('spinbutton').length).toBeGreaterThan(0);
}, 15000);
