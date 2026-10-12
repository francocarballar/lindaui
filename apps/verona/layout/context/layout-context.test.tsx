import { act, render, renderHook, screen } from '@testing-library/react';
import { LayoutProvider, useLayout } from './layout-context';

afterEach(() => vi.unstubAllGlobals());

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

test('menu toggles independently on desktop and narrow screens', () => {
  const { result } = renderHook(() => useLayout(), { wrapper: LayoutProvider });
  vi.stubGlobal('innerWidth', 1280);
  expect(result.current.isDesktop()).toBe(true);
  act(() => result.current.onMenuToggle());
  expect(result.current.layoutState.staticMenuDesktopInactive).toBe(true);
  expect(result.current.isSidebarActive()).toBe(false);
  vi.stubGlobal('innerWidth', 390);
  expect(result.current.isDesktop()).toBe(false);
  act(() => result.current.onMenuToggle());
  expect(result.current.isSidebarActive()).toBe(true);
  expect(result.current.layoutState.staticMenuDesktopInactive).toBe(true);
  act(() => result.current.onMenuToggle());
  expect(result.current.isSidebarActive()).toBe(false);
  vi.unstubAllGlobals();
});

test('tabs preserve insertion order and close only the requested entry', () => {
  const { result } = renderHook(() => useLayout(), { wrapper: LayoutProvider });
  const first = { label: 'First', to: '/first' };
  const second = { label: 'Second', to: '/second' };
  act(() => { result.current.openTab(first); result.current.openTab(second); });
  expect(result.current.tabs).toEqual([first, second]);
  act(() => result.current.closeTab(0));
  expect(result.current.tabs).toEqual([second]);
  expect(result.current.isSlimPlus()).toBe(false);
  expect(result.current.isHorizontal()).toBe(false);
});

test('desktop detection is safe without window', () => {
  const { result } = renderHook(() => useLayout(), { wrapper: LayoutProvider });
  try {
    vi.stubGlobal('window', undefined);
    expect(result.current.isDesktop()).toBe(false);
  } finally { vi.unstubAllGlobals(); }
});
