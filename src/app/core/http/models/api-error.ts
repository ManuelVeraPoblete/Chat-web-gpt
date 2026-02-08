/**
 * Error normalizado que usarán facades/components (en vez de HttpErrorResponse crudo).
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown
  ) {
    super(message);
  }
}
