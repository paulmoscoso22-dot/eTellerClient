import { Injectable, signal } from '@angular/core';

export interface AppConfig {
  /** Indica se siamo in ambiente di produzione */
  production: boolean;
  /** Nome dell'ambiente (developing, develop, release, hotfix, feature, preprod, production) */
  envName: string;
  /** URL base della WebAPI */
  apiUrl: string;
  /** Configurazione autenticazione */
  auth: {
    authServerUrl: string;
    clientId: string;
    audience: string;
  };
}



@Injectable({
  providedIn: 'root',
})
export class ConfigService {
   private static _staticConfig: AppConfig | null = null;

  /**
   * Imposta la configurazione caricata da main.ts.
   * Questo metodo viene chiamato PRIMA del bootstrap di Angular.
   */
  static setConfig(config: AppConfig): void {
    ConfigService._staticConfig = config;
    console.log(`[ConfigService] Configuration set for environment: ${config.envName}`);
  }

  /**
   * Ritorna la configurazione caricata.
   * 
   * @throws Error se la configurazione non è ancora stata caricata
   */
  get config(): AppConfig {
    if (!ConfigService._staticConfig) {
      throw new Error('Configuration not loaded. Ensure config is loaded in main.ts before bootstrap.');
    }
    return ConfigService._staticConfig;
  }

  /**
   * Indica se la configurazione è stata caricata.
   */
  get isLoaded(): boolean {
    return ConfigService._staticConfig !== null;
  }
}
