import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { GetTransactionGiornaleCassaResponse, GetTransactionOperazioniAnnulateResponse, GetTransactionWaitingForBefRequest, GetTransactionWaitingForBefResponse, GetTransactionWithFiltersForGiornaleRequest, GetTransactionWithFiltersForGiornaleResponse, GetTransactionWithFiltersRequest, GetTransactionWithFiltersResponse, ReportUserContext } from '../domain/transaction.models';
import { GetTotaleCassaRequest, GetTotaleCassaResponse } from '../domain/totale-cassa.models';

/**
 * Report Facade - Centralized API for report feature
 */
@Injectable({
  providedIn: 'root',
})
export class ReportFacade {
  private readonly apiUrl = `${environment.apiUrl}/Report`;

  constructor(private http: HttpClient) {}

  private normalizeString(value: string | null | undefined): string | null {
    const normalized = value?.trim();
    return normalized ? normalized : null;
  }

  private normalizeDate(value: Date | string | null | undefined): Date | null {
    return value ? new Date(value) : null;
  }

  private normalizeNumber(value: number | null | undefined): number | null {
    return value ?? null;
  }

  getUserContext(): Observable<ReportUserContext> {
    return this.http.get<ReportUserContext>(`${this.apiUrl}/UserContext`);
  }

  /**
   * Get transactions waiting for BEF processing
   * 
   * @param trxCassa - Transaction cash register identifier
   * @param trxDataDal - Start date for transaction range
   * @param trxDataAl - End date for transaction range
   * @param trxStatus - Status filter for transactions
   * @param trxBraId - Branch identifier
   * @returns Observable of transactions waiting for BEF
   */
  getTransactionWaitingForBef(
    trxCassa: string | null,
    trxDataDal: Date | null,
    trxDataAl: Date | null,
    trxStatus: number | null,
    trxBraId: string | null
  ): Observable<GetTransactionWaitingForBefResponse[]> {
    const payload: GetTransactionWaitingForBefRequest = {
      trxCassa: this.normalizeString(trxCassa),
      trxDataDal: this.normalizeDate(trxDataDal),
      trxDataAl: this.normalizeDate(trxDataAl),
      trxStatus: this.normalizeNumber(trxStatus),
      trxBraId: this.normalizeString(trxBraId)
    };

    return this.http.post<GetTransactionWaitingForBefResponse[]>(
      `${environment.apiUrl}/Report/WaitingForBEF`,
      payload
    );
  }

  /**
   * Get transactions with filters for journal (Giornale di Cassa)
   * 
   * @param trxCassa - Transaction cash register identifier
   * @param trxDataDal - Start date for transaction range
   * @param trxDataAl - End date for transaction range
   * @param trxStatus - Status filter for transactions
   * @param trxBraId - Branch identifier
   * @returns Observable of transactions filtered for journal
   */
  getTransactionWithFiltersForGiornale(
    trxCassa: string | null,
    trxDataDal: Date | null,
    trxDataAl: Date | null,
    trxStatus: number | null,
    trxBraId: string | null
  ): Observable<GetTransactionWithFiltersForGiornaleResponse[]> {
    const payload: GetTransactionWithFiltersForGiornaleRequest = {
      trxCassa: this.normalizeString(trxCassa),
      trxDataDal: this.normalizeDate(trxDataDal),
      trxDataAl: this.normalizeDate(trxDataAl),
      trxStatus: this.normalizeNumber(trxStatus),
      trxBraId: this.normalizeString(trxBraId)
    };

    return this.http.post<GetTransactionWithFiltersForGiornaleResponse[]>(
      `${environment.apiUrl}/Report/WithFiltersForGiornale`,
      payload
    );
  }

  /**
   * Get transactions for Giornale di Cassa
   * 
   * @param trxCassa - Transaction cash register identifier
   * @param trxDataDal - Start date for transaction range
   * @param trxDataAl - End date for transaction range
   * @param trxStatus - Status filter for transactions
   * @param trxBraId - Branch identifier
   * @returns Observable of giornale cassa transactions
   */
  getTransactionGiornaleCassa(
    trxCassa: string | null,
    trxDataDal: Date | null,
    trxDataAl: Date | null,
    trxStatus: number | null,
    trxBraId: string | null
  ): Observable<GetTransactionGiornaleCassaResponse[]> {
    const payload: GetTransactionWithFiltersRequest = {
      trxCassa: this.normalizeString(trxCassa),
      trxDataDal: this.normalizeDate(trxDataDal),
      trxDataAl: this.normalizeDate(trxDataAl),
      trxStatus: this.normalizeNumber(trxStatus),
      trxBraId: this.normalizeString(trxBraId)
    };

    return this.http.post<GetTransactionGiornaleCassaResponse[]>(
      `${environment.apiUrl}/Report/GetSpGiornaleCassa`,
      payload
    );
  }

  /**
   * Get operazioni annullate transactions
   * 
   * @param trxCassa - Transaction cash register identifier
   * @param trxDataDal - Start date for transaction range
   * @param trxDataAl - End date for transaction range
   * @param trxStatus - Status filter for transactions
   * @param trxBraId - Branch identifier
   * @returns Observable of operazioni annullate transactions
   */
  getTransactionOperazioniAnnullate(
    trxCassa: string | null,
    trxDataDal: Date | null,
    trxDataAl: Date | null,
    trxStatus: number | null,
    trxBraId: string | null
  ): Observable<GetTransactionOperazioniAnnulateResponse[]> {
    const payload: GetTransactionWithFiltersRequest = {
      trxCassa: this.normalizeString(trxCassa),
      trxDataDal: this.normalizeDate(trxDataDal),
      trxDataAl: this.normalizeDate(trxDataAl),
      trxStatus: this.normalizeNumber(trxStatus),
      trxBraId: this.normalizeString(trxBraId)
    };

    return this.http.post<GetTransactionOperazioniAnnulateResponse[]>(
      `${environment.apiUrl}/Report/GetSpOperazioniAnnullate`,
      payload
    );
  }

  /**
   * Get transactions with filters
   * 
   * @param trxCassa - Transaction cash register identifier
   * @param trxDataDal - Start date for transaction range
   * @param trxDataAl - End date for transaction range
   * @param trxStatus - Status filter for transactions
   * @param trxBraId - Branch identifier
   * @returns Observable of transactions with filters applied
   */
  getTransactionWithFilters(
    trxCassa: string | null,
    trxDataDal: Date | null,
    trxDataAl: Date | null,
    trxStatus: number | null,
    trxBraId: string | null
  ): Observable<GetTransactionWithFiltersResponse[]> {
    const payload: GetTransactionWithFiltersRequest = {
      trxCassa: this.normalizeString(trxCassa),
      trxDataDal: this.normalizeDate(trxDataDal),
      trxDataAl: this.normalizeDate(trxDataAl),
      trxStatus: this.normalizeNumber(trxStatus),
      trxBraId: this.normalizeString(trxBraId)
    };

    return this.http.post<GetTransactionWithFiltersResponse[]>(
      `${environment.apiUrl}/Report/WithFilters`,
      payload
    );
  }

  /**
    * Get totali cassa with filters
    * 
    * @param tocCliId - Cassa ID (nullable — if null, no filter applied)
    * @param tocData - Data (nullable — if null, no filter applied)
    * @param tocCutId - Currency Type ID (nullable — if null, no filter applied)
    * @param tocBraId - Branch ID (nullable — if null, no filter applied)
    * @returns Observable of totale cassa data
    */
  getTotaliCassa(
    tocCliId: string | null | undefined,
    tocData: Date | null | undefined,
    tocCutId: string | null | undefined,
    tocBraId: string | null | undefined
  ): Observable<GetTotaleCassaResponse[]> {
    let formattedDate: string | null = null;
    if (tocData instanceof Date) {
      const year  = tocData.getFullYear();
      const month = String(tocData.getMonth() + 1).padStart(2, '0');
      const day   = String(tocData.getDate()).padStart(2, '0');
      formattedDate = `${year}-${month}-${day}`;
    } else if (tocData) {
      formattedDate = tocData as string;
    }

    const payload: GetTotaleCassaRequest = {
      tocCliId: this.normalizeString(tocCliId),
      tocData:  formattedDate as any,
      tocCutId: this.normalizeString(tocCutId),
      tocBraId: this.normalizeString(tocBraId)
    };

    return this.http.post<GetTotaleCassaResponse[]>(
      `${environment.apiUrl}/Report/GetTotaliCassa`,
      payload
    );
  }

  isHostOnline(): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/IsHostOnline`);
  }

  syncBalanceFromHost(): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/SyncBalanceFromHost`, {}
    );
  }
}
