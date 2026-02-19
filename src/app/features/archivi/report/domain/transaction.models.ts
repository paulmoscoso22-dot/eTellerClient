/**
 * Request interface for GetTransactionWaitingForBef
 */
export interface GetTransactionWaitingForBefRequest {
  trxCassa: string;
  trxDataDal: Date;
  trxDataAl: Date;
  trxStatus: number;
  trxBraId: string;
}

/**
 * Request interface for WithFiltersForGiornale
 */
export interface GetTransactionWithFiltersForGiornaleRequest {
  trxCassa: string;
  trxDataDal: Date;
  trxDataAl: Date;
  trxStatus: number;
  trxBraId: string;
}

/**
 * Request interface for GetTransactionWithFilters
 */
export interface GetTransactionWithFiltersRequest {
  trxCassa: string;
  trxDataDal: Date;
  trxDataAl: Date;
  trxStatus: number;
  trxBraId: string;
}

/**
 * Response interface for GetTransactionWaitingForBef
 */
export interface GetTransactionWaitingForBefResponse {
  trxAptId: string;
  trxAssegno: string;
  trxBefhost: string;
  trxBefstatus: number;
  trxBraId: string;
  trxCash: boolean;
  trxCassa: string;
  trxCencos: string;
  trxCtoctp: string;
  trxCtoctptip: string;
  trxCtoope: string;
  trxCtoopetp: string;
  trxCtpctv: number;
  trxCutId: string;
  trxDailySequence: string;
  trxDatope: string;
  trxDatval: string;
  trxDivctp: string;
  trxDivope: string;
  trxExcrat: number;
  trxExcratPrt: number;
  trxExrctpbas: number;
  trxExropebas: number;
  trxFinezzaId: number;
  trxFlgEmail: boolean;
  trxFlgForced: boolean;
  trxFlgIs107Customer: boolean;
  trxFlgIs107Overlimit: boolean;
  trxFlgPrinted: boolean;
  trxFlgStampaAvviso: boolean;
  trxFlgStampaIndirizzo: boolean;
  trxFlgStampaSaldo: boolean;
  trxId: number;
  trxImpagio: number;
  trxImpagioctv: number;
  trxImpcom: number;
  trxImpcomctv: number;
  trxImpctp: number;
  trxImpctv: number;
  trxImpiva: number;
  trxImpivactv: number;
  trxImpope: number;
  trxImpresto: number;
  trxImprestoctv: number;
  trxImpspe: number;
  trxImpspectv: number;
  trxIntComment: string;
  trxIvaper: number;
  trxMetnet: number;
  trxMsgSent: string;
  trxNumrel: string;
  trxOnline: boolean;
  trxOptId: string;
  trxPrcmetctp: number;
  trxPrcmetope: number;
  trxReverse: boolean;
  trxRevtrxId: number;
  trxRubrica: string;
  trxSaldo: number;
  trxStatus: number;
  trxText1: string;
  trxText2: string;
  trxText3: string;
  trxText4: string;
  trxUsrId: string;
}

/**
 * Response interface for GetTransactionWithFilters
 */
export interface GetTransactionWithFiltersResponse {
  trxAptId: string;
  trxAssegno: string;
  trxBefhost: string;
  trxBefstatus: number;
  trxBraId: string;
  trxCash: boolean;
  trxCassa: string;
  trxCencos: string;
  trxCtoctp: string;
  trxCtoctptip: string;
  trxCtoope: string;
  trxCtoopetp: string;
  trxCtpctv: number;
  trxCutId: string;
  trxDailySequence: string;
  trxDatope: string;
  trxDatval: string;
  trxDivctp: string;
  trxDivope: string;
  trxExcrat: number;
  trxExcratPrt: number;
  trxExrctpbas: number;
  trxExropebas: number;
  trxFinezzaId: number;
  trxFlgEmail: boolean;
  trxFlgForced: boolean;
  trxFlgIs107Customer: boolean;
  trxFlgIs107Overlimit: boolean;
  trxFlgPrinted: boolean;
  trxFlgStampaAvviso: boolean;
  trxFlgStampaIndirizzo: boolean;
  trxFlgStampaSaldo: boolean;
  trxId: number;
  trxImpagio: number;
  trxImpagioctv: number;
  trxImpcom: number;
  trxImpcomctv: number;
  trxImpctp: number;
  trxImpctv: number;
  trxImpiva: number;
  trxImpivactv: number;
  trxImpope: number;
  trxImpresto: number;
  trxImprestoctv: number;
  trxImpspe: number;
  trxImpspectv: number;
  trxIntComment: string;
  trxIvaper: number;
  trxMetnet: number;
  trxMsgSent: string;
  trxNumrel: string;
  trxOnline: boolean;
  trxOptId: string;
  trxPrcmetctp: number;
  trxPrcmetope: number;
  trxReverse: boolean;
  trxRevtrxId: number;
  trxRubrica: string;
  trxSaldo: number;
  trxStatus: number;
  trxText1: string;
  trxText2: string;
  trxText3: string;
  trxText4: string;
  trxUsrId: string;
}

/**
 * Request interface for WithFiltersForGiornaleAntiriciclaggio
 */
export interface GetTransactionWithFiltersForGiornaleAntiriciclaggioRequest {
  trxCassa: string;
  trxLocalita: string;
  trxDataDal: Date;
  trxDataAl: Date;
  trxReverse: boolean;
  trxCutId: string;
  trxOptId: string;
  trxDivope: string;
  trxImpopeDA: number;
  trxImpopeA: number;
  arcAppName: string;
  arcForced: boolean;
}

/**
 * Response interface for WithFiltersForGiornaleAntiriciclaggio
 */
export interface GetTransactionWithFiltersForGiornaleAntiriciclaggioResponse {
  trxAptId: string;
  trxAssegno: string;
  trxBefhost: string;
  trxBefstatus: number;
  trxBraId: string;
  trxCash: boolean;
  trxCassa: string;
  trxCencos: string;
  trxCtoctp: string;
  trxCtoctptip: string;
  trxCtoope: string;
  trxCtoopetp: string;
  trxCtpctv: number;
  trxCutId: string;
  trxDailySequence: string;
  trxDatope: string;
  trxDatval: string;
  trxDivctp: string;
  trxDivope: string;
  trxExcrat: number;
  trxExcratPrt: number;
  trxExrctpbas: number;
  trxExropebas: number;
  trxFinezzaId: number;
  trxFlgEmail: boolean;
  trxFlgForced: boolean;
  trxFlgIs107Customer: boolean;
  trxFlgIs107Overlimit: boolean;
  trxFlgPrinted: boolean;
  trxFlgStampaAvviso: boolean;
  trxFlgStampaIndirizzo: boolean;
  trxFlgStampaSaldo: boolean;
  trxId: number;
  trxImpagio: number;
  trxImpagioctv: number;
  trxImpcom: number;
  trxImpcomctv: number;
  trxImpctp: number;
  trxImpctv: number;
  trxImpiva: number;
  trxImpivactv: number;
  trxImpope: number;
  trxImpresto: number;
  trxImprestoctv: number;
  trxImpspe: number;
  trxImpspectv: number;
  trxIntComment: string;
  trxIvaper: number;
  trxLocalita?: string;
  trxMetnet: number;
  trxMsgSent: string;
  trxNumrel: string;
  trxOnline: boolean;
  trxOptId: string;
  trxPrcmetctp: number;
  trxPrcmetope: number;
  trxReverse: boolean;
  trxRevtrxId: number;
  trxRubrica: string;
  trxSaldo: number;
  trxStatus: number;
  trxText1: string;
  trxText2: string;
  trxText3: string;
  trxText4: string;
  trxUsrId: string;
  arcAppName?: string;
  arcForced?: boolean;
}

/**
 * Type alias for shorter reference to GetTransactionWithFiltersForGiornaleAntiriciclaggioResponse
 */
export type GiornaleAntiriciclaggioTransaction = GetTransactionWithFiltersForGiornaleAntiriciclaggioResponse;
export type GiornaleAntiriciclaggioRequest = GetTransactionWithFiltersForGiornaleAntiriciclaggioRequest;

/**
 * Response interface for WithFiltersForGiornale
 */
export interface GetTransactionWithFiltersForGiornaleResponse {
  trxAptId: string;
  trxAssegno: string;
  trxBefhost: string;
  trxBefstatus: number;
  trxBraId: string;
  trxCash: boolean;
  trxCassa: string;
  trxCencos: string;
  trxCtoctp: string;
  trxCtoctptip: string;
  trxCtoope: string;
  trxCtoopetp: string;
  trxCtpctv: number;
  trxCutId: string;
  trxDailySequence: string;
  trxDatope: string;
  trxDatval: string;
  trxDivctp: string;
  trxDivope: string;
  trxExcrat: number;
  trxExcratPrt: number;
  trxExrctpbas: number;
  trxExropebas: number;
  trxFinezzaId: number;
  trxFlgEmail: boolean;
  trxFlgForced: boolean;
  trxFlgIs107Customer: boolean;
  trxFlgIs107Overlimit: boolean;
  trxFlgPrinted: boolean;
  trxFlgStampaAvviso: boolean;
  trxFlgStampaIndirizzo: boolean;
  trxFlgStampaSaldo: boolean;
  trxId: number;
  trxImpagio: number;
  trxImpagioctv: number;
  trxImpcom: number;
  trxImpcomctv: number;
  trxImpctp: number;
  trxImpctv: number;
  trxImpiva: number;
  trxImpivactv: number;
  trxImpope: number;
  trxImpresto: number;
  trxImprestoctv: number;
  trxImpspe: number;
  trxImpspectv: number;
  trxIntComment: string;
  trxIvaper: number;
  trxMetnet: number;
  trxMsgSent: string;
  trxNumrel: string;
  trxOnline: boolean;
  trxOptId: string;
  trxPrcmetctp: number;
  trxPrcmetope: number;
  trxReverse: boolean;
  trxRevtrxId: number;
  trxRubrica: string;
  trxSaldo: number;
  trxStatus: number;
  trxText1: string;
  trxText2: string;
  trxText3: string;
  trxText4: string;
  trxUsrId: string;
}
