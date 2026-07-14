'use client';

import { Suspense } from 'react';
import ReproductorContent from './ReproductorContent';

export default function ReproductorPage() {
  return (
    <Suspense fallback={<div className="loading">Cargando...</div>}>
      <ReproductorContent />
    </Suspense>
  );
}