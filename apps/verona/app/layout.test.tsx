import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import RootLayout, { metadata } from './layout';
import { useLayout } from '../layout/context/layout-context';

vi.mock('next/font/local', () => ({ default: () => ({ variable: 'lato-font' }) }));
function Child() {
  const { layoutConfig } = useLayout();
  return <p>{layoutConfig.colorScheme}</p>;
}
test('root supplies Spanish language, font and layout context', () => {
  const { container } = render(<RootLayout><Child /></RootLayout>, { container: document });
  expect(document.documentElement).toHaveAttribute('lang', 'es');
  expect(document.documentElement).toHaveClass('lato-font');
  expect(screen.getByText('light')).toBeInTheDocument();
  expect(metadata.title).toContain('Verona');
  expect(metadata.description).toContain('@lindaui/ui');
});
