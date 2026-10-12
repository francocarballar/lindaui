import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import type { ReactNode } from 'react';
import { RadialChart } from './radial-chart';

const state = vi.hoisted(() => ({ viewBox: undefined as Record<string, number | undefined> | undefined }));
// Exercise the library's label formatter independently of Recharts' measured
// layout; real chart rendering remains covered by Storybook browser tests.
vi.mock('@lindaui/ui/chart', () => ({
  ChartContainer: ({ children }: { children: ReactNode }) => <svg>{children}</svg>,
  ChartTooltip: () => null,
  ChartTooltipContent: () => null,
}));
vi.mock('recharts', () => ({
  RadialBarChart: ({ children }: { children: ReactNode }) => <>{children}</>,
  PolarGrid: () => null,
  PolarRadiusAxis: ({ children }: { children: ReactNode }) => <>{children}</>,
  RadialBar: ({ dataKey, stackId, background }: { dataKey: string; stackId?: string; background: boolean }) => <g data-testid={dataKey} data-stack={stackId} data-background={String(background)} />,
  Label: ({ content }: { content: (props: { viewBox: typeof state.viewBox }) => ReactNode }) => <>{content({ viewBox: state.viewBox })}</>,
}));
const props = { data: [{ task: 'A', done: 10, other: 'skip' }, { task: 'B', done: 15, other: 5 }], config: {}, categoryKey: 'task', series: ['done', 'other'] };

test.each([undefined, { cx: 10 }, { cy: 20 }])('labels omit text when Recharts has no complete viewBox %j', (viewBox) => {
  state.viewBox = viewBox;
  render(<RadialChart {...props} variant="label" />);
  expect(screen.queryByText('Total')).toBeNull();
});

test.each([{ cx: 40, cy: 60 }, { cx: 0, cy: undefined }])('label sums numeric values and uses center coordinates %j', (viewBox) => {
  state.viewBox = viewBox;
  render(<RadialChart {...props} variant="label" />);
  expect(screen.getByText('30')).toHaveAttribute('x', String(viewBox.cx));
  expect(screen.getByText('Total')).toHaveAttribute('y', String((viewBox.cy ?? 0) + 20));
});

test('stacked series share their stack and disable individual backgrounds', () => {
  render(<RadialChart {...props} variant="stacked" />);
  expect(screen.getByTestId('done')).toHaveAttribute('data-stack', 'stack');
  expect(screen.getByTestId('other')).toHaveAttribute('data-background', 'false');
  expect(screen.queryByText('Total')).toBeNull();
});
