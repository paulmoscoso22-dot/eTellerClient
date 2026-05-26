/**
 * Totale Cassa Request Model
 * All fields are nullable — if null, no filter is applied on that field
 */
export interface GetTotaleCassaRequest {
  tocCliId: string | null;      // Cassa ID (nullable)
  tocData: string | null;       // Data (YYYY-MM-DD format in local timezone, nullable)
  tocCutId: string | null;      // Currency Type ID (nullable)
  tocBraId: string | null;      // Branch ID (nullable)
}

/**
 * Totale Cassa Response Model
 */
export interface GetTotaleCassaResponse {
  tocCurId: string;           // Unità - Valuta / tipo metallo
  tocSaldoIni: number | null; // Saldo iniziale - Saldo a inizio giornata
  tocTotdare: number | null;  // Dare - Totale movimenti in Dare
  tocTotdareCtv: number | null; // Dare CTV - Totale Dare convertito in CHF
  tocTotavere: number | null; // Avere - Totale movimenti in Avere
  tocSaldoFin: number | null; // Saldo finale - Saldo a fine giornata
}

/**
 * Filter Form Data for Totale Cassa search
 */
export interface TotaleCassaFilterForm {
  tocCliId: string;      // Cassa ID (required)
  tocData: Date | null;  // Data (required)
  tocLocalita: string;   // Localita (required)
  tocTipo: string;       // Tipo (required)
}
