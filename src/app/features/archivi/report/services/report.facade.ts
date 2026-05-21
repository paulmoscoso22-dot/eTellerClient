import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { GetTransactionGiornaleCassaResponse, GetTransactionOperazioniAnnulateResponse, GetTransactionWaitingForBefRequest, GetTransactionWaitingForBefResponse, GetTransactionWithFiltersForGiornaleRequest, GetTransactionWithFiltersForGiornaleResponse, GetTransactionWithFiltersRequest, GetTransactionWithFiltersResponse } from '../domain/transaction.models';
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
   * @param tocCliId - Cassa ID
   * @param tocData - Data
   * @param tocCutId - Currency Type ID
   * @param tocBraId - Branch ID
   * @returns Observable of totale cassa data
   */
  getTotaliCassa(
    tocCliId: string,
    tocData: Date,
    tocCutId: string,
    tocBraId: string
  ): Observable<GetTotaleCassaResponse[]> {
    // Format date as YYYY-MM-DD using local date values (avoiding timezone conversion)
    let formattedDate: string;
    if (tocData instanceof Date) {
      const year = tocData.getFullYear();
      const month = String(tocData.getMonth() + 1).padStart(2, '0');
      const day = String(tocData.getDate()).padStart(2, '0');
      formattedDate = `${year}-${month}-${day}`;
    } else {
      formattedDate = tocData as string;
    }

    const payload: GetTotaleCassaRequest = {
      tocCliId,
      tocData: formattedDate as any, // Send as formatted strinEg, not Date
      tocCutId,
      tocBraId
    };

    return this.http.post<GetTotaleCassaResponse[]>(
      `${environment.apiUrl}/Report/GetTotaliCassa`,
      payload
    );
  }
}
