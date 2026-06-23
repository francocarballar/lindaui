import { render, screen } from '@testing-library/react';
import { LayoutProvider, useLayout } from './layout-context';

function Probe() {
  const { layoutConfig, isSlim, isDesktop } = useLayout();
  return (
    <div>
      <span>scheme:{layoutConfig.colorScheme}</span>
      <span>mode:{layoutConfig.menuMode}</span>
      <span>slim:{String(isSlim())}</span>
      <span>desktop-fn:{typeof isDesktop}</span>
    </div>
  );
}

test('LayoutProvider expone config default static/light y stubs en false', () => {
  render(
    <LayoutProvider>
      <Probe />
    </LayoutProvider>
  );
  expect(screen.getByText('scheme:light')).toBeInTheDocument();
  expect(screen.getByText('mode:static')).toBeInTheDocument();
  expect(screen.getByText('slim:false')).toBeInTheDocument();
  expect(screen.getByText('desktop-fn:function')).toBeInTheDocument();
});
