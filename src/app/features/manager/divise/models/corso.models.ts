export interface ICorsoResponse {
  cprCurId1: string;
  cprCurId2: string;
  cprCutId: string;
  cprValdat: string;
  cprRateBuy: number | null;
  cprRateSell: number | null;
  cprDatreg: string | null;
  curLondes: string | null;
  curShodes: string | null;
  curHostcod: string | null;
  curModdat: string | null;
}

export interface ICorsiRequest {
  curId: string | null;
  curLondes: string | null;
  curCutId: string | null;
  dateFrom: string | null;
  dateTo: string | null;
}
