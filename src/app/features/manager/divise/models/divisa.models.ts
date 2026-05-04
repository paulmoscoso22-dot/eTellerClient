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
