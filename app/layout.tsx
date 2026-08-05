'use client';

import '@/app/globals.css';
import Nav from '@/components/nav';
import Footer from './footer';

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='es'>
      <body>
        <div className='av-bg' />
        <div className='av-noise' />
        <div id='root'>
          <Nav />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
