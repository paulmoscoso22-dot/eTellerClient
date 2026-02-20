import { Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { ConfigService } from './config.service';

export interface EnvironmentInfo {
  production: boolean;
  apiUrl: string;
}

@Injectable({
  providedIn: 'root',
})
export class EnvironmentService {
  /** Signal reattivo per l'ambiente corrente */
   constructor(private configService: ConfigService) {}

  /** Nome dell'ambiente corrente (developing, develop, release, hotfix, feature, preprod, production) */
  get envName(): string {
    return this.configService.config.envName;
  }

  /** Indica se siamo in ambiente di produzione */
  get isProduction(): boolean {
    return this.configService.config.production;
  }

  /** URL base della WebAPI */
  get apiUrl(): string {
    return this.configService.config.apiUrl;
  }

  /** Configurazione autenticazione */
  get auth() {
    return this.configService.config.auth;
  }

  /**
   * Costruisce l'URL completo per un endpoint API
   * @param endpoint - Il path dell'endpoint (es: 'utenti', 'anagrafica/relazioni')
   * @returns URL completo (es: 'https://fidowebapi.develop.bancasempione.ch/utenti')
   */
  buildApiUrl(endpoint: string): string {
    // Rimuove slash iniziale se presente
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${this.apiUrl}/${cleanEndpoint}`;
  }
}
