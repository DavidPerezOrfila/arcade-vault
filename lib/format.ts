// Helpers de formato compartidos por leaderboards y listas de jugadores.
// Locale 'es-ES' forzado para mantener la app coherente con el resto de la UI.

const SCORE_LOCALE = 'es-ES';

export function formatDate(at: number): string {
  const d = new Date(at);
  const day = String(d.getDate()).padStart(2, '0');
  const mon = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${mon}/${d.getFullYear()}`;
}

export function formatScore(n: number): string {
  return n.toLocaleString(SCORE_LOCALE);
}

export function topRankClass(i: number): string {
  return ['top1', 'top2', 'top3'][i] ?? '';
}
