'use client';

import { useEffect, useState } from 'react';

function relativeTime(at: number): string {
  const diff = Date.now() - at;
  if (diff < 60_000) return 'hace instantes';
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) {
    return `hace ${hours} h`;
  }
  const days = Math.floor(hours / 24);
  return `hace ${days} d`;
}

export default function TimeAgo({ at }: { at: number }) {
  const [label, setLabel] = useState('');

  useEffect(() => {
    const update = () => setLabel(relativeTime(at));
    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, [at]);

  return <span>{label}</span>;
}
