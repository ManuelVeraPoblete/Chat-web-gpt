/**
 * Utilidades JWT (sin validar firma, solo decode de payload).
 * Importante: el frontend NO debe confiar en esto para seguridad real,
 * solo para UX (mostrar/ocultar opciones).
 */
export type JwtPayload = {
  sub?: string;
  exp?: number;
  roles?: string[];
  [k: string]: unknown;
};

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;

    const payload = parts[1];
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(normalized);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function isJwtExpired(token: string, skewSeconds = 10): boolean {
  const payload = decodeJwt(token);
  const exp = payload?.exp;
  if (!exp) return false;

  const nowSeconds = Math.floor(Date.now() / 1000);
  return nowSeconds >= exp - skewSeconds;
}
