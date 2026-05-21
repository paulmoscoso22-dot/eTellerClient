import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../services/api.service';
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
  constructor(private readonly apiService: ApiService) {}

  /**
   * Search operations with filters
   * 
   * @param request - Filter request containing search criteria
   * @returns Observable of operations matching the filters
   */
  searchOperazioni(
    request: RicercaOperazioniRequest
  ): Observable<RicercaOperazioniResponse[]> {
    return this.apiService.post<RicercaOperazioniResponse[]>('Vigilanza/TransactionsForGiornaleAntiriciclaggio', request);
  }
}
