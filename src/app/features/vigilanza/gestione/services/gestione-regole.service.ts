import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../services/api.service';
import {
  IAntirecRuleResponse,
  IAntirecRulesSearchParams,
  IInsertAntirecRuleRequest,
  IUpdateAntirecRuleRequest,
  IDeleteAntirecRuleRequest,
  IHistoryItem,
} from '../domain/gestione-regole.models';
import { IStOperationType } from '../../../../core/domain/stOperationType.domain';
import { ICurrencyType } from '../../../../core/domain/currencyType.domain';

@Injectable({
  providedIn: 'root',
})
export class GestioneRegoleService {
  private readonly api = inject(ApiService);

  getByParameters(request: IAntirecRulesSearchParams): Observable<IAntirecRuleResponse[]> {
    return this.api.post<IAntirecRuleResponse[]>('Vigilanza/GetSpAntirecRulesParameters', request);
  }

  getById(arlId: number): Observable<IAntirecRuleResponse> {
    return this.api.post<IAntirecRuleResponse>('Vigilanza/GetAntirecRulesById', { arlId });
  }

  insertRule(request: IInsertAntirecRuleRequest): Observable<number> {
    return this.api.put<number>('Vigilanza/InsertAntirecRule', request);
  }

  updateRule(request: IUpdateAntirecRuleRequest): Observable<boolean> {
    return this.api.put<boolean>('Vigilanza/UpdateAntirecRule', request);
  }

  deleteRule(request: IDeleteAntirecRuleRequest): Observable<boolean> {
    return this.api.deleteWithBody<boolean>('Vigilanza/DeleteAntirecRule', request);
  }

  getHistory(arlId: number): Observable<IHistoryItem[]> {
    return this.api.post<IHistoryItem[]>('Vigilanza/GetAntirecRulesHistory', { arlId });
  }

  /** Lookup: tipi operazione */
  getOperationTypes(): Observable<IStOperationType[]> {
    return this.api.post<IStOperationType[]>('manager/Tabelle/GetOperationTypes', {});
  }

  /** Lookup: tipi divisa */
  getCurrencyTypes(): Observable<ICurrencyType[]> {
    return this.api.post<ICurrencyType[]>('CurrencyType/GetCurrencyTypes', {});
  }
}
