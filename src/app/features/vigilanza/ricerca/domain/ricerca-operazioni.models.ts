/**
 * Request interface for RicercaOperazioni (Operations Search)
 */
export interface RicercaOperazioniRequest {
  trxCassa: string;
  trxLocalita: string;
  trxDataDal: Date | null;
  trxDataAl: Date | null;
  trxReverse: boolean | null;
  trxCutId: string;
  trxOptId: string;
  trxDivope: string;
  trxImpopeDA: number | null;
  trxImpopeA: number | null;
  arcAppName: string;
  arcForced: boolean | null;
}

/**
 * Response interface for RicercaOperazioni (Operations Search)
 */
export interface RicercaOperazioniResponse {
  trxId: number;
  trxDate: string;
  cutDes: string;
  trxCutId: string;
  optDes: string;
  trxOptId: string;
  trxReport: string;
  trxNum: string;
  trxCurId: string;
  trxAmount: number;
  trxRate: number;
  appearerName: string;
  beneficiaryName: string;
  trxStatus: string;
  staDes: string;
}
