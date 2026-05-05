export interface IDivisaAnagrafica {
  curId: string;
  curCutId: string;
  curShodes: string;
  curLondes: string;
  curMinamn: number;
  curTolrat: number;
  curFinezza: string;
  curModdat: string | null;
}

export interface UpdateDivisaRequest {
  curId: string;
  curCutId: string;
  curMinamn: number;
  curFinezza: string;
  curTolrat: number;
  traUser: string;
  traStation: string;
}

export interface ICurrencyCouple {
  cucCur1: string;
  cucCur2: string;
  cucLondes: string | null;
  cucShodes: string | null;
  cucSize: number | null;
  cucExcdir: string | null;
}

export interface ICurrencyDv {
  curId: string;
  curCutId: string;
  curShodes: string;
  curLondes: string;
}

export interface InsertCurrencyCoupleRequest {
  cucCur1: string;
  cucCur2: string;
  cucLondes: string | null;
  cucShodes: string | null;
  cucSize: number | null;
  cucExcdir: string | null;
  traUser: string;
  traStation: string;
}

export interface UpdateCurrencyCoupleRequest {
  cucCur1: string;
  cucCur2: string;
  cucLondes: string | null;
  cucShodes: string | null;
  cucSize: number | null;
  cucExcdir: string | null;
  traUser: string;
  traStation: string;
}

export interface ICorso {
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

export interface CorsiRequest {
  curId: string | null;
  curLondes: string | null;
  curCutId: string | null;
  dateFrom: string | null;
  dateTo: string | null;
}
