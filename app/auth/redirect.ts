// Acepta solo rutas internas: empieza por '/', no '//' y sin ':' (bloquea
// cualquier esquema tipo http:/https:). Cualquier otra entrada cae a la home.
export function sanitizeRedirect(
  raw: string | null | undefined,
  fallback = '/'
): string {
  if (
    raw &&
    raw.startsWith('/') &&
    !raw.startsWith('//') &&
    !raw.includes(':')
  ) {
    return raw;
  }
  return fallback;
}
