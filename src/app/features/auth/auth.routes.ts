import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login.component';

/**
 * Auth feature routes
 */
export const AUTH_ROUTES: Routes = [
  {
    path: '',
    children: [
      { path: 'login', component: LoginComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
];
