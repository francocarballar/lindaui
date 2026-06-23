'use client';
import { useEffect } from 'react';
import { useLayout } from './context/layout-context';
import { Icon } from '@/lib/icon';
import { Drawer } from '@ts/ui/drawer';
import { RadioGroup } from '@ts/ui/radio-group';
import { Radio } from '@ts/ui/radio';
import type { ColorScheme } from '@/types/layout';

export default function AppConfig() {
  const { layoutConfig, setLayoutConfig } = useLayout();

  useEffect(() => {
    const root = document.documentElement;
    if (layoutConfig.colorScheme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [layoutConfig.colorScheme]);

  const onScheme = (value: string) =>
    setLayoutConfig((prev) => ({ ...prev, colorScheme: value as ColorScheme }));

  return (
    <Drawer.Root>
      <Drawer.Trigger aria-label="Config" className="layout-config-button config-link">
        <Icon name="pi pi-cog" />
      </Drawer.Trigger>
      <Drawer.Backdrop>
        <Drawer.Content placement="right">
          <Drawer.Dialog>
            <Drawer.Heading>Configuración</Drawer.Heading>
            <Drawer.Body>
              <RadioGroup aria-label="Color Scheme" value={layoutConfig.colorScheme} onChange={onScheme}>
                <Radio value="light">Light</Radio>
                <Radio value="dark">Dark</Radio>
              </RadioGroup>
            </Drawer.Body>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer.Root>
  );
}
