import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RicercaService } from './ricerca.service';
import { 
  GetTransactionWithFiltersForGiornaleAntiriciclaggioRequest, 
  GetTransactionWithFiltersForGiornaleAntiriciclaggioResponse 
} from '../../report/domain/transaction.models';

/**
 * Ricerca Facade - Centralized API for ricerca feature
 */
@Injectable({
  providedIn: 'root',
})
export class RicercaFacade {
  constructor(private ricercaService: RicercaService) {}

  /**
   * Get transactions with filters for "Giornale Antiriciclaggio"
   * 
   * @param trxCassa - Transaction cash register identifier
   * @param trxLocalita - Transaction location
   * @param trxDataDal - Start date for transaction range
   * @param trxDataAl - End date for transaction range
   * @param trxReverse - Reverse transaction flag
   * @param trxCutId - Customer ID
   * @param trxOptId - Operator ID
   * @param trxDivope - Operation division
   * @param trxImpopeDA - Amount from
   * @param trxImpopeA - Amount to
   * @param arcAppName - Application name
   * @param arcForced - Forced flag
   * @returns Observable of transactions filtered for anti-money laundering journal
   */
  getTransactionWithFiltersForGiornaleAntiriciclaggio(
    trxCassa: string,
    trxLocalita: string,
    trxDataDal: Date,
    trxDataAl: Date,
    trxReverse: boolean,
    trxCutId: string,
    trxOptId: string,
    trxDivope: string,
    trxImpopeDA: number,
    trxImpopeA: number,
    arcAppName: string,
    arcForced: boolean
  ): Observable<GetTransactionWithFiltersForGiornaleAntiriciclaggioResponse[]> {
    const request: GetTransactionWithFiltersForGiornaleAntiriciclaggioRequest = {
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

    return this.ricercaService.getTransactionWithFiltersForGiornaleAntiriciclaggio(request);
  }
}
