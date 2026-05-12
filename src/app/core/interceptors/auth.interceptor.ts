import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from '../../features/auth/auth.store';

const AUTH_SKIP_URLS = ['/auth/login', '/auth/force-login', '/auth/change-password'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);

  if (AUTH_SKIP_URLS.some(url => req.url.includes(url))) {
    return next(req);
  }

  const token = authStore.token();
  if (!token) {
    return next(req);
  }

  return next(req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  }));
};
