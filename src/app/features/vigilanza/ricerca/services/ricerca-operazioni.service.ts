import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { 
  RicercaOperazioniRequest, 
  RicercaOperazioniResponse 
} from '../domain/ricerca-operazioni.models';

/**
 * Ricerca Operazioni Service - API calls for operations search feature
 */
@Injectable({
  providedIn: 'root',
})
export class RicercaOperazioniService {
  constructor(private http: HttpClient) {}

  /**
   * Search operations with filters
   * 
   * @param request - Filter request containing search criteria
   * @returns Observable of operations matching the filters
   */
  searchOperazioni(
    request: RicercaOperazioniRequest
  ): Observable<RicercaOperazioniResponse[]> {
    return this.http.post<RicercaOperazioniResponse[]>(
      `${environment.apiUrl}/Vigilanza/TransactionsForGiornaleAntiriciclaggio`,
      request
    );
  }
}
