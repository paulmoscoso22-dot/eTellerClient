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
