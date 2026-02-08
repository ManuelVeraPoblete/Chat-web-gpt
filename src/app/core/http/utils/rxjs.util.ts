import { MonoTypeOperatorFunction, timer } from 'rxjs';
import { retry } from 'rxjs/operators';

/**
 * Retry con backoff exponencial simple.
 * Úsalo SOLO donde tenga sentido (ej: cargas no críticas), no en writes.
 */
export function retryBackoff<T>(maxRetries: number, initialMs = 250): MonoTypeOperatorFunction<T> {
  return retry({
    count: maxRetries,
    delay: (error, retryCount) => {
      const wait = initialMs * Math.pow(2, retryCount - 1);
      return timer(wait);
    },
  });
}
