import { render } from '@testing-library/react';
import { Icon } from './icon';

test('renderiza un svg para un token pi conocido', () => {
  const { container } = render(<Icon name="pi pi-fw pi-home" />);
  expect(container.querySelector('svg')).toBeInTheDocument();
});

test('token desconocido cae al fallback (svg igual presente)', () => {
  const { container } = render(<Icon name="pi pi-zzz-unknown" />);
  expect(container.querySelector('svg')).toBeInTheDocument();
});

test('name vacío no renderiza nada', () => {
  const { container } = render(<Icon name="" />);
  expect(container.querySelector('svg')).not.toBeInTheDocument();
});

test('propaga className al svg', () => {
  const { container } = render(<Icon name="pi pi-home" className="layout-menuitem-icon" />);
  expect(container.querySelector('svg')?.getAttribute('class')).toContain('layout-menuitem-icon');
});
