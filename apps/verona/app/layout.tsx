import type { ReactNode } from 'react';
import localFont from 'next/font/local';
import '../styles/globals.css';
import '../styles/layout/layout.scss';
import { LayoutProvider } from '../layout/context/layout-context';

const lato = localFont({
  src: [
    { path: '../public/fonts/lato-v17-latin-ext_latin-regular.woff2', weight: '400', style: 'normal' },
    { path: '../public/fonts/lato-v17-latin-ext_latin-700.woff2', weight: '700', style: 'normal' },
    { path: '../public/fonts/lato-v17-latin-ext_latin-300.woff2', weight: '300', style: 'normal' }
  ],
  variable: '--font-lato',
  display: 'swap'
});

export const metadata = {
  title: 'Verona — @lindaui/ui',
  description: 'Verona template sobre @lindaui/ui'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={lato.variable}>
      <body>
        <LayoutProvider>{children}</LayoutProvider>
      </body>
    </html>
  );
}
