import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { provideRouter, Routes } from '@angular/router';
import { ConfigService } from './app/services/config.service';
import { environment } from './environments/environment';

const routes: Routes = [

];

// Load configuration before bootstrapping
ConfigService.setConfig({
  production: environment.production,
  envName: environment.production ? 'production' : 'developing',
  apiUrl: environment.apiUrl,
  auth: {
    authServerUrl: '',
    clientId: '',
    audience: ''
  }
});

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
