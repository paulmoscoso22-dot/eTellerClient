import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RicercaOperazioniService } from './ricerca-operazioni.service';
import { 
  RicercaOperazioniRequest, 
  RicercaOperazioniResponse 
} from '../domain/ricerca-operazioni.models';

/**
 * Ricerca Operazioni Facade - Centralized API for operations search feature
 */
@Injectable({
  providedIn: 'root',
})
export class RicercaOperazioniFacade {
  constructor(private ricercaOperazioniService: RicercaOperazioniService) {}

  /**
   * Search operations with filters
   * 
   * @param trxCassa - Cash register ID
   * @param trxLocalita - Branch/Location ID
   * @param trxDataDal - Start date
   * @param trxDataAl - End date  
   * @param trxReverse - Show only reversed transactions
   * @param trxCutId - Currency type ID
   * @param trxOptId - Operation type ID
   * @param trxDivope - Currency ID
   * @param trxImpopeDA - Minimum amount
   * @param trxImpopeA - Maximum amount
   * @param arcAppName - Appearer name
   * @param arcForced - Show only forced surveillance transactions
   * @returns Observable of operations matching the filters
   */
  searchOperazioni(
    trxCassa: string,
    trxLocalita: string,
    trxDataDal: Date | null,
    trxDataAl: Date | null,
    trxReverse: boolean | null,
    trxCutId: string,
    trxOptId: string,
    trxDivope: string,
    trxImpopeDA: number | null,
    trxImpopeA: number | null,
    arcAppName: string,
    arcForced: boolean | null
  ): Observable<RicercaOperazioniResponse[]> {
    const request: RicercaOperazioniRequest = {
      trxCassa,
      trxLocalita,
      trxDataDal,
      trxDataAl,
      trxReverse,
      trxCutId,
      trxOptId,
      trxDivope,
      trxImpopeDA,
      trxImpopeA,
      arcAppName,
      arcForced
    };

    return this.ricercaOperazioniService.searchOperazioni(request);
  }
}
