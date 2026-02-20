import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { GetTransactionWaitingForBefRequest, GetTransactionWaitingForBefResponse, GetTransactionWithFiltersForGiornaleRequest, GetTransactionWithFiltersForGiornaleResponse, GetTransactionWithFiltersRequest, GetTransactionWithFiltersResponse } from '../domain/transaction.models';
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
    trxCassa: string,
    trxDataDal: Date,
    trxDataAl: Date,
    trxStatus: number,
    trxBraId: string
  ): Observable<GetTransactionWaitingForBefResponse[]> {
    const payload: GetTransactionWaitingForBefRequest = {
      trxCassa,
      trxDataDal,
      trxDataAl,
      trxStatus,
      trxBraId
    };

    return this.http.post<GetTransactionWaitingForBefResponse[]>(
      `${environment.apiUrl}/Transaction/WaitingForBEF`,
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
    trxCassa: string,
    trxDataDal: Date,
    trxDataAl: Date,
    trxStatus: number,
    trxBraId: string
  ): Observable<GetTransactionWithFiltersForGiornaleResponse[]> {
    const payload: GetTransactionWithFiltersForGiornaleRequest = {
      trxCassa,
      trxDataDal,
      trxDataAl,
      trxStatus,
      trxBraId
    };

    return this.http.post<GetTransactionWithFiltersForGiornaleResponse[]>(
      `${environment.apiUrl}/Transaction/WithFiltersForGiornale`,
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
    trxCassa: string,
    trxDataDal: Date,
    trxDataAl: Date,
    trxStatus: number,
    trxBraId: string
  ): Observable<GetTransactionWithFiltersResponse[]> {
    const payload: GetTransactionWithFiltersRequest = {
      trxCassa,
      trxDataDal,
      trxDataAl,
      trxStatus,
      trxBraId
    };

    return this.http.post<GetTransactionWithFiltersResponse[]>(
      `${environment.apiUrl}/Transaction/WithFilters`,
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
      tocData: formattedDate as any, // Send as formatted string, not Date
      tocCutId,
      tocBraId
    };

    return this.http.post<GetTotaleCassaResponse[]>(
      `${environment.apiUrl}/TotaleCassa/GetTotaliCassa`,
      payload
    );
  }
}