import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthFacade } from '../../features/auth/auth.facade';

/**
 * Route guard to protect authenticated routes
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authFacade = inject(AuthFacade);
  const router = inject(Router);

  if (authFacade.isAuthenticated()) {
    return true;
  }

  router.navigate(['/auth/login']);
  return false;
};
