/**
 * Request interface for RicercaOperazioni (Operations Search)
 */
export interface RicercaOperazioniRequest {
  trxCassa: string | null;
  trxLocalita: string | null;
  trxDataDal: Date | null;
  trxDataAl: Date | null;
  trxReverse: boolean | null;
  trxCutId: string | null;
  trxOptId: string | null;
  trxDivope: string | null;
  trxImpopeDA: number | null;
  trxImpopeA: number | null;
  arcAppName: string | null;
  arcForced: boolean | null;
}

/**
 * Response interface for RicercaOperazioni (Operations Search)
 */
export interface RicercaOperazioniResponse {
  trxId: number;
  trxAptId?: string;
  trxDate: string | Date;
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
  trxStatus: string | number;
  staDes: string;
}

export interface RicercaOperazioniFiltersState {
  trxCassa: string;
  trxLocalita: string;
  trxDataDal: string | null;
  trxDataAl: string | null;
  trxReverse: boolean;
  trxCutId: string;
  trxOptId: string;
  trxDivope: string;
  trxImpopeDA: number | null;
  trxImpopeA: number | null;
  arcAppName: string;
  arcForced: boolean;
  pageSize: number;
}
