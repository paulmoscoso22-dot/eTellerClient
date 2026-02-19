import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { 
  GetTransactionWithFiltersForGiornaleAntiriciclaggioRequest, 
  GetTransactionWithFiltersForGiornaleAntiriciclaggioResponse 
} from '../../report/domain/transaction.models';

/**
 * Ricerca Service - API calls for ricerca feature
 */
@Injectable({
  providedIn: 'root',
})
export class RicercaService {
  constructor(private http: HttpClient) {}

  /**
   * Get transactions with filters for "Giornale Antiriciclaggio" (Anti-money laundering journal)
   * 
   * @param request - Filter request containing transaction search criteria
   * @returns Observable of transactions filtered for anti-money laundering journal
   */
  getTransactionWithFiltersForGiornaleAntiriciclaggio(
    request: GetTransactionWithFiltersForGiornaleAntiriciclaggioRequest
  ): Observable<GetTransactionWithFiltersForGiornaleAntiriciclaggioResponse[]> {
    return this.http.post<GetTransactionWithFiltersForGiornaleAntiriciclaggioResponse[]>(
      `${environment.transactionApiUrl}/WithFiltersForGiornaleAntiriciclaggio`,
      request
    );
  }
}
