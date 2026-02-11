import { HttpErrorResponse, HttpEvent, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthFacade } from '../../../features/auth/application/auth.facade';
import { SessionStateService } from '../../state/session-state.service';
import { ApiError } from '../models/api-error';

/**
 * ✅ authUnauthorizedInterceptor
 * Si después del authInterceptor todavía llega un 401:
 * - limpia sesión
 * - limpia estado del front
 * - redirige a /login
 */
export const authUnauthorizedInterceptor: HttpInterceptorFn = (req, next): Observable<HttpEvent<unknown>> => {
  const router = inject(Router);
  const auth = inject(AuthFacade);
  const sessionState = inject(SessionStateService);

  return next(req).pipe(
    catchError((err: unknown) => {
      const status =
        err instanceof HttpErrorResponse ? err.status :
        err instanceof ApiError ? err.status :
        null;

      if (status !== 401) {
        return throwError(() => err);
      }

      const currentUrl = router.url ?? '';
      const isLogin = currentUrl.includes('/login');

      auth.logout();
      sessionState.clearAll();

      if (!isLogin) {
        router.navigateByUrl('/login');
      }

      return throwError(() => err);
    }),
  );
};
