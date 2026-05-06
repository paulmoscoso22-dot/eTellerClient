export interface IBookingRcGetAllRequest {
  brcCutId: string;
  brcOptId: string;
  brcActId: string;
}

export interface IBookingRcItemResponse {
  brcCutId: string;
  brcOptId: string;
  brcActId: string;
  brcCodcau: string;
  brcCodcausto: string;
  brcText1: string | null;
  brcText2: string | null;
}

export interface IBookingRcUpsertRequest {
  brcCutId: string;
  brcOptId: string;
  brcActId: string;
  brcCodcau: string;
  brcCodcausto: string;
  brcText1: string | null;
  brcText2: string | null;
  traUser: string;
  traStation: string;
}

export interface IAccountTypeResponse {
  actId: string;
  actDes: string | null;
}
