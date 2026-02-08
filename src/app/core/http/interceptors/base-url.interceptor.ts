import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { API_CONFIG } from '../../config/api-config.token';

/**
 * Prefija automáticamente la base URL a requests relativos ("/users", "/auth/login", etc.).
 * - Si la URL ya es absoluta (http/https) la deja igual.
 */
export const baseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  const { apiBaseUrl } = inject(API_CONFIG);

  // Si ya es absoluta, no tocar
  if (/^https?:\/\//i.test(req.url)) {
    return next(req);
  }

  // Normalizamos (sin doble slash)
  const base = apiBaseUrl.replace(/\/$/, '');
  const path = req.url.startsWith('/') ? req.url : `/${req.url}`;
  const withBase = `${base}${path}`;

  const cloned = req.clone({ url: withBase });
  return next(cloned);
};
