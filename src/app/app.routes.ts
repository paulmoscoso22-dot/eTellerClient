import { Routes } from '@angular/router';
import { AUTH_ROUTES } from './features/auth/auth.routes';
//import { DASHBOARD_ROUTES } from './features/dashboard/dashboard.routes';
import { App, } from './app';

export const routes: Routes = [
  {
    path: 'auth',
    children: AUTH_ROUTES[0].children,
  },
  {
    path: 'app',
    component: App,
  },
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
];

