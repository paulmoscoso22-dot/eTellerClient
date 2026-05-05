export interface IDivisaAnagraficaResponse {
  curId: string;
  curCutId: string;
  curLondes: string;
  curShodes: string;
  curMinamn: number;
  curHostcod: string | null;
  curTolrat: number;
  curFinezza: string;
  curModdat: string | null;
}

export interface IDivisaAnagraficaRequest {
  curId: string | null;
  curLondes: string | null;
}

// Compatibility alias used across components
export type IDivisaAnagrafica = IDivisaAnagraficaResponse;
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

export interface IInsertCurrencyCoupleRequest {
  cucCur1: string;
  cucCur2: string;
  cucLondes: string | null;
  cucShodes: string | null;
  cucSize: number | null;
  cucExcdir: string | null;
  traUser: string;
  traStation: string;
}

export interface IUpdateCurrencyCoupleRequest {
  cucCur1: string;
  cucCur2: string;
  cucLondes: string | null;
  cucShodes: string | null;
  cucSize: number | null;
  cucExcdir: string | null;
  traUser: string;
  traStation: string;
}


