import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { isDevMode } from '@angular/core';
import { tap } from 'rxjs/operators';

export const logInterceptor: HttpInterceptorFn = (req, next) => {
  if (!isDevMode()) {
    return next(req);
  }

  const start = Date.now();
  // SICUREZZA: logga solo URL e metodo — MAI il body (potrebbe contenere password)
  console.debug(`[HTTP] ${req.method} ${req.url}`);

  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse) {
        console.debug(`[HTTP] ${req.method} ${req.url} → ${event.status} (${Date.now() - start}ms)`);
      }
    })
  );
};
