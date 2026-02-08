import { CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthFacade } from '../../../features/auth/application/auth.facade';

/**
 * Guard por rol simple (UX).
 * La seguridad real está en backend (JWT/ACL).
 */
export function roleGuard(requiredRoles: string[]): CanMatchFn {
  return () => {
    const auth = inject(AuthFacade);
    const router = inject(Router);

    const roles = auth.roles();
    const ok = requiredRoles.some((r) => roles.includes(r));
    if (ok) return true;

    router.navigateByUrl('/home');
    return false;
  };
}
