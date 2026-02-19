import { Routes } from '@angular/router';
import { AUTH_ROUTES } from './features/auth/auth.routes';
import { DASHBOARD_ROUTES } from './features/dashboard/dashboard.routes';

export const routes: Routes = [
  {
    path: 'auth',
    children: AUTH_ROUTES[0].children,
  },
  {
    path: 'dashboard',
    children: DASHBOARD_ROUTES,
  },
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
];

