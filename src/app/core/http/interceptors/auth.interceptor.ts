import {
  HttpErrorResponse,
  HttpEvent,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthFacade } from '../../../features/auth/application/auth.facade';

/**
 * Interceptor:
 * - Agrega Authorization: Bearer <accessToken> si existe sesión
 * - Si backend responde 401: intenta refresh (1 en vuelo) y reintenta 1 vez
 * - Si refresh falla: logout
 */
export const authInterceptor: HttpInterceptorFn = (req, next): Observable<HttpEvent<unknown>> => {
  const auth = inject(AuthFacade);

  // 1) Agregar token (si hay)
  const token = auth.accessToken();
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: unknown) => {
      // Solo 401
      if (!(err instanceof HttpErrorResponse) || err.status !== 401) {
        return throwError(() => err);
      }

      // Evitar refresh en rutas de auth para no entrar en loop
      const isAuthCall = /\/auth\/(login|refresh)$/i.test(req.url);
      if (isAuthCall) {
        auth.logout(); // limpieza de sesión local
        return throwError(() => err);
      }

      // 2) Refresh + retry 1 vez
      return auth.refreshTokens$().pipe(
        switchMap((tokens) => {
          const retryReq: HttpRequest<unknown> = req.clone({
            setHeaders: { Authorization: `Bearer ${tokens.accessToken}` },
          });
          return next(retryReq);
        }),
        catchError((refreshErr) => {
          // 3) Refresh falló => logout
          auth.logout();
          return throwError(() => err);
        })
      );
    })
  );
};
