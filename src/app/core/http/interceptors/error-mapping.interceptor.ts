import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { ApiError } from '../models/api-error';
import { catchError, throwError } from 'rxjs';

/**
 * Normaliza errores para que la capa application/presentation
 * no dependa de HttpErrorResponse (infra).
 */
export const errorMappingInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse) {
        const message =
          (err.error as any)?.message ||
          (err.error as any)?.error ||
          err.message ||
          `HTTP ${err.status}`;

        return throwError(() => new ApiError(message, err.status, err.error));
      }
      return throwError(() => err);
    })
  );
};
