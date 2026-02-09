import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';


import { provideRouter, Routes } from '@angular/router';
import { Login } from './app/login/login/login';
import { importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // default redirect a login
  { path: 'login', component: Login },
  // { path: 'dashboard', component: DashboardComponent },
  { path: '**', redirectTo: 'login' } // fallback rotte sconosciute
];


// bootstrapApplication(Login, {
//   providers: [
//     //importProvidersFrom(BrowserAnimationsModule),
//     provideRouter(routes)
//   ]
// }).catch(err => console.error(err));


bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
