import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthStore } from '../../features/auth/auth.store';
import notify from 'devextreme/ui/notify';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authStore.reset();
        router.navigate(['/auth/login']);
      } else if (error.status === 403) {
        notify('Non hai i permessi per eseguire questa operazione.', 'warning', 4000);
      } else if (error.status >= 500) {
        notify('Errore del server. Riprovare più tardi.', 'error', 5000);
      } else if (error.status === 0) {
        notify('Impossibile raggiungere il server.', 'error', 5000);
      }

      return throwError(() => error);
    })
  );
};
