export interface IForceTrxGetAllRequest {
  lanCode: string;
}

export interface IForceTrxGetByIdRequest {
  lanCode: string;
  trfId: number;
}

export interface IForceTrxItemResponse {
  trfId: number;
  trfTrxId: number;
  trfFortyp: string;
  trfFortxt: string | null;
  trxDatope: string | null;
  trxDatval: string | null;
  errDesc: string | null;
}
