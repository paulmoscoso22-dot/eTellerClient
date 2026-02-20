/**
 * Modelli per la gestione delle versioni software
 */

/** Informazioni sulla versione corrente */
export interface VersionInfo {
  /** Numero versione (es: "1.2.3") */
  version: string;
  /** Nome dell'ambiente (developing, testing, acceptance, production) */
  environment: string;
  /** Data di rilascio */
  releaseDate?: string;
  /** Note brevi sulla versione */
  description?: string;
}

/** Singola voce nel changelog */
export interface ChangelogEntry {
  /** Numero versione */
  version: string;
  /** Data di rilascio */
  date: string;
  /** Lista delle modifiche */
  changes: string[];
}

/** Tipo di modifica per visualizzazione con icone (futuro) */
export type ChangeType = 'feature' | 'bugfix' | 'improvement' | 'breaking';
