export interface GetTotaleCassaRequest {
  tocCliId: string | null;
  tocData: string | null;
  tocCutId: string | null;
  tocBraId: string | null;
}

export interface GetTotaleCassaResponse {
  tocCutId: string | null;
  tocCurId: string;
  tocTime: string | null;
  tocSaldoIni: number | null;
  tocSaldoIniCtv: number;
  tocTotdare: number | null;
  tocTotdareCtv: number | null;
  tocTotavere: number | null;
  tocTotavereCtv: number | null;
  tocSaldoFin: number | null;
  tocSaldoFinCtv: number | null;
  saldoErrato: boolean;
  hasOfflineOps: boolean;
}
