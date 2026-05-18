import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../../features/auth/auth.store';
import notify from 'devextreme/ui/notify';

export const roleGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (authStore.roles().canUseTeller) {
    return true;
  }

  notify('Non hai i permessi per accedere a questa sezione.', 'warning', 4000);
  router.navigate(['/unauthorized']);
  return false;
};
