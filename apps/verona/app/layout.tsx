import type { ReactNode } from 'react';
import '../styles/globals.css';

export const metadata = {
  title: 'Verona — @ts/ui',
  description: 'Verona template sobre @ts/ui'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
