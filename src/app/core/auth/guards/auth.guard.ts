import { CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthFacade } from '../../../features/auth/application/auth.facade';

/**
 * Bloquea rutas si no hay sesión.
 * Usamos CanMatch para proteger lazy routes.
 */
export const authGuard: CanMatchFn = () => {
  const auth = inject(AuthFacade);
  const router = inject(Router);

  if (auth.isAuthenticated()) return true;

  router.navigateByUrl('/login');
  return false;
};
