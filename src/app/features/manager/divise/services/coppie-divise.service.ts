import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../services/api.service';
import {
  ICurrencyCouple,
  ICurrencyDv,
  InsertCurrencyCoupleRequest,
  UpdateCurrencyCoupleRequest
} from '../models/divisa.models';

@Injectable({ providedIn: 'root' })
export class CoppieDiviseService {
  private api = inject(ApiService);

  getAll(): Observable<ICurrencyCouple[]> {
    return this.api.post<ICurrencyCouple[]>('/CurrencyCouple/GetAll', {});
  }

  getByKey(cur1: string, cur2: string): Observable<ICurrencyCouple> {
    return this.api.get<ICurrencyCouple>(
      `/CurrencyCouple/GetByKey?cur1=${encodeURIComponent(cur1)}&cur2=${encodeURIComponent(cur2)}`
    );
  }

  getCurrenciesDV(): Observable<ICurrencyDv[]> {
    return this.api.post<ICurrencyDv[]>('/Currency/GetAllCurrencies', {});
  }

  insert(request: InsertCurrencyCoupleRequest): Observable<ICurrencyCouple> {
    return this.api.post<ICurrencyCouple>('/CurrencyCouple/Insert', request);
  }

  update(request: UpdateCurrencyCoupleRequest): Observable<ICurrencyCouple> {
    return this.api.put<ICurrencyCouple>('/CurrencyCouple/Update', request);
  }

  delete(cur1: string, cur2: string, traUser: string, traStation: string): Observable<boolean> {
    traUser = "127";
    traStation = "127";
    console.log(`Deleting currency couple: ${cur1} - ${cur2}, by user: ${traUser} at station: ${traStation}`);
    return this.api.delete<boolean>(
      `/CurrencyCouple/Delete?cur1=${encodeURIComponent(cur1)}&cur2=${encodeURIComponent(cur2)}&traUser=${encodeURIComponent(traUser)}&traStation=${encodeURIComponent(traStation)}`
    );
  }
}
