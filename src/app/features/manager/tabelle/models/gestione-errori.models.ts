export interface IGestioneErroriItemResponse {
  errId: string;
  errTyp: string | null;
  errCanFlag: boolean;
  errConFlag: boolean;
  errForFlag: boolean;
  errFocId: string | null;
  errDesSol: string | null;
  errDescIt: string;
  errDescEn: string | null;
  errDescFr: string | null;
  errDescDe: string | null;
}

export interface IGestioneErroriGetRequest {
  errId?: string | null;
  testoLike?: string | null;
}

export interface IGestioneErroriUpsertRequest {
  errId: string;
  errTyp: string | null;
  errCanFlag: boolean;
  errConFlag: boolean;
  errForFlag: boolean;
  errFocId: string | null;
  errDesSol: string | null;
  errDescIt: string;
  errDescEn: string | null;
  errDescFr: string | null;
  errDescDe: string | null;
}

export interface IForceCodeResponse {
  focId: string;
  focDes: string | null;
}
