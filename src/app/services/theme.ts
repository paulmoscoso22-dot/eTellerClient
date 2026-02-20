import { effect, Injectable, signal } from '@angular/core';
type ThemeId = 
  | 'fluent-light-blue' 
  | 'fluent-light-saas' 
  | 'fluent-dark-blue' 
  | 'fluent-dark-saas';

@Injectable({
  providedIn: 'root',
})
export class Theme {
 private readonly STORAGE_KEY = 'fido_theme';
  
  /** Signal reattivo per il tema corrente */
  private readonly _currentTheme = signal<ThemeId>('fluent-light-blue');
  
  /** Signal pubblico read-only */
  readonly currentTheme = this._currentTheme.asReadonly();

  constructor() {
    // Carica tema salvato
    const savedTheme = localStorage.getItem(this.STORAGE_KEY) as ThemeId;
    if (savedTheme) {
      this._currentTheme.set(savedTheme);
    }

    // Effetto per applicare il tema quando cambia
    effect(() => {
      const theme = this._currentTheme();
      this.loadThemeStylesheet(theme);
    });
  }

  /**
   * Inizializza il servizio (chiamato all'avvio app)
   */
  async initialize(): Promise<void> {
    // Il tema viene già caricato nel constructor
    console.log('[ThemeService] Initialized with theme:', this._currentTheme());
  }

  /**
   * Ottiene il tema corrente
   */
  getCurrentTheme(): ThemeId {
    return this._currentTheme();
  }

  /**
   * Applica un nuovo tema
   */
  async applyTheme(themeId: string): Promise<void> {
    const validTheme = themeId as ThemeId;
    
    // Salva preferenza
    localStorage.setItem(this.STORAGE_KEY, validTheme);
    
    // Aggiorna signal (trigger automatico dell'effect)
    this._currentTheme.set(validTheme);
  }

  /**
   * Verifica se il tema corrente è scuro
   */
  isDarkTheme(): boolean {
    return this._currentTheme().includes('dark');
  }

  /**
   * Carica dinamicamente il foglio di stile del tema DevExtreme
   */
  private loadThemeStylesheet(themeId: ThemeId): void {
    // Rimuovi eventuali fogli di stile DevExtreme esistenti
    const existingLinks = document.querySelectorAll('link[data-devextreme-theme]');
    existingLinks.forEach(link => link.remove());

    // Mappa tema → file CSS DevExtreme (copiati in assets da angular.json)
    const themeMap: Record<ThemeId, string> = {
      'fluent-light-blue': '/assets/dx.fluent.blue.light.css',
      'fluent-light-saas': '/assets/dx.fluent.saas.light.css',
      'fluent-dark-blue': '/assets/dx.fluent.blue.dark.css',
      'fluent-dark-saas': '/assets/dx.fluent.saas.dark.css'
    };

    const cssPath = themeMap[themeId];

    // Crea e inserisci nuovo link
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssPath;
    link.setAttribute('data-devextreme-theme', themeId);
    
    document.head.appendChild(link);

    console.log('[ThemeService] Applied theme:', themeId);
  }
  
}
