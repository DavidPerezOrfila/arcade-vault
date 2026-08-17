'use client';

import '@/app/globals.css';
import Nav from '@/components/nav';
import Footer from './footer';
import { SkinProvider } from '@/components/skin/SkinProvider';
import { DEFAULT_SKIN, SKIN_IDS, SKIN_STORAGE_KEY } from '@/lib/games/skins';

// Se ejecuta antes del primer paint: aplica el skin guardado a <html> para
// evitar FOUC. Valor inválido cae a clasico.
const SKIN_BOOTSTRAP = `(function(){try{var s=localStorage.getItem('${SKIN_STORAGE_KEY}');var v=[${SKIN_IDS.map((id) => `'${id}'`).join(',')}];document.documentElement.dataset.skin=v.indexOf(s)>=0?s:'${DEFAULT_SKIN}';}catch(e){document.documentElement.dataset.skin='${DEFAULT_SKIN}';}})();`;

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='es' suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: SKIN_BOOTSTRAP }} />
        <SkinProvider>
          <div className='av-bg' />
          <div className='av-noise' />
          <div id='root'>
            <Nav />
            {children}
            <Footer />
          </div>
        </SkinProvider>
      </body>
    </html>
  );
}
