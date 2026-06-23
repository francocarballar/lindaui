import type { ReactNode } from 'react';
import AppLayout from '../../layout/app-layout';

export default function MainLayout({ children }: { children: ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}
